from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.core.security import (
    get_current_user,
)

from backend.core.helpers import (
    handle_exception_securely,
    ensure_default_notifications,
)

router = APIRouter(
    tags=["Notifications"]
)


# --- Student Notifications ---

@router.get("/api/v1/student/{student_id}/notifications")
def get_student_notifications(student_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        notifications = db.execute(text("""
            SELECT notification_id, title, message, type, related_id, is_read, created_at
            FROM notifications
            WHERE student_id = :sid
            ORDER BY created_at DESC
        """), {"sid": student_id}).fetchall()
        return [
            {
                "notification_id": n.notification_id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "related_id": n.related_id,
                "is_read": n.is_read,
                "created_at": str(n.created_at)
            } for n in notifications
        ]
    finally:
        db.close()


@router.patch("/api/v1/student/notifications/{notification_id}/read")
def read_student_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = :nid AND student_id = :sid
        """), {"nid": notification_id, "sid": current_user["student_id"]})
        db.commit()
        return {"message": "Notification marked as read"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.patch("/api/v1/student/notifications/read-all")
def read_all_student_notifications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications SET is_read = TRUE WHERE student_id = :sid
        """), {"sid": current_user["student_id"]})
        db.commit()
        return {"message": "All notifications marked as read"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.delete("/api/v1/student/notifications/{notification_id}")
def delete_student_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            DELETE FROM notifications
            WHERE notification_id = :nid AND student_id = :sid
        """), {"nid": notification_id, "sid": current_user["student_id"]})
        db.commit()
        return {"success": True, "message": "Notification deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


# --- Faculty Notifications ---

@router.get("/api/v1/faculty/{faculty_id}/notifications")
def get_faculty_notifications(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        ensure_default_notifications(db, faculty_id)
        rows = db.execute(text("""
            SELECT notification_id, title, message, type, related_id, is_read, created_at
            FROM notifications
            WHERE faculty_id = :fid
            ORDER BY created_at DESC
        """), {"fid": faculty_id}).fetchall()
        return [
            {
                "notification_id": r.notification_id,
                "title": r.title,
                "message": r.message,
                "type": r.type,
                "related_id": r.related_id,
                "is_read": bool(r.is_read),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in rows
        ]
    finally:
        db.close()


@router.patch("/api/v1/faculty/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications SET is_read = TRUE
            WHERE notification_id = :nid AND faculty_id = :fid
        """), {"nid": notification_id, "fid": current_user["faculty_id"]})
        db.commit()
        return {"success": True}
    finally:
        db.close()


@router.patch("/api/v1/faculty/{faculty_id}/notifications/read-all")
def mark_all_notifications_read(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications SET is_read = TRUE WHERE faculty_id = :fid
        """), {"fid": faculty_id})
        db.commit()
        return {"success": True}
    finally:
        db.close()


@router.delete("/api/v1/faculty/notifications/{notification_id}")
def delete_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            DELETE FROM notifications
            WHERE notification_id = :nid AND faculty_id = :fid
        """), {"nid": notification_id, "fid": current_user["faculty_id"]})
        db.commit()
        return {"success": True}
    finally:
        db.close()