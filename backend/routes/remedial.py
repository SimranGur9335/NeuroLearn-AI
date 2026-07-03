from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from typing import Optional, List

from backend.database import SessionLocal
from backend.core.security import get_current_user, require_role
from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    log_faculty_activity,
    create_notification,
)
from backend.schemas.remedial import *

router = APIRouter(
    tags=["Remedial Sessions"]
)

# --- Remedial Reusable Helpers ---

def create_remedial_session_helper(db, payload: RemedialSessionCreateInput) -> int:
    # 1. Insert remedial session
    result = db.execute(
        text("""
        INSERT INTO remedial_sessions
        (
            faculty_id, class_id, subject_id, topic, description,
            session_date, session_time, location, status, created_at
        )
        VALUES
        (
            :faculty_id, :class_id, :subject_id, :topic, :description,
            :session_date, :session_time, :location, 'Active', CURRENT_TIMESTAMP
        )
        RETURNING session_id
        """),
        {
            "faculty_id": payload.faculty_id,
            "class_id": payload.class_id,
            "subject_id": payload.subject_id,
            "topic": payload.topic,
            "description": payload.description,
            "session_date": payload.session_date,
            "session_time": payload.session_time,
            "location": payload.location
        }
    )
    session_id = result.scalar()

    # 2. Insert invitations for each student
    for student_id in payload.student_ids:
        db.execute(
            text("""
            INSERT INTO remedial_invitations (session_id, student_id, status, created_at)
            VALUES (:session_id, :student_id, 'Invited', CURRENT_TIMESTAMP)
            """),
            {"session_id": session_id, "student_id": student_id}
        )

    # 3. Log activity and notification
    log_faculty_activity(payload.faculty_id, "remedial", "scheduled", f"Scheduled remedial session '{payload.topic}' for {payload.session_date}.", session_id, db=db)
    create_notification(db, "faculty", payload.faculty_id, "Remedial Class Scheduled", f"Remedial session '{payload.topic}' scheduled successfully.", "remedial", session_id)
    
    for student_id in payload.student_ids:
        create_notification(
            db,
            "student",
            student_id,
            "Remedial Session Scheduled",
            f"You have been scheduled for a remedial session: '{payload.topic}' on {payload.session_date} at {payload.session_time or 'TBA'}.",
            "remedial",
            session_id
        )
    return session_id


