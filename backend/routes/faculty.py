from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.faculty import *

from backend.core.security import (
    require_role,
    get_current_user,
)

from backend.core.access import (
    verify_faculty_access,
)

from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
)

router = APIRouter(
    tags=["Faculty"]
)



@router.get("/api/faculty")
@router.get("/faculty")
def get_faculty(current_user: dict = Depends(require_role(["admin", "faculty"]))):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM faculty WHERE institution_id = :iid ORDER BY full_name"),
            {"iid": current_user["institution_id"]}
        )
        faculty = []
        for row in result:
            faculty.append({
                "faculty_id": row.faculty_id,
                "faculty_code": row.faculty_code,
                "full_name": row.full_name,
                "email": row.email,
                "department": row.department,
                "designation": row.designation
            })
        return faculty
    finally:
        db.close()

@router.get("/api/faculty/{faculty_id}")
@router.get("/faculty/{faculty_id}")
def get_faculty_profile(faculty_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT * FROM faculty WHERE faculty_id = :id"),
            {"id": faculty_id}
        ).fetchone()
        if not f:
            raise HTTPException(status_code=404, detail="Faculty not found.")
        if f.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
            
        assignments = db.execute(
            text("""
                SELECT fa.assignment_id, c.class_id, c.class_name, s.subject_id, s.subject_name, s.subject_code, fa.role, fa.academic_year
                FROM faculty_assignments fa
                JOIN classes c ON fa.class_id = c.class_id
                JOIN subjects s ON fa.subject_id = s.subject_id
                WHERE fa.faculty_id = :faculty_id
            """),
            {"faculty_id": faculty_id}
        ).fetchall()

        assigned_classes = []
        assigned_subjects = []
        seen_classes = set()
        seen_subjects = set()

        for row in assignments:
            if row.class_id not in seen_classes:
                seen_classes.add(row.class_id)
                assigned_classes.append({
                    "class_id": row.class_id,
                    "class_name": row.class_name
                })
            if row.subject_id not in seen_subjects:
                seen_subjects.add(row.subject_id)
                assigned_subjects.append({
                    "subject_id": row.subject_id,
                    "subject_code": row.subject_code,
                    "subject_name": row.subject_name
                })

        return {
            "faculty_id": f.faculty_id,
            "faculty_code": f.faculty_code,
            "full_name": f.full_name,
            "email": f.email,
            "department": f.department,
            "designation": f.designation,
            "assigned_classes": assigned_classes,
            "assigned_subjects": assigned_subjects,
            "assignments": [
                {
                    "assignment_id": r.assignment_id,
                    "class_name": r.class_name,
                    "subject_name": r.subject_name,
                    "subject_code": r.subject_code,
                    "role": r.role,
                    "academic_year": r.academic_year
                } for r in assignments
            ]
        }
    finally:
        db.close()

@router.post("/api/faculty")
def create_faculty(data: FacultyInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO faculty (faculty_code, full_name, email, department, designation, institution_id, created_at)
                VALUES (:faculty_code, :full_name, :email, :department, :designation, :iid, CURRENT_TIMESTAMP)
                RETURNING faculty_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Faculty", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Faculty created successfully", "faculty_id": new_id}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/faculty/{faculty_id}")
@router.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: int, data: FacultyInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).fetchone()
        if not f:
            raise HTTPException(status_code=404, detail="Faculty not found.")
        if f.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
            
        db.execute(
            text("""
                UPDATE faculty
                SET faculty_code = :faculty_code, full_name = :full_name, email = :email,
                    department = :department, designation = :designation
                WHERE faculty_id = :faculty_id
            """),
            {**data.dict(), "faculty_id": faculty_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Faculty", faculty_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Faculty updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/faculty/{faculty_id}")
@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).fetchone()
        if not f:
            raise HTTPException(status_code=404, detail="Faculty not found.")
        if f.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
            
        db.execute(text("DELETE FROM faculty_assignments WHERE faculty_id = :id"), {"id": faculty_id})
        db.execute(text("DELETE FROM users WHERE faculty_id = :id"), {"id": faculty_id})
        db.execute(text("DELETE FROM faculty WHERE faculty_id = :id"), {"id": faculty_id})
        db.commit()


        log_audit(db, "DELETE", "Faculty", faculty_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Faculty deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()