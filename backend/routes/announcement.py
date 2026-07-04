from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.announcement import *

from backend.core.security import (
    require_role,
    get_current_user,
)

from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    fetch_announcements_helper,
    create_announcement_helper,
    update_announcement_helper,
    delete_announcement_helper,
)
from backend.services.notification_service import create_notification

router = APIRouter(
    tags=["Announcements"]
)


@router.get("/api/announcements")
def get_announcements(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return fetch_announcements_helper(db, current_user)
    finally:
        db.close()


@router.post("/api/announcements/{announcement_id}/read")
def mark_announcement_as_read(announcement_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        existing = db.execute(text("""
            SELECT 1 FROM announcement_reads 
            WHERE announcement_id = :aid AND user_id = :uid
        """), {"aid": announcement_id, "uid": user_id}).fetchone()

        if not existing:
            db.execute(text("""
                INSERT INTO announcement_reads (announcement_id, user_id, read_at)
                VALUES (:aid, :uid, CURRENT_TIMESTAMP)
            """), {"aid": announcement_id, "uid": user_id})
            db.commit()
        return {"success": True, "message": "Announcement marked as read"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/announcements/read-all")
def mark_all_announcements_as_read(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        announcements = fetch_announcements_helper(db, current_user)
        unread_ids = [a["announcement_id"] for a in announcements if not a["is_read"]]

        for aid in unread_ids:
            existing = db.execute(text("""
                SELECT 1 FROM announcement_reads 
                WHERE announcement_id = :aid AND user_id = :uid
            """), {"aid": aid, "uid": user_id}).fetchone()
            if not existing:
                db.execute(text("""
                    INSERT INTO announcement_reads (announcement_id, user_id, read_at)
                    VALUES (:aid, :uid, CURRENT_TIMESTAMP)
                """), {"aid": aid, "uid": user_id})
        db.commit()
        return {"success": True, "message": "All announcements marked as read", "count": len(unread_ids)}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/announcements")
def create_announcement(data: AnnouncementInput, current_user: dict = Depends(require_role(["admin", "faculty"]))):
    db = SessionLocal()
    try:
        new_id = create_announcement_helper(db, data, current_user)
        return {
            "message": "Announcement created successfully",
            "announcement_id": new_id
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.put("/api/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    data: AnnouncementInput,
    current_user: dict = Depends(require_role(["admin", "faculty"]))
):
    db = SessionLocal()
    try:
        update_announcement_helper(db, announcement_id, data, current_user)
        return {"message": "Announcement updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.delete("/api/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_user: dict = Depends(require_role(["admin", "faculty"]))
):
    db = SessionLocal()
    try:
        delete_announcement_helper(db, announcement_id, current_user)
        return {"message": "Announcement deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()