def update_remedial_session_helper(db, session_id: int, payload: RemedialSessionUpdateInput):
    # 1. Update session details
    db.execute(
        text("""
        UPDATE remedial_sessions
        SET class_id = :class_id,
            subject_id = :subject_id,
            topic = :topic,
            description = :description,
            session_date = :session_date,
            session_time = :session_time,
            location = :location
        WHERE session_id = :session_id
        """),
        {
            "class_id": payload.class_id,
            "subject_id": payload.subject_id,
            "topic": payload.topic,
            "description": payload.description,
            "session_date": payload.session_date,
            "session_time": payload.session_time,
            "location": payload.location,
            "session_id": session_id
        }
    )

    # 2. Sync invitations
    current_invites = db.execute(
        text("SELECT student_id FROM remedial_invitations WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchall()
    current_student_ids = {r.student_id for r in current_invites}
    new_student_ids = set(payload.student_ids)

    to_remove = current_student_ids - new_student_ids
    if to_remove:
        db.execute(
            text("DELETE FROM remedial_invitations WHERE session_id = :session_id AND student_id IN :sids"),
            {"session_id": session_id, "sids": tuple(to_remove)}
        )

    to_add = new_student_ids - current_student_ids
    for sid in to_add:
        db.execute(
            text("""
            INSERT INTO remedial_invitations (session_id, student_id, status, created_at)
            VALUES (:session_id, :student_id, 'Invited', CURRENT_TIMESTAMP)
            """),
            {"session_id": session_id, "student_id": sid}
        )

    # 3. Log activity and notification
    log_faculty_activity(payload.faculty_id, "remedial", "updated", f"Updated remedial session '{payload.topic}'.", session_id, db=db)
    create_notification(db, "faculty", payload.faculty_id, "Remedial Class Updated", f"Remedial session '{payload.topic}' was updated.", "remedial", session_id)
    
    for student_id in payload.student_ids:
        create_notification(
            db,
            "student",
            student_id,
            "Remedial Session Updated",
            f"Remedial session '{payload.topic}' has been updated. Date: {payload.session_date}, Time: {payload.session_time}, Location: {payload.location}.",
            "remedial",
            session_id
        )


def cancel_remedial_session_helper(db, session_id: int, faculty_id: int, cancellation_reason: Optional[str] = None):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session status and cancellation reason
    db.execute(
        text("""
        UPDATE remedial_sessions 
        SET status = 'Cancelled', cancellation_reason = :reason 
        WHERE session_id = :session_id
        """),
        {"session_id": session_id, "reason": cancellation_reason}
    )

    # 3. Update all invitation statuses to Cancelled
    db.execute(
        text("UPDATE remedial_invitations SET status = 'Cancelled' WHERE session_id = :session_id"),
        {"session_id": session_id}
    )

    # 4. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "cancelled", f"Cancelled remedial session '{topic}'. Reason: {cancellation_reason or 'None'}", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Cancelled", f"Remedial session '{topic}' was cancelled. Reason: {cancellation_reason or 'None'}", "remedial", session_id)
    
    invited_students = db.execute(
        text("SELECT student_id FROM remedial_invitations WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchall()
    for s in invited_students:
        create_notification(
            db,
            "student",
            s.student_id,
            "Remedial Session Cancelled",
            f"Remedial session '{topic}' has been cancelled. Reason: {cancellation_reason or 'None'}.",
            "remedial",
            session_id
        )


def start_remedial_session_helper(db, session_id: int, faculty_id: int):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session status to 'In Progress'
    db.execute(
        text("UPDATE remedial_sessions SET status = 'In Progress' WHERE session_id = :session_id"),
        {"session_id": session_id}
    )

    # 3. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "started", f"Started remedial session '{topic}'.", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Started", f"Remedial session '{topic}' is now in progress.", "remedial", session_id)


def complete_remedial_session_helper(db, session_id: int, faculty_id: int, outcome: str, remarks: str, recommendation: str):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session completion notes, status, and completed_at timestamp
    db.execute(
        text("""
        UPDATE remedial_sessions
        SET status = 'Completed',
            outcome = :outcome,
            remarks = :remarks,
            recommendation = :recommendation,
            completed_at = CURRENT_TIMESTAMP
        WHERE session_id = :session_id
        """),
        {
            "outcome": outcome,
            "remarks": remarks,
            "recommendation": recommendation,
            "session_id": session_id
        }
    )

    # 3. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "completed", f"Recorded completion notes for remedial session '{topic}'.", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Completed", f"Remedial session '{topic}' completion notes recorded.", "remedial", session_id)


# --- Remedial Endpoints ---

@router.post("/api/remedial/sessions")
@router.post("/remedial/sessions")
def create_remedial_session(payload: RemedialSessionCreateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        session_id = create_remedial_session_helper(db, payload)
        db.commit()
        return {
            "success": True,
            "session_id": session_id
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.put("/api/remedial/sessions/{session_id}")
@router.put("/remedial/sessions/{session_id}")
def update_remedial_session(session_id: int, payload: RemedialSessionUpdateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        update_remedial_session_helper(db, session_id, payload)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/remedial/sessions/{session_id}/cancel")
@router.post("/remedial/sessions/{session_id}/cancel")
def cancel_remedial_session(session_id: int, payload: CancelRemedialSessionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        cancel_remedial_session_helper(db, session_id, payload.faculty_id, payload.cancellation_reason)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/remedial/sessions/{session_id}/start")
@router.post("/remedial/sessions/{session_id}/start")
def start_remedial_session(session_id: int, payload: StartRemedialSessionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        start_remedial_session_helper(db, session_id, payload.faculty_id)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/remedial/sessions/{session_id}/complete")
@router.post("/remedial/sessions/{session_id}/complete")
def complete_remedial_session(session_id: int, payload: CompleteRemedialSessionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        complete_remedial_session_helper(db, session_id, payload.faculty_id, payload.outcome, payload.remarks, payload.recommendation)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/remedial/sessions")
@router.get("/remedial/sessions")
def get_remedial_sessions(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    if current_user["role"] == "faculty" and current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
            SELECT
                rs.session_id,
                rs.topic,
                rs.description,
                rs.session_date,
                rs.session_time,
                rs.class_id,
                rs.subject_id,
                rs.location,
                rs.status,
                rs.outcome,
                rs.remarks,
                rs.recommendation,
                rs.cancellation_reason,
                rs.completed_at,
                s.subject_name,
                c.class_name,
                f.full_name AS faculty_name,
                COALESCE((
                    SELECT string_agg(st.full_name, ', ')
                    FROM remedial_invitations ri
                    JOIN students st ON ri.student_id = st.student_id
                    WHERE ri.session_id = rs.session_id
                ), '') AS student_names
            FROM remedial_sessions rs
            JOIN subjects s ON rs.subject_id = s.subject_id
            JOIN classes c ON rs.class_id = c.class_id
            JOIN faculty f ON rs.faculty_id = f.faculty_id
            WHERE rs.faculty_id = :faculty_id
            ORDER BY rs.session_date DESC
            """),
            {"faculty_id": faculty_id}
        ).mappings().all()
        return [dict(r) for r in rows]
    finally:
        db.close()


@router.get("/api/remedial/sessions/{session_id}/invitations")
@router.get("/remedial/sessions/{session_id}/invitations")
def get_session_invitations(session_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
            SELECT
                ri.invitation_id,
                ri.student_id,
                ri.status,
                s.full_name AS student_name,
                s.roll_no,
                s.email
            FROM remedial_invitations ri
            JOIN students s ON ri.student_id = s.student_id
            WHERE ri.session_id = :session_id
            """),
            {"session_id": session_id}
        ).mappings().all()
        return [dict(r) for r in rows]
    finally:
        db.close()


@router.post("/api/remedial/invitations/{invitation_id}/status")
@router.post("/remedial/invitations/{invitation_id}/status")
def update_invitation_status(
    invitation_id: int,
    payload: InvitationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    db = SessionLocal()
    try:
        if current_user["role"] == "student":
            # Verify invitation belongs to student
            inv = db.execute(
                text("SELECT student_id FROM remedial_invitations WHERE invitation_id = :id"),
                {"id": invitation_id}
            ).fetchone()
            if not inv:
                raise HTTPException(status_code=404, detail="Invitation not found.")
            if inv.student_id != current_user["student_id"]:
                raise HTTPException(status_code=403, detail="Access denied: invitation mismatch")
        db.execute(
            text("""
            UPDATE remedial_invitations
            SET status = :status
            WHERE invitation_id = :invitation_id
            """),
            {
                "status": payload.status,
                "invitation_id": invitation_id
            }
        )
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()
