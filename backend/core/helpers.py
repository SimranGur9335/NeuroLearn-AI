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