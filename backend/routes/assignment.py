from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.assignment import *
from backend.schemas.student import StudentSubmissionInput

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
    log_faculty_activity,
    create_notification,
)

router = APIRouter(
    tags=["Assignments"]
)
@router.get("/api/assignments")
@router.get("/assignments")
def get_assignments(class_id: int, subject_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        if current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id, subject_id)
        elif current_user["role"] == "student":
            q = text("SELECT 1 FROM enrollments WHERE student_id = :sid AND class_id = :cid")
            res = db.execute(q, {"sid": current_user["student_id"], "cid": class_id}).fetchone()
            if not res:
                raise HTTPException(status_code=403, detail="Access denied")
                
        assignments = db.execute(text("""
            SELECT a.*, 
                   COALESCE(sub_stats.submitted_count, 0) AS submitted_count,
                   COALESCE(sub_stats.total_count, 0) AS total_count
            FROM assignments a
            LEFT JOIN (
                SELECT assignment_id, 
                       COUNT(submission_id) FILTER (WHERE status IN ('Submitted', 'Late', 'Graded')) AS submitted_count,
                       COUNT(submission_id) AS total_count
                FROM assignment_submissions
                GROUP BY assignment_id
            ) sub_stats ON a.assignment_id = sub_stats.assignment_id
            WHERE a.class_id = :cid AND a.subject_id = :sid
            ORDER BY a.created_at DESC
        """), {"cid": class_id, "sid": subject_id}).fetchall()
        
        results = []
        for a in assignments:
            if current_user["role"] == "student" and (a.status == "Draft" or a.status is None):
                continue
            results.append({
                "assignment_id": a.assignment_id,
                "subject_id": a.subject_id,
                "class_id": a.class_id,
                "title": a.title,
                "description": a.description,
                "instructions": a.instructions if hasattr(a, 'instructions') else None,
                "due_date": str(a.due_date),
                "total_marks": a.total_marks,
                "due_time": a.due_time if hasattr(a, 'due_time') and a.due_time else "23:59",
                "attachment_url": a.attachment_url if hasattr(a, 'attachment_url') else None,
                "attachment_name": a.attachment_name if hasattr(a, 'attachment_name') else None,
                "attachment_type": a.attachment_type if hasattr(a, 'attachment_type') else None,
                "attachment_size": a.attachment_size if hasattr(a, 'attachment_size') else None,
                "status": a.status if hasattr(a, 'status') and a.status else "Published",
                "created_at": str(a.created_at),
                "submitted_count": int(a.submitted_count) if hasattr(a, 'submitted_count') else 0,
                "total_count": int(a.total_count) if hasattr(a, 'total_count') else 0
            })
        return results
    finally:
        db.close()

