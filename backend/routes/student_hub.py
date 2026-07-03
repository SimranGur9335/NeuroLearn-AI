# backend/routes/student_hub.py
import os
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Union
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import text

from backend.database import SessionLocal
from backend.core.security import get_current_user, require_role
from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    get_current_academic_year,
    fetch_announcements_helper,
)

# Import all needed schemas
from backend.schemas.student import *
from backend.schemas.assignment import *
from backend.schemas.attendance import *
from backend.schemas.announcement import *

router = APIRouter(
    tags=["Student Hub"]
)


@router.get("/api/student-hub/dashboard-summary")
def get_student_hub_dashboard_summary(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    institution_id = current_user.get("institution_id")
    user_id = current_user["user_id"]
    
    db = SessionLocal()
    try:
        # Enrolled courses count
        courses_count = db.execute(text("""
            SELECT COUNT(DISTINCT fa.subject_id)
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN faculty_assignments fa ON c.class_id = fa.class_id
            WHERE e.student_id = :sid
        """), {"sid": student_id}).scalar() or 0
        
        # Pending assignments count
        pending_assignments = db.execute(text("""
            SELECT COUNT(*) 
            FROM assignment_submissions 
            WHERE student_id = :sid AND status = 'Pending'
        """), {"sid": student_id}).scalar() or 0
        
        # Unread announcements count
        student = db.execute(text("SELECT department FROM students WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        dept = student.department if student else ""
        
        enrolled_classes = db.execute(text("SELECT class_id FROM enrollments WHERE student_id = :sid"), {"sid": student_id}).fetchall()
        class_ids = [c.class_id for c in enrolled_classes]
        if not class_ids:
            class_ids = [-1]
            
        unread_announcements = db.execute(text("""
            SELECT COUNT(DISTINCT a.announcement_id) FROM announcements a
            WHERE a.institution_id = :iid
              AND (
                a.target_type = 'Institution'
                OR (a.target_type = 'Department' AND a.target_id IN (
                    SELECT department_id FROM departments WHERE department_code = :dept OR department_name = :dept
                ))
                OR (a.target_type = 'Class' AND a.target_id IN :class_ids)
                OR (a.target_type = 'Student' AND a.target_id = :sid)
              )
              AND a.announcement_id NOT IN (
                SELECT announcement_id FROM announcement_reads WHERE user_id = :uid
              )
        """).bindparams(class_ids=tuple(class_ids)), {"sid": student_id, "dept": dept, "iid": institution_id, "uid": user_id}).scalar() or 0
        
        # Overall attendance and CGPA
        metrics = db.execute(text("SELECT attendance, predicted_cgpa FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        attendance_pct = float(metrics.attendance) if metrics and metrics.attendance else 0.0
        cgpa = float(metrics.predicted_cgpa) if metrics and metrics.predicted_cgpa else 0.0
        
        # Consolidated 5 recent activities
        activity_query = text("""
            SELECT type, title, description, timestamp FROM (
                SELECT 'assignment' as type, a.title as title, 'Submitted assignment' as description, sub.submitted_at as timestamp
                FROM assignment_submissions sub
                JOIN assignments a ON sub.assignment_id = a.assignment_id
                WHERE sub.student_id = :sid AND sub.status IN ('Submitted', 'Late', 'Graded') AND sub.submitted_at IS NOT NULL
                
                UNION ALL
                
                SELECT 'attendance' as type, COALESCE(s.subject_name, 'Class') as title, 'Marked ' || ar.status as description, CAST(ar.attendance_date AS TIMESTAMP) as timestamp
                FROM attendance_records ar
                LEFT JOIN subjects s ON ar.subject_id = s.subject_id
                WHERE ar.student_id = :sid
                
                UNION ALL
                
                SELECT 'grade' as type, s.subject_name as title, 'Marks updated: ' || sm.total_marks || ' (' || sm.grade || ')' as description, sm.updated_at as timestamp
                FROM student_marks sm
                JOIN subjects s ON sm.subject_id = s.subject_id
                WHERE sm.student_id = :sid AND (sm.is_published = TRUE OR sm.is_published IS NULL)
                
                UNION ALL
                
                SELECT 'announcement' as type, a.title as title, 'New announcement posted' as description, a.created_at as timestamp
                FROM announcements a
                WHERE a.institution_id = :iid
                  AND (
                    a.target_type = 'Institution'
                    OR (a.target_type = 'Department' AND a.target_id IN (
                        SELECT department_id FROM departments WHERE department_code = :dept OR department_name = :dept
                    ))
                    OR (a.target_type = 'Class' AND a.target_id IN :class_ids)
                    OR (a.target_type = 'Student' AND a.target_id = :sid)
                  )
            ) q
            ORDER BY timestamp DESC LIMIT 5
        """)
        
        activities_res = db.execute(activity_query.bindparams(class_ids=tuple(class_ids)), {
            "sid": student_id,
            "iid": institution_id,
            "dept": dept
        }).fetchall()
        
        activities = []
        for r in activities_res:
            activities.append({
                "type": r.type,
                "title": r.title,
                "description": r.description,
                "timestamp": str(r.timestamp)
            })
            
        return {
            "courses_count": courses_count,
            "pending_assignments": pending_assignments,
            "unread_announcements": unread_announcements,
            "attendance_pct": attendance_pct,
            "cgpa": cgpa,
            "activities": activities
        }
    finally:
        db.close()

@router.get("/api/student-hub/courses")
def get_student_hub_courses(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        courses = db.execute(text("""
            SELECT DISTINCT s.subject_name, s.subject_code, f.full_name as faculty_name, s.semester, s.credits
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN faculty_assignments fa ON c.class_id = fa.class_id
            JOIN subjects s ON fa.subject_id = s.subject_id
            JOIN faculty f ON fa.faculty_id = f.faculty_id
            WHERE e.student_id = :sid
            ORDER BY s.subject_name
        """), {"sid": student_id}).fetchall()
        
        return [
            {
                "subject_name": c.subject_name,
                "subject_code": c.subject_code,
                "faculty_name": c.faculty_name,
                "semester": c.semester,
                "credits": c.credits
            } for c in courses
        ]
    finally:
        db.close()

@router.get("/api/student-hub/assignments")
def get_student_hub_assignments(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        assignments = db.execute(text("""
            SELECT a.assignment_id, a.title, a.description, a.due_date, a.total_marks, a.instructions,
                   a.attachment_name, a.attachment_url, a.attachment_type, a.attachment_size, a.status AS assignment_status,
                   s.subject_name, s.subject_code,
                   sub.submission_url, sub.marks_obtained, sub.status, sub.submitted_at, sub.submission_id,
                   sub.submission_file_name, sub.submission_file_size, sub.external_url, sub.feedback,
                   f.full_name AS faculty_name, f.department AS faculty_department
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN assignments a ON c.class_id = a.class_id
            JOIN subjects s ON a.subject_id = s.subject_id
            LEFT JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
            LEFT JOIN faculty f ON fa.faculty_id = f.faculty_id
            LEFT JOIN assignment_submissions sub ON a.assignment_id = sub.assignment_id AND sub.student_id = :sid
            WHERE e.student_id = :sid AND (a.status != 'Draft' OR a.status IS NULL)
            ORDER BY a.due_date ASC
        """), {"sid": student_id}).fetchall()
        
        seen_ids = set()
        results = []
        for a in assignments:
            if a.assignment_id in seen_ids:
                continue
            seen_ids.add(a.assignment_id)
            results.append({
                "assignment_id": a.assignment_id,
                "title": a.title,
                "description": a.description,
                "instructions": a.instructions if hasattr(a, 'instructions') else None,
                "due_date": str(a.due_date),
                "total_marks": a.total_marks,
                "subject_name": a.subject_name,
                "subject_code": a.subject_code,
                "submission_url": a.submission_url,
                "submission_file_name": a.submission_file_name if hasattr(a, 'submission_file_name') else None,
                "submission_file_size": a.submission_file_size if hasattr(a, 'submission_file_size') else None,
                "external_url": a.external_url if hasattr(a, 'external_url') else None,
                "feedback": a.feedback if hasattr(a, 'feedback') else None,
                "marks_obtained": float(a.marks_obtained) if a.marks_obtained is not None else None,
                "status": a.status or "Pending",
                "submitted_at": str(a.submitted_at) if a.submitted_at else None,
                "submission_id": a.submission_id,
                "attachment_name": a.attachment_name if hasattr(a, 'attachment_name') else None,
                "attachment_url": a.attachment_url if hasattr(a, 'attachment_url') else None,
                "attachment_type": a.attachment_type if hasattr(a, 'attachment_type') else None,
                "attachment_size": a.attachment_size if hasattr(a, 'attachment_size') else None,
                "assignment_status": a.assignment_status if hasattr(a, 'assignment_status') else "Published",
                "faculty_name": a.faculty_name if hasattr(a, 'faculty_name') else "N/A",
                "faculty_department": a.faculty_department if hasattr(a, 'faculty_department') else "N/A"
            })
        return results
    finally:
        db.close()

@router.get("/api/student-hub/attendance")
def get_student_hub_attendance(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # 1. Overall attendance
        metrics = db.execute(text("SELECT attendance FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        overall_pct = float(metrics.attendance) if metrics and metrics.attendance else 0.0
        
        # 2. Subject-wise breakdown
        subjects = db.execute(text("""
            SELECT s.subject_name, s.subject_code, s.subject_id,
                   COUNT(CASE WHEN ar.status = 'Present' THEN 1 END) as present_count,
                   COUNT(ar.attendance_id) as total_count
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN faculty_assignments fa ON c.class_id = fa.class_id
            JOIN subjects s ON fa.subject_id = s.subject_id
            LEFT JOIN attendance_records ar ON ar.student_id = :sid AND ar.subject_id = s.subject_id
            WHERE e.student_id = :sid
            GROUP BY s.subject_name, s.subject_code, s.subject_id
            ORDER BY s.subject_name
        """), {"sid": student_id}).fetchall()
        
        subject_breakdown = []
        for s in subjects:
            pct = (s.present_count * 100.0 / s.total_count) if s.total_count > 0 else 100.0
            subject_breakdown.append({
                "subject_name": s.subject_name,
                "subject_code": s.subject_code,
                "present_count": s.present_count,
                "total_count": s.total_count,
                "percentage": round(pct, 2)
            })
            
        # 3. History
        history_res = db.execute(text("""
            SELECT ar.attendance_date, ar.status, s.subject_name, s.subject_code
            FROM attendance_records ar
            LEFT JOIN subjects s ON ar.subject_id = s.subject_id
            WHERE ar.student_id = :sid
            ORDER BY ar.attendance_date DESC
            LIMIT 50
        """), {"sid": student_id}).fetchall()
        
        history = [
            {
                "date": str(h.attendance_date),
                "status": h.status,
                "subject_name": h.subject_name or "General",
                "subject_code": h.subject_code or "GEN"
            } for h in history_res
        ]
        
        return {
            "overall_percentage": overall_pct,
            "subject_breakdown": subject_breakdown,
            "history": history
        }
    finally:
        db.close()

@router.get("/api/student-hub/grades")
def get_student_hub_grades(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        metrics = db.execute(text("SELECT predicted_cgpa FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        cgpa = float(metrics.predicted_cgpa) if metrics and metrics.predicted_cgpa else 0.0
        
        grades_res = db.execute(text("""
            SELECT sm.assignment_marks, sm.quiz_marks, sm.internal_marks, sm.practical_marks, sm.total_marks, sm.grade,
                   s.subject_name, s.subject_code, s.credits, s.semester
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN faculty_assignments fa ON c.class_id = fa.class_id
            JOIN subjects s ON fa.subject_id = s.subject_id
            LEFT JOIN student_marks sm ON sm.student_id = :sid AND sm.subject_id = s.subject_id
            WHERE e.student_id = :sid
            ORDER BY s.subject_name
        """), {"sid": student_id}).fetchall()
        
        subject_grades = []
        for g in grades_res:
            subject_grades.append({
                "subject_name": g.subject_name,
                "subject_code": g.subject_code,
                "credits": g.credits,
                "semester": g.semester,
                "assignment_marks": float(g.assignment_marks) if g.assignment_marks is not None else 0.0,
                "quiz_marks": float(g.quiz_marks) if g.quiz_marks is not None else 0.0,
                "internal_marks": float(g.internal_marks) if g.internal_marks is not None else 0.0,
                "practical_marks": float(g.practical_marks) if g.practical_marks is not None else 0.0,
                "total_marks": float(g.total_marks) if g.total_marks is not None else 0.0,
                "grade": g.grade or "-"
            })
            
        return {
            "cgpa": cgpa,
            "gpa": cgpa,
            "subject_grades": subject_grades
        }
    finally:
        db.close()

@router.get("/api/student-hub/announcements")
def get_student_hub_announcements_api(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return fetch_announcements_helper(db, current_user)
    finally:
        db.close()

@router.get("/api/student-hub/calendar")
def get_student_hub_calendar(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_id = current_user["student_id"]
    institution_id = current_user.get("institution_id")
    
    db = SessionLocal()
    try:
        events = []
        
        # 1. Academic calendar events
        cal_res = db.execute(text("""
            SELECT title, description, event_type, start_date, end_date
            FROM academic_calendar_events
            WHERE institution_id = :iid
            ORDER BY start_date ASC
        """), {"iid": institution_id}).fetchall()
        
        for e in cal_res:
            events.append({
                "title": e.title,
                "description": e.description or "",
                "event_type": e.event_type or "Academic",
                "start_date": str(e.start_date),
                "end_date": str(e.end_date) if e.end_date else str(e.start_date)
            })
            
        # 2. Assignment deadlines
        assign_res = db.execute(text("""
            SELECT a.title, a.description, a.due_date
            FROM enrollments e
            JOIN classes c ON e.class_id = c.class_id
            JOIN assignments a ON c.class_id = a.class_id
            WHERE e.student_id = :sid
            ORDER BY a.due_date ASC
        """), {"sid": student_id}).fetchall()
        
        for a in assign_res:
            events.append({
                "title": f"Due: {a.title}",
                "description": a.description or "",
                "event_type": "Assignment",
                "start_date": str(a.due_date),
                "end_date": str(a.due_date)
            })
            
        return events
    finally:
        db.close()

@router.get("/api/student-hub/notes")
def get_college_notes(
    semester: Optional[int] = None,
    subject_code: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        inst_id = current_user.get("institution_id", 1)
        query_str = "SELECT * FROM college_notes WHERE institution_id = :inst_id"
        params = {"inst_id": inst_id}
        
        if semester is not None:
            query_str += " AND semester = :semester"
            params["semester"] = semester
        if subject_code:
            query_str += " AND subject_code = :subject_code"
            params["subject_code"] = subject_code
        if search:
            query_str += " AND (LOWER(title) LIKE :search OR LOWER(description) LIKE :search OR LOWER(subject_name) LIKE :search OR LOWER(subject_code) LIKE :search)"
            params["search"] = f"%{search.lower()}%"
            
        query_str += " ORDER BY semester ASC, title ASC"
        res = db.execute(text(query_str), params).fetchall()
        
        notes = []
        for r in res:
            notes.append({
                "note_id": r.note_id,
                "title": r.title,
                "description": r.description,
                "semester": r.semester,
                "subject_code": r.subject_code,
                "subject_name": r.subject_name,
                "file_url": r.file_url,
                "file_name": r.file_name,
                "file_size": r.file_size,
                "download_count": r.download_count,
                "created_at": str(r.created_at) if r.created_at else None
            })
        return notes
    finally:
        db.close()

@router.post("/api/student-hub/notes/{note_id}/download")
def download_note(note_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        # Increment download_count
        db.execute(text("""
            UPDATE college_notes 
            SET download_count = download_count + 1 
            WHERE note_id = :nid
        """), {"nid": note_id})
        db.commit()
        return {"success": True}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

