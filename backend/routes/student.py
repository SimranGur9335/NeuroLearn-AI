from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.student import *

from backend.core.security import require_role, get_current_user
from backend.core.access import verify_student_access
from backend.core.helpers import log_audit, handle_exception_securely

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
@router.get("/api/student/{student_id}/profile")
def get_student_profile_v1(student_id: int, current_user: dict = Depends(get_current_user)):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        student = db.execute(text("SELECT * FROM students WHERE student_id = :id"), {"id": student_id}).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        metrics = db.execute(text("SELECT * FROM student_metrics WHERE student_id = :id"), {"id": student_id}).fetchone()
        
        # Submissions summary
        submissions = db.execute(text("""
            SELECT status, COUNT(*) as count FROM assignment_submissions
            WHERE student_id = :id GROUP BY status
        """), {"id": student_id}).fetchall()
        sub_stats = {s.status: s.count for s in submissions}
        
        # Quizzes
        quizzes = db.execute(text("""
            SELECT qr.score, q.total_marks, q.quiz_title
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            WHERE qr.student_id = :id
        """), {"id": student_id}).fetchall()
        
        # Marks
        if current_user["role"] in ["admin", "faculty"]:
            marks = db.execute(text("""
                SELECT m.*, s.subject_name
                FROM student_marks m
                JOIN subjects s ON m.subject_id = s.subject_id
                WHERE m.student_id = :id
            """), {"id": student_id}).fetchall()
        else:
            marks = db.execute(text("""
                SELECT m.*, s.subject_name
                FROM student_marks m
                JOIN subjects s ON m.subject_id = s.subject_id
                WHERE m.student_id = :id AND (m.is_published = TRUE OR m.is_published IS NULL)
            """), {"id": student_id}).fetchall()
        
        # Risk predictions history
        risk_hist = db.execute(text("""
            SELECT risk_level, prediction_reason, created_at FROM risk_predictions
            WHERE student_id = :id ORDER BY created_at DESC LIMIT 5
        """), {"id": student_id}).fetchall()

        # Attendance history
        attendance_history = db.execute(text("""
            SELECT ar.attendance_date, ar.status, sub.subject_name
            FROM attendance_records ar
            JOIN subjects sub ON ar.subject_id = sub.subject_id
            WHERE ar.student_id = :id
            ORDER BY ar.attendance_date DESC
            LIMIT 15
        """), {"id": student_id}).fetchall()

        # Remedial invitations
        remedial_history = db.execute(text("""
            SELECT ri.status, rs.topic, rs.session_date, rs.session_time, rs.location
            FROM remedial_invitations ri
            JOIN remedial_sessions rs ON ri.session_id = rs.session_id
            WHERE ri.student_id = :id
            ORDER BY rs.session_date DESC
            LIMIT 15
        """), {"id": student_id}).fetchall()

        # Detailed Assignments List
        detailed_assignments = db.execute(text("""
            SELECT a.title, a.due_date, sub.status as submission_status, sub.submitted_at, sub.marks_obtained, a.total_marks
            FROM assignment_submissions sub
            JOIN assignments a ON sub.assignment_id = a.assignment_id
            WHERE sub.student_id = :id
            ORDER BY a.due_date DESC
        """), {"id": student_id}).fetchall()

        return {
            "student": {
                "student_id": student.student_id,
                "roll_no": student.roll_no,
                "full_name": student.full_name,
                "email": student.email,
                "department": student.department,
                "semester": student.semester,
                "division": student.division
            },
            "metrics": {
                "attendance": float(metrics.attendance) if metrics and metrics.attendance else 0.0,
                "quiz_score": float(metrics.quiz_score) if metrics and metrics.quiz_score else 0.0,
                "risk_level": metrics.risk_level if metrics else "Low",
                "predicted_cgpa": float(metrics.predicted_cgpa) if metrics and metrics.predicted_cgpa else 0.0,
                "xp_points": metrics.xp_points if metrics else 0,
                "faculty_notes": metrics.faculty_notes if metrics and hasattr(metrics, 'faculty_notes') and metrics.faculty_notes else "",
                "intervention_status": metrics.intervention_status if metrics and hasattr(metrics, 'intervention_status') and metrics.intervention_status else "Not Contacted"
            },
            "assignment_stats": {
                "submitted": sub_stats.get("Submitted", 0),
                "pending": sub_stats.get("Pending", 0),
                "late": sub_stats.get("Late", 0),
                "missing": sub_stats.get("Missing", 0)
            },
            "quizzes": [
                {
                    "title": q.quiz_title,
                     "score": float(q.score) if q.score else 0.0,
                    "total": q.total_marks
                } for q in quizzes
            ],
            "marks": [
                {
                    "subject": m.subject_name,
                    "assignments": float(m.assignment_marks),
                    "quizzes": float(m.quiz_marks),
                    "internal": float(m.internal_marks),
                    "practical": float(m.practical_marks),
                    "total": float(m.total_marks),
                    "grade": m.grade
                } for m in marks
            ],
            "risk_history": [
                {
                    "level": r.risk_level,
                    "reason": r.prediction_reason,
                    "date": str(r.created_at)
                } for r in risk_hist
            ],
            "attendance_history": [
                {
                    "date": str(a.attendance_date),
                    "status": a.status,
                    "subject": a.subject_name
                } for a in attendance_history
            ],
            "remedial_history": [
                {
                    "topic": r.topic,
                    "date": str(r.session_date),
                    "time": r.session_time,
                    "location": r.location,
                    "status": r.status
                } for r in remedial_history
            ],
            "detailed_assignments": [
                {
                    "title": da.title,
                    "due_date": str(da.due_date),
                    "status": da.submission_status,
                    "submitted_at": str(da.submitted_at) if da.submitted_at else None,
                    "marks_obtained": da.marks_obtained,
                    "total_marks": da.total_marks
                } for da in detailed_assignments
            ]
        }
    finally:
        db.close()