@router.post("/api/assignments")
@router.post("/assignments")
def create_assignment(data: AssignmentCreateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, data.class_id, data.subject_id)
        
        status = data.status or "Published"
            
        new_id = db.execute(text("""
            INSERT INTO assignments (subject_id, class_id, title, description, due_date, total_marks, due_time, 
                                     attachment_url, attachment_name, attachment_type, attachment_size, instructions, status, created_at)
            VALUES (:sid, :cid, :title, :desc, :due, :marks, :due_time, 
                    :attachment_url, :attachment_name, :attachment_type, :attachment_size, :instructions, :status, CURRENT_TIMESTAMP)
            RETURNING assignment_id
        """), {
            "sid": data.subject_id,
            "cid": data.class_id,
            "title": data.title,
            "desc": data.description,
            "due": data.due_date,
            "marks": data.total_marks,
            "due_time": data.due_time or "23:59",
            "attachment_url": data.attachment_url,
            "attachment_name": data.attachment_name,
            "attachment_type": data.attachment_type,
            "attachment_size": data.attachment_size,
            "instructions": data.instructions,
            "status": status
        }).scalar()
        
        # Seed default pending submissions for all students in this class and notify them if published
        if status == "Published":
            students = db.execute(text("""
                SELECT s.student_id FROM students s
                JOIN enrollments e ON s.student_id = e.student_id
                WHERE e.class_id = :cid
            """), {"cid": data.class_id}).fetchall()
            
            for s in students:
                db.execute(text("""
                    INSERT INTO assignment_submissions (assignment_id, student_id, status)
                    VALUES (:aid, :sid, 'Pending')
                """), {"aid": new_id, "sid": s.student_id})
                
                create_notification(
                    db,
                    "student",
                    s.student_id,
                    "New Assignment Published",
                    f"A new assignment '{data.title}' has been published. Due: {data.due_date}",
                    "assignment",
                    new_id
                )
            
            log_faculty_activity(db, faculty_id, "published", "assignment", f"Published new assignment '{data.title}'.", new_id)
            create_notification(db, "faculty", faculty_id, "Assignment Published", f"New assignment '{data.title}' has been published.", "assignment", new_id)
        else:
            log_faculty_activity(db, faculty_id, "created", "assignment", f"Created draft assignment '{data.title}'.", new_id)
            create_notification(db, "faculty", faculty_id, "Assignment Created", f"Draft assignment '{data.title}' has been created.", "assignment", new_id)
            
        db.commit()
        log_audit(db, "CREATE_ASSIGNMENT", "Assignment", new_id, f"Faculty {faculty_id}")
        return {"message": "Assignment created successfully", "assignment_id": new_id}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/assignments/{assignment_id}")
