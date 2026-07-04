from typing import Optional
from sqlalchemy import text
from backend.database import SessionLocal

def log_faculty_activity(*args, **kwargs):
    """
    Flexible, backward-compatible activity logger.
    Supports:
      Old: log_faculty_activity(db, faculty_id, action, module, details, related_id=None)
      New: log_faculty_activity(faculty_id, module, action, details, related_id=None)
    """
    db = None
    faculty_id = None
    module = None
    action = None
    details = None
    related_id = None

    if len(args) >= 1:
        first = args[0]
        if isinstance(first, (int, float)) or (isinstance(first, str) and str(first).isdigit()):
            faculty_id = int(first)
            if len(args) >= 2: module = args[1]
            if len(args) >= 3: action = args[2]
            if len(args) >= 4: details = args[3]
            if len(args) >= 5: related_id = args[4]
            db = kwargs.get("db", None)
        else:
            db = first
            if len(args) >= 2: faculty_id = int(args[1])
            if len(args) >= 3: action = args[2]
            if len(args) >= 4: module = args[3]
            if len(args) >= 5: details = args[4]
            if len(args) >= 6: related_id = args[5]

    if "faculty_id" in kwargs: faculty_id = kwargs["faculty_id"]
    if "module" in kwargs: module = kwargs["module"]
    if "action" in kwargs: action = kwargs["action"]
    if "details" in kwargs: details = kwargs["details"]
    if "related_id" in kwargs: related_id = kwargs["related_id"]
    if "db" in kwargs and db is None: db = kwargs["db"]

    module_map = {
        "marks": "gradebook",
        "auth": "authentication",
        "announcement": "announcement",
    }
    if module in module_map:
        module = module_map[module]
    elif module == "risk":
        module = "student_monitoring" if (action and "intervention" in action.lower()) else "risk_prediction"

    opened_db = False
    if db is None:
        db = SessionLocal()
        opened_db = True

    try:
        db.execute(
            text("""
                INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
                VALUES (:faculty_id, :action, :module, :details, :related_id, CURRENT_TIMESTAMP)
            """),
            {
                "faculty_id": faculty_id,
                "action": action,
                "module": module,
                "details": details,
                "related_id": related_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error logging faculty activity: {e}")
        if opened_db:
            db.rollback()
    finally:
        if opened_db:
            db.close()


def create_notification(
    db,
    recipient_type: str,
    recipient_id: int,
    title: str,
    message: str,
    module: str,
    reference_id: Optional[int] = None
):
    try:
        faculty_id = recipient_id if recipient_type == "faculty" else None
        student_id = recipient_id if recipient_type == "student" else None

        db.execute(
            text("""
                INSERT INTO notifications (
                    faculty_id, student_id, title, message, type, module, related_id, reference_id, is_read, created_at
                ) VALUES (
                    :faculty_id, :student_id, :title, :message, :type, :module, :related_id, :reference_id, FALSE, CURRENT_TIMESTAMP
                )
            """),
            {
                "faculty_id": faculty_id,
                "student_id": student_id,
                "title": title,
                "message": message,
                "type": module,
                "module": module,
                "related_id": reference_id,
                "reference_id": reference_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error in create_notification: {e}")
        try:
            db.rollback()
        except Exception:
            pass
