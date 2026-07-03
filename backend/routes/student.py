from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.student import *

# Temporary imports from main.py (later we'll move these too)
from backend.main import (
    require_role,
    get_current_user,
    verify_student_access,
    log_audit,
    handle_exception_securely,
)

router = APIRouter(
    tags=["Students"]
)

# =====================================================
# Student CRUD
# =====================================================
@router.get("/api/students")
def get_students(current_user: dict = Depends(require_role(["admin", "faculty"]))):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM students WHERE institution_id = :iid ORDER BY student_id DESC"),
            {"iid": current_user["institution_id"]}
        )
        students = []
        for row in result:
            students.append({
                "student_id": row.student_id,
                "roll_no": row.roll_no,
                "full_name": row.full_name,
                "email": row.email,
                "department": row.department,
                "semester": row.semester,
                "division": row.division
            })
        return students
    finally:
        db.close()

@router.get("/api/students/{student_id}")
@router.get("/students/{student_id}")
def get_student_profile(student_id: int, current_user: dict = Depends(get_current_user)):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        student = db.execute(
            text("SELECT * FROM students WHERE student_id = :id"),
            {"id": student_id}
        ).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        enrollment = db.execute(
            text("""
                SELECT e.class_id, c.class_name, c.semester, c.division, c.department
                FROM enrollments e
                JOIN classes c ON e.class_id = c.class_id
                WHERE e.student_id = :student_id
                ORDER BY e.created_at DESC LIMIT 1
            """),
            {"student_id": student_id}
        ).fetchone()

        # Match assigned courses by student department and institution
        assigned_course = db.execute(
            text("SELECT * FROM courses WHERE department = :dept AND institution_id = :iid ORDER BY course_id LIMIT 1"),
            {"dept": student.department, "iid": current_user["institution_id"]}
        ).fetchone()

        return {
            "student_id": student.student_id,
            "roll_no": student.roll_no,
            "full_name": student.full_name,
            "email": student.email,
            "department": student.department,
            "semester": student.semester,
            "division": student.division,
            "enrollment": {
                "class_id": enrollment.class_id if enrollment else None,
                "class_name": enrollment.class_name if enrollment else "Not Enrolled",
                "course_id": assigned_course.course_id if assigned_course else None,
                "course_title": assigned_course.course_title if assigned_course else "No Course Assigned"
            }
        }
    finally:
        db.close()

@router.post("/api/students")
def create_student(data: StudentInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO students (roll_no, full_name, email, department, semester, division, institution_id, created_at)
                VALUES (:roll_no, :full_name, :email, :department, :semester, :division, :iid, CURRENT_TIMESTAMP)
                RETURNING student_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Student", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Student created successfully", "student_id": new_id}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/students/{student_id}")
@router.put("/students/{student_id}")
def update_student(student_id: int, data: StudentInput, current_user: dict = Depends(require_role(["admin"]))):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        db.execute(
            text("""
                UPDATE students
                SET roll_no = :roll_no, full_name = :full_name, email = :email,
                    department = :department, semester = :semester, division = :division
                WHERE student_id = :student_id
            """),
            {**data.dict(), "student_id": student_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Student", student_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Student updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/students/{student_id}")
@router.delete("/students/{student_id}")
def delete_student(student_id: int, current_user: dict = Depends(require_role(["admin"]))):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        db.execute(
            text("DELETE FROM enrollments WHERE student_id = :id"),
            {"id": student_id}
        )

        db.execute(
            text("DELETE FROM student_metrics WHERE student_id = :id"),
            {"id": student_id}
        )

        db.execute(
            text("DELETE FROM users WHERE student_id = :id"),
            {"id": student_id}
        )

        db.execute(
            text("DELETE FROM students WHERE student_id = :id"),
            {"id": student_id}
        )
        db.commit()
        log_audit(db, "DELETE", "Student", student_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Student deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()
# =====================================================
# Student Profile
# =====================================================

# =====================================================
# Student Hub
# =====================================================

# =====================================================
# Student Notifications
# =====================================================

# =====================================================
# Career
# =====================================================

# =====================================================
# Student Analytics
# =====================================================