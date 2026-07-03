import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy import text

from backend.database import SessionLocal


def verify_faculty_access(db, faculty_id: int, class_id: int, subject_id: Optional[int] = None):
    # Lookup faculty institution
    f = db.execute(
        text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).fetchone()
    # Lookup class institution
    c = db.execute(
        text("SELECT institution_id FROM classes WHERE class_id = :cid"),
        {"cid": class_id}
    ).fetchone()
    
    if not f or not c or f.institution_id != c.institution_id:
        raise HTTPException(status_code=403, detail="Access denied: Faculty and Class institution mismatch.")

    if subject_id:
        query = text("""
            SELECT 1 FROM faculty_assignments 
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """)
        res = db.execute(query, {"fid": faculty_id, "cid": class_id, "sid": subject_id}).fetchone()
    else:
        query = text("""
            SELECT 1 FROM faculty_assignments 
            WHERE faculty_id = :fid AND class_id = :cid
        """)
        res = db.execute(query, {"fid": faculty_id, "cid": class_id}).fetchone()
    
    if not res:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this class or subject.")

def verify_student_access(current_user: dict, student_id: int):
    db = SessionLocal()
    try:
        # Verify student belongs to user's institution
        student = db.execute(
            text("SELECT institution_id FROM students WHERE student_id = :sid"),
            {"sid": student_id}
        ).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found.")
        if student.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Student belongs to another institution.")
        
        if current_user["role"] == "admin":
            return
        if current_user["role"] == "faculty":
            query = text("""
                SELECT 1 FROM enrollments e
                JOIN faculty_assignments fa ON e.class_id = fa.class_id
                WHERE fa.faculty_id = :fid AND e.student_id = :sid
            """)
            res = db.execute(query, {"fid": current_user["faculty_id"], "sid": student_id}).fetchone()
            if not res:
                raise HTTPException(status_code=403, detail="Access denied: Student not in your classes.")
            return
        if current_user["role"] == "student":
            if current_user["student_id"] != student_id:
                raise HTTPException(status_code=403, detail="Access denied: You can only access your own data.")
    finally:
        db.close()