@router.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: int, data: AssignmentCreateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        # Check assignment exists
        assign = db.execute(text("SELECT class_id, subject_id, status, title, due_date FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, assign.class_id, assign.subject_id)
        
        old_status = assign.status
        new_status = data.status or "Published"
        transition_to_published = (old_status == "Draft" and new_status == "Published")
            
        db.execute(text("""
            UPDATE assignments
            SET title = :title, description = :desc, due_date = :due, total_marks = :marks, due_time = :due_time, 
                attachment_url = :attachment_url, attachment_name = :attachment_name, attachment_type = :attachment_type, 
                attachment_size = :attachment_size, instructions = :instructions, status = :status
            WHERE assignment_id = :id
        """), {
            "title": data.title,
            "desc": data.description,
            "due": data.due_date,
            "marks": data.total_marks,
            "due_time": data.due_time or "23:59",
            "attachment_url": data.attachment_url,
            "attachment_name": data.attachment_name,
            "attachment_type": data.attachment_type,
            "attachment_size": data.attachment_size,
            "instructions": data.instructions,
            "status": new_status,
            "id": assignment_id
        })
        
        students = db.execute(text("""
            SELECT s.student_id FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
        """), {"cid": assign.class_id}).fetchall()
        
        if transition_to_published:
            db.execute(text("DELETE FROM assignment_submissions WHERE assignment_id = :aid"), {"aid": assignment_id})
            for s in students:
                db.execute(text("""
                    INSERT INTO assignment_submissions (assignment_id, student_id, status)
                    VALUES (:aid, :sid, 'Pending')
                """), {"aid": assignment_id, "sid": s.student_id})
                
                create_notification(
                    db,
                    "student",
                    s.student_id,
                    "New Assignment Published",
                    f"A new assignment '{data.title}' has been published. Due: {data.due_date}",
                    "assignment",
                    assignment_id
                )
            log_faculty_activity(db, faculty_id, "published", "assignment", f"Published assignment '{data.title}' (previously draft).", assignment_id)
            create_notification(db, "faculty", faculty_id, "Assignment Published", f"Assignment '{data.title}' has been published.", "assignment", assignment_id)
        else:
            if old_status == "Published":
                for s in students:
                    if str(assign.due_date) != str(data.due_date):
                        create_notification(
                            db,
                            "student",
                            s.student_id,
                            "Assignment Due Date Changed",
                            f"Due date for '{data.title}' has been updated to {data.due_date}.",
                            "assignment",
                            assignment_id
                        )
                    else:
                        create_notification(
                            db,
                            "student",
                            s.student_id,
                            "Assignment Updated",
                            f"Assignment '{data.title}' details have been updated.",
                            "assignment",
                            assignment_id
                        )
            
            log_faculty_activity(db, faculty_id, "updated", "assignment", f"Updated assignment '{data.title}'.", assignment_id)
            create_notification(db, "faculty", faculty_id, "Assignment Updated", f"Assignment '{data.title}' has been updated.", "assignment", assignment_id)

        db.commit()
        log_audit(db, "UPDATE_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {faculty_id}")
        return {"message": "Assignment updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/assignments/{assignment_id}")
@router.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: int, faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id, title FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        fid = current_user["faculty_id"] if current_user["role"] == "faculty" else faculty_id
        verify_faculty_access(db, fid, assign.class_id, assign.subject_id)
            
        db.execute(text("DELETE FROM assignment_submissions WHERE assignment_id = :id"), {"id": assignment_id})
        db.execute(text("DELETE FROM assignments WHERE assignment_id = :id"), {"id": assignment_id})
        
        log_faculty_activity(db, fid, "deleted", "assignment", f"Deleted assignment '{assign.title}'.", assignment_id)
        db.commit()
        log_audit(db, "DELETE_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {fid}")
        return {"message": "Assignment deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.post("/api/assignments/{assignment_id}/close")
@router.post("/assignments/{assignment_id}/close")
def close_assignment(assignment_id: int, data: CloseAssignmentInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id, title FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, assign.class_id, assign.subject_id)
        
        db.execute(text("UPDATE assignments SET status = 'Closed' WHERE assignment_id = :id"), {"id": assignment_id})
        
        students = db.execute(text("""
            SELECT s.student_id FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
        """), {"cid": assign.class_id}).fetchall()
        
        for s in students:
            create_notification(
                db,
                "student",
                s.student_id,
                "Assignment Closed",
                f"Submission intake for '{assign.title}' has been closed.",
                "assignment",
                assignment_id
            )
            
        log_faculty_activity(db, faculty_id, "closed", "assignment", f"Closed assignment '{assign.title}'.", assignment_id)
        create_notification(db, "faculty", faculty_id, "Assignment Closed", f"Submission intake closed for '{assign.title}'.", "assignment", assignment_id)
        db.commit()
        log_audit(db, "CLOSE_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {faculty_id}")
        return {"message": "Assignment closed successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.post("/api/assignments/{assignment_id}/reopen")
@router.post("/assignments/{assignment_id}/reopen")
def reopen_assignment(assignment_id: int, data: CloseAssignmentInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id, title FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, assign.class_id, assign.subject_id)
        
        db.execute(text("UPDATE assignments SET status = 'Published' WHERE assignment_id = :id"), {"id": assignment_id})
        
        students = db.execute(text("""
            SELECT s.student_id FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
        """), {"cid": assign.class_id}).fetchall()
        
        for s in students:
            create_notification(
                db,
                "student",
                s.student_id,
                "Assignment Reopened",
                f"Submission intake for '{assign.title}' has been reopened.",
                "assignment",
                assignment_id
            )
            
        log_faculty_activity(db, faculty_id, "reopened", "assignment", f"Reopened assignment '{assign.title}'.", assignment_id)
        create_notification(db, "faculty", faculty_id, "Assignment Reopened", f"Submission intake reopened for '{assign.title}'.", "assignment", assignment_id)
        db.commit()
        log_audit(db, "REOPEN_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {faculty_id}")
        return {"message": "Assignment reopened successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/assignments/{assignment_id}/submissions")
@router.get("/assignments/{assignment_id}/submissions")
def get_assignment_submissions(assignment_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        if current_user["role"] == "student":
            raise HTTPException(status_code=403, detail="Access denied: Students cannot view all submissions.")
        elif current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], assign.class_id, assign.subject_id)

        submissions = db.execute(text("""
            SELECT asub.submission_id, asub.assignment_id, asub.student_id, asub.submission_url,
                   asub.submission_file_name, asub.submission_file_size, asub.external_url, asub.feedback,
                   asub.marks_obtained, asub.status, asub.submitted_at, s.full_name, s.roll_no
            FROM assignment_submissions asub
            JOIN students s ON asub.student_id = s.student_id
            WHERE asub.assignment_id = :aid
            ORDER BY s.roll_no
        """), {"aid": assignment_id}).fetchall()
        
        return [
            {
                "submission_id": s.submission_id,
                "assignment_id": s.assignment_id,
                "student_id": s.student_id,
                "submission_url": s.submission_url,
                "submission_file_name": s.submission_file_name if hasattr(s, 'submission_file_name') else None,
                "submission_file_size": s.submission_file_size if hasattr(s, 'submission_file_size') else None,
                "external_url": s.external_url if hasattr(s, 'external_url') else None,
                "feedback": s.feedback if hasattr(s, 'feedback') else None,
                "marks_obtained": s.marks_obtained,
                "status": s.status,
                "submitted_at": str(s.submitted_at) if s.submitted_at else None,
                "student_name": s.full_name,
                "roll_no": s.roll_no
            } for s in submissions
        ]
    finally:
        db.close()

@router.post("/api/assignments/{assignment_id}/submit")
@router.post("/assignments/{assignment_id}/submit")
def submit_assignment(assignment_id: int, data: StudentSubmissionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "student"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"] if current_user["role"] == "student" else data.student_id
    if current_user["role"] == "student" and student_id != data.student_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot submit for another student")

    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT status, due_date, due_time FROM assignments WHERE assignment_id = :aid"), {"aid": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
        if assign.status == "Draft":
            raise HTTPException(status_code=403, detail="Cannot submit work to a draft assignment")
        if assign.status == "Closed":
            raise HTTPException(status_code=403, detail="Submission intake is closed. You can no longer submit.")
            
        row = db.execute(text("""
            SELECT submission_id FROM assignment_submissions
            WHERE assignment_id = :aid AND student_id = :sid
        """), {"aid": assignment_id, "sid": student_id}).fetchone()
        
        status = "Submitted"
        try:
            due_dt_str = f"{assign.due_date} {assign.due_time or '23:59'}"
            due_dt = datetime.strptime(due_dt_str, "%Y-%m-%d %H:%M")
            if datetime.now() > due_dt:
                status = "Late"
        except Exception:
            if assign.due_date and datetime.now().date() > assign.due_date:
                status = "Late"
            
        if row:
            db.execute(text("""
                UPDATE assignment_submissions
                SET submission_url = :url, submission_file_name = :fname, submission_file_size = :fsize, 
                    external_url = :ext, status = :status, submitted_at = CURRENT_TIMESTAMP
                WHERE submission_id = :sid
            """), {
                "url": data.submission_url,
                "fname": data.submission_file_name,
                "fsize": data.submission_file_size,
                "ext": data.external_url,
                "status": status,
                "sid": row.submission_id
            })
        else:
            db.execute(text("""
                INSERT INTO assignment_submissions (assignment_id, student_id, submission_url, submission_file_name, submission_file_size, external_url, status, submitted_at)
                VALUES (:aid, :sid, :url, :fname, :fsize, :ext, :status, CURRENT_TIMESTAMP)
            """), {
                "aid": assignment_id,
                "sid": student_id,
                "url": data.submission_url,
                "fname": data.submission_file_name,
                "fsize": data.submission_file_size,
                "ext": data.external_url,
                "status": status
            })
        # Get faculty and student details for notification
        assign_details = db.execute(text("""
            SELECT a.title, fa.faculty_id, s.full_name 
            FROM assignments a
            LEFT JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
            LEFT JOIN students s ON s.student_id = :sid
            WHERE a.assignment_id = :aid
        """), {"aid": assignment_id, "sid": student_id}).fetchone()
        
        if assign_details and assign_details.faculty_id:
            create_notification(
                db,
                "faculty",
                assign_details.faculty_id,
                "Assignment Submitted",
                f"New submission from {assign_details.full_name or 'Student'} for '{assign_details.title}'.",
                "assignment",
                assignment_id
            )
            
        db.commit()
        return {"message": "Assignment work uploaded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        handle_exception_securely(db, e)