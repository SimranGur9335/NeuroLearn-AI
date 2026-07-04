import os
import re
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy import text
import logging
logger = logging.getLogger("neurolearn_api")

def log_audit(db, action: str, entity_type: str, entity_id: Optional[int] = None, performed_by: str = "Admin", institution_id: Optional[int] = None):
    try:
        if institution_id is None:
            # Try to infer from performed_by user
            if performed_by:
                match = re.search(r'(Admin|Faculty|Student|User|SuperAdmin|super_admin)\s+(\d+)', performed_by, re.I)
                if match:
                    u_id = int(match.group(2))
                    # Check users table
                    row = db.execute(text("SELECT institution_id FROM users WHERE user_id = :uid"), {"uid": u_id}).fetchone()
                    if row and row.institution_id:
                        institution_id = row.institution_id
            
            # If still None, try to infer from entity
            if institution_id is None and entity_id is not None:
                table_map = {
                    "student": "students",
                    "faculty": "faculty",
                    "class": "classes",
                    "course": "courses",
                    "subject": "subjects",
                    "department": "departments",
                    "announcement": "announcements"
                }
                tbl = table_map.get(entity_type.lower())
                if tbl:
                    pkey = "student_id" if tbl == "students" else ("faculty_id" if tbl == "faculty" else (tbl[:-1] + "_id" if tbl != "classes" else "class_id"))
                    try:
                        row = db.execute(text(f"SELECT institution_id FROM {tbl} WHERE {pkey} = :eid"), {"eid": entity_id}).fetchone()
                        if row and row.institution_id:
                            institution_id = row.institution_id
                    except Exception:
                        pass
        
        db.execute(
            text("""
                INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, institution_id, created_at)
                VALUES (:action, :entity_type, :entity_id, :performed_by, :institution_id, CURRENT_TIMESTAMP)
            """),
            {
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "performed_by": performed_by,
                "institution_id": institution_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error writing audit log: {e}")


def handle_exception_securely(db, e: Exception):
    db.rollback()
    if isinstance(e, HTTPException):
        raise e
    logger.exception("Database error occurred during endpoint execution")
    raise HTTPException(
        status_code=500,
        detail="An internal database error occurred. Please contact support."
    )


from backend.services.notification_service import log_faculty_activity, create_notification


def fetch_announcements_helper(db, current_user: dict):
    from backend.schemas.announcement import AnnouncementInput  # avoid circular import

    role = current_user["role"]
    iid = current_user.get("institution_id")

    if role == "admin":
        result = db.execute(
            text("SELECT * FROM announcements WHERE institution_id = :iid ORDER BY announcement_id DESC"),
            {"iid": iid}
        ).fetchall()

    elif role == "faculty":
        faculty_id = current_user["faculty_id"]
        faculty = db.execute(text("SELECT department FROM faculty WHERE faculty_id = :fid"), {"fid": faculty_id}).fetchone()
        dept = faculty.department if faculty else ""
        result = db.execute(text("""
            SELECT DISTINCT a.* FROM announcements a
            WHERE a.institution_id = :iid
              AND (
                a.target_type = 'Institution'
                OR (a.target_type = 'Faculty' AND (a.target_id IS NULL OR a.target_id = :fid))
                OR (a.target_type = 'Department' AND a.target_id IN (
                    SELECT department_id FROM departments WHERE department_name = :dept OR department_code = :dept
                ))
                OR (a.sender_type = 'faculty' AND a.sender_id = :fid)
              )
            ORDER BY a.announcement_id DESC
        """), {"fid": faculty_id, "dept": dept, "iid": iid}).fetchall()

    elif role == "student":
        student_id = current_user["student_id"]
        student = db.execute(text("SELECT department FROM students WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        dept = student.department if student else ""
        enrolled_classes = db.execute(text("SELECT class_id FROM enrollments WHERE student_id = :sid"), {"sid": student_id}).fetchall()
        class_ids = [c.class_id for c in enrolled_classes] or [-1]
        result = db.execute(
            text("""
                SELECT DISTINCT a.* FROM announcements a
                WHERE a.institution_id = :iid
                  AND (
                    a.target_type = 'Institution'
                    OR (a.target_type = 'Department' AND a.target_id IN (
                        SELECT department_id FROM departments WHERE department_code = :dept OR department_name = :dept
                    ))
                    OR (a.target_type = 'Class' AND a.target_id IN :class_ids)
                    OR (a.target_type = 'Student' AND a.target_id = :sid)
                  )
                ORDER BY a.announcement_id DESC
            """).bindparams(class_ids=tuple(class_ids)),
            {"sid": student_id, "dept": dept, "iid": iid}
        ).fetchall()
    else:
        result = []

    user_id = current_user["user_id"]
    reads = db.execute(text("SELECT announcement_id FROM announcement_reads WHERE user_id = :uid"), {"uid": user_id}).fetchall()
    read_set = {r.announcement_id for r in reads}

    announcements = []
    for r in result:
        sender_name = "System Administrator"
        if r.sender_type == "faculty":
            sender = db.execute(text("SELECT full_name FROM faculty WHERE faculty_id = :fid"), {"fid": r.sender_id}).fetchone()
            if sender:
                sender_name = sender.full_name
        announcements.append({
            "announcement_id": r.announcement_id,
            "title": r.title,
            "description": r.description,
            "sender_type": r.sender_type,
            "sender_id": r.sender_id,
            "sender_name": sender_name,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "created_at": str(r.created_at),
            "is_read": r.announcement_id in read_set,
            "priority": getattr(r, "priority", "Normal") or "Normal",
            "attachment_url": getattr(r, "attachment_url", None),
            "attachment_name": getattr(r, "attachment_name", None),
            "is_edited": bool(getattr(r, "is_edited", 0))
        })
    return announcements


def create_announcement_helper(db, data, current_user: dict):
    sender_type = current_user["role"]
    sender_id = current_user["faculty_id"] if sender_type == "faculty" else current_user["user_id"]
    iid = current_user["institution_id"]

    priority = getattr(data, "priority", "Normal") or "Normal"
    attachment_url = getattr(data, "attachment_url", None)
    attachment_name = getattr(data, "attachment_name", None)

    new_id = db.execute(text("""
        INSERT INTO announcements
        (title, description, sender_type, sender_id, target_type, target_id, institution_id, priority, attachment_url, attachment_name, is_edited, created_at)
        VALUES
        (:title, :description, :sender_type, :sender_id, :target_type, :target_id, :iid, :priority, :attachment_url, :attachment_name, 0, CURRENT_TIMESTAMP)
        RETURNING announcement_id
    """), {
        "title": data.title, "description": data.description,
        "sender_type": sender_type, "sender_id": sender_id,
        "target_type": data.target_type, "target_id": data.target_id,
        "iid": iid, "priority": priority,
        "attachment_url": attachment_url, "attachment_name": attachment_name
    }).scalar()
    db.commit()

    student_ids = []
    if data.target_type in ("Class", "class"):
        rows = db.execute(text("SELECT student_id FROM enrollments WHERE class_id = :cid"), {"cid": data.target_id}).fetchall()
        student_ids = [r.student_id for r in rows]
    elif data.target_type in ("All", "all", "Institution", "institution"):
        rows = db.execute(text("SELECT student_id FROM students WHERE institution_id = :iid"), {"iid": iid}).fetchall()
        student_ids = [r.student_id for r in rows]
    elif data.target_type in ("Department", "department"):
        dept_row = db.execute(text("SELECT department_name FROM departments WHERE department_id = :did"), {"did": data.target_id}).fetchone()
        if dept_row:
            rows = db.execute(text("SELECT student_id FROM students WHERE department = :dept AND institution_id = :iid"), {"dept": dept_row.department_name, "iid": iid}).fetchall()
            student_ids = [r.student_id for r in rows]

    sender_name = "System"
    if sender_type == "faculty":
        fac_row = db.execute(text("SELECT full_name FROM faculty WHERE faculty_id = :fid"), {"fid": sender_id}).fetchone()
        if fac_row:
            sender_name = fac_row.full_name

    for sid in student_ids:
        create_notification(db, "student", sid, "New Announcement", f"New announcement from {sender_name}: '{data.title}'", "announcement", new_id)

    if sender_type == "faculty":
        log_faculty_activity(db, sender_id, "posted", "announcement", f"Posted announcement '{data.title}'.", new_id)
        create_notification(db, "faculty", sender_id, "Announcement Published", f"Announcement '{data.title}' published successfully.", "announcement", new_id)

    log_audit(db, "CREATE", "Announcement", new_id, performed_by=f"{sender_type.capitalize()} {sender_id}")
    return new_id


def update_announcement_helper(db, announcement_id: int, data, current_user: dict):
    ann = db.execute(text("SELECT sender_type, sender_id, institution_id FROM announcements WHERE announcement_id = :id"), {"id": announcement_id}).fetchone()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.institution_id != current_user["institution_id"]:
        raise HTTPException(status_code=403, detail="Access denied: Announcement belongs to another institution")
    if current_user["role"] == "faculty":
        if ann.sender_type != "faculty" or ann.sender_id != current_user["faculty_id"]:
            raise HTTPException(status_code=403, detail="Access denied: You do not own this announcement")

    priority = getattr(data, "priority", "Normal") or "Normal"
    db.execute(text("""
        UPDATE announcements
        SET title = :title, description = :description, target_type = :target_type, target_id = :target_id,
            priority = :priority, attachment_url = :attachment_url, attachment_name = :attachment_name, is_edited = 1
        WHERE announcement_id = :announcement_id
    """), {
        "title": data.title, "description": data.description,
        "target_type": data.target_type, "target_id": data.target_id,
        "priority": priority, "attachment_url": getattr(data, "attachment_url", None),
        "attachment_name": getattr(data, "attachment_name", None),
        "announcement_id": announcement_id
    })
    db.commit()
    log_audit(db, "UPDATE", "Announcement", announcement_id, performed_by=f"{current_user['role'].capitalize()} {current_user['user_id']}")


def delete_announcement_helper(db, announcement_id: int, current_user: dict):
    ann = db.execute(text("SELECT sender_type, sender_id, institution_id FROM announcements WHERE announcement_id = :id"), {"id": announcement_id}).fetchone()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.institution_id != current_user["institution_id"]:
        raise HTTPException(status_code=403, detail="Access denied: Announcement belongs to another institution")
    if current_user["role"] == "faculty":
        if ann.sender_type != "faculty" or ann.sender_id != current_user["faculty_id"]:
            raise HTTPException(status_code=403, detail="Access denied: You do not own this announcement")

    db.execute(text("DELETE FROM announcements WHERE announcement_id = :id"), {"id": announcement_id})
    db.commit()
    log_audit(db, "DELETE", "Announcement", announcement_id, performed_by=f"{current_user['role'].capitalize()} {current_user['user_id']}")


def ensure_default_notifications(db, faculty_id: int):
    count = db.execute(
        text("SELECT COUNT(*) FROM notifications WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).scalar()
    if count > 0:
        return

    announcements = db.execute(text("""
        SELECT announcement_id, title, created_at FROM announcements
        WHERE sender_type = 'faculty' AND sender_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in announcements:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, 'Announcement Published', :msg, 'announcement', 'announcement', :rid, :rid, TRUE, :created)
        """), {"fid": faculty_id, "msg": f"Your announcement '{a.title}' was successfully broadcasted.", "rid": a.announcement_id, "created": a.created_at})

    remedials = db.execute(text("""
        SELECT session_id, topic, session_date FROM remedial_sessions WHERE faculty_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for r in remedials:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, 'Remedial Class Scheduled', :msg, 'remedial', 'remedial', :rid, :rid, FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day')
        """), {"fid": faculty_id, "msg": f"Support session for '{r.topic}' scheduled on {r.session_date}.", "rid": r.session_id})

    assignments = db.execute(text("""
        SELECT a.assignment_id, a.title, c.class_name, a.created_at FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
        WHERE fa.faculty_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in assignments:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, 'Assignment Created', :msg, 'assignment', 'assignment', :rid, :rid, FALSE, :created)
        """), {"fid": faculty_id, "msg": f"New assignment '{a.title}' published to {a.class_name}.", "rid": a.assignment_id, "created": a.created_at})

    classes = db.execute(text("SELECT DISTINCT class_id FROM faculty_assignments WHERE faculty_id = :fid"), {"fid": faculty_id}).fetchall()
    for c in classes:
        high_risk_count = db.execute(text("""
            SELECT COUNT(*) FROM student_metrics sm
            JOIN enrollments e ON sm.student_id = e.student_id
            WHERE e.class_id = :cid AND sm.risk_level = 'High'
        """), {"cid": c.class_id}).scalar() or 0
        if high_risk_count > 0:
            db.execute(text("""
                INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
                VALUES (:fid, 'High Risk Warning', :msg, 'risk', 'risk', :rid, :rid, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours')
            """), {"fid": faculty_id, "msg": f"{high_risk_count} students flagged as High Risk in your class.", "rid": c.class_id})

    attendance = db.execute(text("""
        SELECT DISTINCT class_id, subject_id, attendance_date FROM attendance_records
        WHERE faculty_id = :fid ORDER BY attendance_date DESC LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for att in attendance:
        c_name = db.execute(text("SELECT class_name FROM classes WHERE class_id = :cid"), {"cid": att.class_id}).scalar()
        s_name = db.execute(text("SELECT subject_name FROM subjects WHERE subject_id = :sid"), {"sid": att.subject_id}).scalar()
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, 'Attendance Recorded', :msg, 'attendance', 'attendance', :rid, :rid, TRUE, :created)
        """), {"fid": faculty_id, "msg": f"Attendance saved for {c_name} ({s_name}) on {att.attendance_date}.", "rid": att.class_id,
              "created": datetime.combine(att.attendance_date, datetime.min.time())})
    db.commit()


def ensure_default_activities(db, faculty_id: int):
    count = db.execute(
        text("SELECT COUNT(*) FROM faculty_activities WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).scalar()
    if count > 0:
        return

    attendance = db.execute(text("""
        SELECT DISTINCT class_id, subject_id, attendance_date FROM attendance_records
        WHERE faculty_id = :fid ORDER BY attendance_date DESC LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for att in attendance:
        c_name = db.execute(text("SELECT class_name FROM classes WHERE class_id = :cid"), {"cid": att.class_id}).scalar()
        s_name = db.execute(text("SELECT subject_name FROM subjects WHERE subject_id = :sid"), {"sid": att.subject_id}).scalar()
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'recorded', 'attendance', :details, :rid, :created)
        """), {"fid": faculty_id, "details": f"Recorded attendance for {c_name} - {s_name}.", "rid": att.class_id,
              "created": datetime.combine(att.attendance_date, datetime.min.time())})

    assignments = db.execute(text("""
        SELECT a.assignment_id, a.title, c.class_name, a.created_at FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
        WHERE fa.faculty_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in assignments:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'created', 'assignment', :details, :rid, :created)
        """), {"fid": faculty_id, "details": f"Created new assignment '{a.title}' for {a.class_name}.", "rid": a.assignment_id, "created": a.created_at})

    remedials = db.execute(text("""
        SELECT session_id, topic, session_date FROM remedial_sessions WHERE faculty_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for r in remedials:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'scheduled', 'remedial', :details, :rid, CURRENT_TIMESTAMP - INTERVAL '1 day')
        """), {"fid": faculty_id, "details": f"Scheduled a remedial session on '{r.topic}' for {r.session_date}.", "rid": r.session_id})

    announcements = db.execute(text("""
        SELECT announcement_id, title, created_at FROM announcements
        WHERE sender_type = 'faculty' AND sender_id = :fid LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in announcements:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'posted', 'announcement', :details, :rid, :created)
        """), {"fid": faculty_id, "details": f"Posted announcement '{a.title}' to the class bulletin board.", "rid": a.announcement_id, "created": a.created_at})
    db.commit()


DEFAULT_ACADEMIC_YEAR = os.getenv("DEFAULT_ACADEMIC_YEAR", "2026-2027")


def get_current_academic_year(db, institution_id: Optional[int] = None) -> str:
    try:
        iid = institution_id if institution_id is not None else 1
        row = db.execute(
            text("""
                SELECT academic_year 
                FROM academic_terms 
                WHERE institution_id = :iid 
                ORDER BY academic_year DESC 
                LIMIT 1
            """),
            {"iid": iid}
        ).fetchone()
        if row and row.academic_year:
            return row.academic_year
    except Exception as e:
        print(f"Error fetching current academic year from DB: {e}")
    return DEFAULT_ACADEMIC_YEAR


