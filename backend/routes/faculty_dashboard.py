# backend/routes/faculty_dashboard.py
import os
import json
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
    ensure_default_activities,
)
from backend.services.notification_service import log_faculty_activity, create_notification
from backend.core.access import verify_faculty_access

# Import all needed schemas
from backend.schemas.faculty import *
from backend.schemas.prediction import *
from backend.schemas.student import *


router = APIRouter(
    tags=["Faculty Dashboard"]
)

RISK_MODEL_VERSION = os.getenv("RISK_MODEL_VERSION", "Rule-Based V1.0")


@router.get("/api/faculty/{faculty_id}/classes")
def get_faculty_classes(
    faculty_id: int,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["faculty", "admin", "platform_admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if current_user["role"] == "faculty" and current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    db = SessionLocal()
    query = text("""
        SELECT c.class_id, c.class_name, s.subject_id, s.subject_name, fa.role
        FROM faculty_assignments fa
        JOIN classes c ON fa.class_id = c.class_id
        JOIN subjects s ON fa.subject_id = s.subject_id
        WHERE fa.faculty_id = :faculty_id
    """)
    result = db.execute(query, {"faculty_id": faculty_id})
    classes = []
    for row in result:
        classes.append({
            "class_id": row.class_id,
            "class_name": row.class_name,
            "subject_id": row.subject_id,
            "subject_name": row.subject_name,
            "role": row.role
        })
    db.close()
    return classes

@router.get("/api/class/{class_id}/students")
def get_class_students(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        if current_user["role"] == "student":
            enrolled = db.execute(
                text("SELECT 1 FROM enrollments WHERE student_id = :sid AND class_id = :cid"),
                {"sid": current_user["student_id"], "cid": class_id}
            ).fetchone()
            if not enrolled:
                raise HTTPException(status_code=403, detail="Unauthorized: Student not enrolled in this class")
        elif current_user["role"] == "faculty":
            verify_faculty_access(
                db,
                current_user["faculty_id"],
                class_id
            )

        query = text("""
            SELECT s.student_id, s.roll_no, s.full_name,
                   s.email, s.department,
                   s.semester, s.division
            FROM students s
            JOIN enrollments e
              ON s.student_id = e.student_id
            WHERE e.class_id = :class_id
            ORDER BY s.roll_no
        """)

        result = db.execute(
            query,
            {"class_id": class_id}
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

@router.get("/api/class/{class_id}/student-metrics")
def get_class_student_metrics(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        if current_user["role"] == "student":
            raise HTTPException(status_code=403, detail="Unauthorized: Students cannot view class metrics.")
        elif current_user["role"] == "faculty":
            verify_faculty_access(
                db,
                current_user["faculty_id"],
                class_id
            )

        query = text("""
            SELECT s.student_id, s.roll_no, s.full_name,
                   s.department, s.semester, s.division,
                   sm.attendance, sm.quiz_score,
                   sm.risk_level, sm.predicted_cgpa,
                   sm.xp_points,
                   rp.risk_score, rp.prediction_reason
            FROM students s
            JOIN enrollments e
                ON s.student_id = e.student_id
            JOIN student_metrics sm
                ON s.student_id = sm.student_id
            LEFT JOIN (
                SELECT rp1.student_id, rp1.risk_score, rp1.prediction_reason
                FROM risk_predictions rp1
                INNER JOIN (
                    SELECT student_id, MAX(created_at) as max_created
                    FROM risk_predictions
                    WHERE class_id = :class_id
                    GROUP BY student_id
                ) rp2 ON rp1.student_id = rp2.student_id AND rp1.created_at = rp2.max_created
                WHERE rp1.class_id = :class_id
            ) rp ON s.student_id = rp.student_id
            WHERE e.class_id = :class_id
            ORDER BY s.roll_no
        """)

        result = db.execute(
            query,
            {"class_id": class_id}
        )

        students = []

        for row in result:
            students.append({
                "student_id": row.student_id,
                "roll_no": row.roll_no,
                "full_name": row.full_name,
                "department": row.department,
                "semester": row.semester,
                "division": row.division,
                "attendance": float(row.attendance or 0),
                "quiz_score": float(row.quiz_score or 0),
                "risk_level": row.risk_level,
                "predicted_cgpa": float(row.predicted_cgpa or 0),
                "xp_points": row.xp_points or 0,
                "risk_score": float(row.risk_score) if row.risk_score is not None else None,
                "prediction_reason": row.prediction_reason
            })

        return students

    finally:
        db.close()

@router.get("/api/class/{class_id}/dashboard-summary")
def get_dashboard_summary(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    if current_user["role"] not in ["faculty", "admin"]:
        db.close()
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )

    if current_user["role"] == "faculty":
        verify_faculty_access(
            db,
            current_user["faculty_id"],
            class_id
        )
    query = text("""
        SELECT COUNT(*) AS total_students,
               ROUND(AVG(sm.attendance), 2) AS average_attendance,
               ROUND(AVG(sm.quiz_score), 2) AS average_quiz_score,
               SUM(CASE WHEN sm.risk_level = 'High' THEN 1 ELSE 0 END) AS high_risk,
               SUM(CASE WHEN sm.risk_level = 'Medium' THEN 1 ELSE 0 END) AS med_risk,
               SUM(CASE WHEN sm.risk_level = 'Low' THEN 1 ELSE 0 END) AS low_risk
        FROM enrollments e
        JOIN student_metrics sm ON e.student_id = sm.student_id
        WHERE e.class_id = :class_id
    """)
    result = db.execute(query, {"class_id": class_id}).fetchone()
    db.close()
    if not result or result.total_students == 0:
        return {
            "total_students": 0,
            "average_attendance": 0.0,
            "average_quiz_score": 0.0,
            "high_risk_students": 0,
            "medium_risk_students": 0,
            "low_risk_students": 0,
            "students_at_risk": 0
        }
    return {
        "total_students": result.total_students,
        "average_attendance": float(result.average_attendance or 0),
        "average_quiz_score": float(result.average_quiz_score or 0),
        "high_risk_students": result.high_risk or 0,
        "medium_risk_students": result.med_risk or 0,
        "low_risk_students": result.low_risk or 0,
        "students_at_risk": (result.high_risk or 0) + (result.med_risk or 0)
    }

@router.get("/api/faculty/{faculty_id}/workload")
def get_faculty_workload(faculty_id: int, current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    if role not in ["faculty", "admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    db = SessionLocal()
    try:
        # Check authorization
        if role == "faculty":
            if current_user.get("faculty_id") != faculty_id:
                raise HTTPException(status_code=403, detail="Access denied: You can only view your own workload.")
        elif role == "admin":
            f = db.execute(text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"), {"fid": faculty_id}).fetchone()
            if not f:
                raise HTTPException(status_code=404, detail="Faculty member not found")
            if f.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
                
        # Calculate Workload (Credit hours assigned and courses mapping)
        assignments = db.execute(
            text("""
                SELECT fa.role, s.credits, c.class_name, s.subject_name
                FROM faculty_assignments fa
                JOIN subjects s ON fa.subject_id = s.subject_id
                JOIN classes c ON fa.class_id = c.class_id
                WHERE fa.faculty_id = :faculty_id
            """),
            {"faculty_id": faculty_id}
        ).fetchall()
        
        total_classes = len(assignments)
        total_credits = sum([r.credits for r in assignments if r.credits])
        
        # Calculate workload status load tracker
        # Define workload load threshold e.g. 15 credits
        load_status = "Optimal"
        if total_credits > 16:
            load_status = "Overloaded"
        elif total_credits < 6 and total_credits > 0:
            load_status = "Underloaded"
        elif total_credits == 0:
            load_status = "None"
            
        return {
            "faculty_id": faculty_id,
            "total_classes": total_classes,
            "total_credits": total_credits,
            "workload_status": load_status,
            "details": [
                {
                    "class_name": r.class_name,
                    "subject_name": r.subject_name,
                    "credits": r.credits,
                    "role": r.role
                } for r in assignments
            ]
        }
    finally:
        db.close()

@router.get("/api/faculty/by-email/{email}")
def get_faculty_by_email(email: str, current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    if role not in ["faculty", "admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")
        
    if role == "faculty" and current_user.get("email") != email:
        raise HTTPException(status_code=403, detail="Access denied: You can only look up your own email.")
        
    db = SessionLocal()
    try:
        faculty = db.execute(
            text("SELECT * FROM faculty WHERE email = :email"),
            {"email": email}
        ).fetchone()
        
        if faculty and role == "admin":
            if faculty.institution_id is not None and faculty.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
                
        if not faculty:
            # If default demo account or specific domain, auto-create to ensure login flows
            if email == "faculty@neurolearn.ai":
                new_id = db.execute(
                    text("""
                        INSERT INTO faculty (faculty_code, full_name, email, department, designation, created_at)
                        VALUES ('FAC100', 'Dr. Alok Verma', 'faculty@neurolearn.ai', 'Computer Engineering', 'Professor & Head', NOW())
                        RETURNING faculty_id
                    """)
                ).scalar()
                db.commit()
                # Create assignments if missing
                db.execute(text("""
                    INSERT INTO faculty_assignments (faculty_id, class_id, subject_id, role, academic_year, created_at)
                    VALUES 
                    (:fid, 1, 1, 'Theory', :ay, NOW()),
                    (:fid, 2, 2, 'Theory', :ay, NOW()),
                    (:fid, 3, 3, 'Project Guide', :ay, NOW())
                    ON CONFLICT DO NOTHING
                """), {"fid": new_id, "ay": get_current_academic_year(db, 1)})
                db.commit()
                
                # Fetch created
                faculty = db.execute(
                    text("SELECT * FROM faculty WHERE faculty_id = :id"),
                    {"id": new_id}
                ).fetchone()
            else:
                raise HTTPException(status_code=404, detail="Faculty not found")
        
        return {
            "faculty_id": faculty.faculty_id,
            "faculty_code": faculty.faculty_code,
            "full_name": faculty.full_name,
            "email": faculty.email,
            "department": faculty.department,
            "designation": faculty.designation
        }
    finally:
        db.close()

@router.get("/api/faculty/mapping-audit")
def get_mapping_audit(current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        is_admin = current_user["role"] == "admin"
        iid = current_user.get("institution_id")
        
        # 1. Detect broken mappings (assignments pointing to deleted / missing records)
        broken_query = """
            SELECT fa.assignment_id, fa.faculty_id, fa.class_id, fa.subject_id
            FROM faculty_assignments fa
            LEFT JOIN faculty f ON fa.faculty_id = f.faculty_id
            LEFT JOIN classes c ON fa.class_id = c.class_id
            LEFT JOIN subjects s ON fa.subject_id = s.subject_id
            WHERE (f.faculty_id IS NULL OR c.class_id IS NULL OR s.subject_id IS NULL)
        """
        if is_admin:
            broken_query += " AND fa.institution_id = :iid"
            broken = db.execute(text(broken_query), {"iid": iid}).fetchall()
        else:
            broken = db.execute(text(broken_query)).fetchall()
            
        # 2. Detect duplicate mappings
        dup_query = """
            SELECT faculty_id, class_id, subject_id, academic_year, COUNT(*) as count
            FROM faculty_assignments
            {where_clause}
            GROUP BY faculty_id, class_id, subject_id, academic_year
            HAVING COUNT(*) > 1
        """
        if is_admin:
            dup_query = dup_query.format(where_clause="WHERE institution_id = :iid")
            duplicates = db.execute(text(dup_query), {"iid": iid}).fetchall()
        else:
            dup_query = dup_query.format(where_clause="")
            duplicates = db.execute(text(dup_query)).fetchall()
            
        # 3. Detect orphan records in tables referencing deleted faculty
        orphan_query = """
            SELECT a.assignment_id, a.title, a.class_id, a.subject_id
            FROM assignments a
            LEFT JOIN classes c ON a.class_id = c.class_id
            LEFT JOIN subjects s ON a.subject_id = s.subject_id
            WHERE (c.class_id IS NULL OR s.subject_id IS NULL)
        """
        if is_admin:
            orphan_query += " AND a.institution_id = :iid"
            orphans = db.execute(text(orphan_query), {"iid": iid}).fetchall()
        else:
            orphans = db.execute(text(orphan_query)).fetchall()

        broken_report = [
            {"assignment_id": b.assignment_id, "faculty_id": b.faculty_id, "class_id": b.class_id, "subject_id": b.subject_id}
            for b in broken
        ]
        duplicate_report = [
            {"faculty_id": d.faculty_id, "class_id": d.class_id, "subject_id": d.subject_id, "academic_year": d.academic_year, "count": d.count}
            for d in duplicates
        ]
        orphan_report = [
            {"assignment_id": o.assignment_id, "title": o.title, "class_id": o.class_id, "subject_id": o.subject_id}
            for o in orphans
        ]
        
        # Fix automatically broken mapping rows by deleting them
        if broken_report:
            for b in broken_report:
                if is_admin:
                    db.execute(text("DELETE FROM faculty_assignments WHERE assignment_id = :id AND institution_id = :iid"), {"id": b["assignment_id"], "iid": iid})
                else:
                    db.execute(text("DELETE FROM faculty_assignments WHERE assignment_id = :id"), {"id": b["assignment_id"]})
            db.commit()
            
        return {
            "status": "success",
            "broken_mappings_found": len(broken_report),
            "broken_mappings": broken_report,
            "duplicate_mappings_found": len(duplicate_report),
            "duplicate_mappings": duplicate_report,
            "orphan_records_found": len(orphan_report),
            "orphan_records": orphan_report,
            "actions_applied": "Removed broken assignments rows." if broken_report else "None"
        }
    finally:
        db.close()

@router.get("/api/faculty/{faculty_id}/students")
def get_faculty_students(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["faculty", "admin", "platform_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "faculty" and current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied: Faculty ID mismatch")
    db = SessionLocal()
    try:
        # Get all classes assigned to faculty
        classes = db.execute(text("""
            SELECT class_id FROM faculty_assignments WHERE faculty_id = :fid
        """), {"fid": faculty_id}).fetchall()
        
        class_ids = [c.class_id for c in classes]
        if not class_ids:
            return []
            
        # Get students in these classes
        students = db.execute(text("""
            SELECT DISTINCT s.student_id, s.roll_no, s.full_name, s.department, s.semester, s.division,
                   sm.attendance, sm.quiz_score, sm.risk_level, sm.predicted_cgpa, sm.xp_points,
                   sm.faculty_notes, sm.intervention_status
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            LEFT JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
            ORDER BY s.roll_no
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
        return [
            {
                "student_id": row.student_id,
                "roll_no": row.roll_no,
                "full_name": row.full_name,
                "department": row.department,
                "semester": row.semester,
                "division": row.division,
                "attendance": float(row.attendance) if row.attendance else 0.0,
                "quiz_score": float(row.quiz_score) if row.quiz_score else 0.0,
                "risk_level": row.risk_level or "Low",
                "predicted_cgpa": float(row.predicted_cgpa) if row.predicted_cgpa else 0.0,
                "xp_points": row.xp_points or 0,
                "faculty_notes": row.faculty_notes if hasattr(row, 'faculty_notes') and row.faculty_notes else "",
                "intervention_status": row.intervention_status if hasattr(row, 'intervention_status') and row.intervention_status else "Not Contacted"
            } for row in students
        ]
    finally:
        db.close()

@router.post("/api/v1/faculty/student/{student_id}/intervention")
def update_student_intervention(student_id: int, input_data: StudentInterventionUpdateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        student = db.execute(text("SELECT full_name FROM students WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        metrics = db.execute(text("SELECT student_id FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        if not metrics:
            db.execute(text("""
                INSERT INTO student_metrics (student_id, faculty_notes, intervention_status, updated_at)
                VALUES (:sid, :notes, :status, CURRENT_TIMESTAMP)
            """), {
                "sid": student_id,
                "notes": input_data.faculty_notes or "",
                "status": input_data.intervention_status or "Not Contacted"
            })
        else:
            db.execute(text("""
                UPDATE student_metrics
                SET faculty_notes = :notes, intervention_status = :status, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """), {
                "sid": student_id,
                "notes": input_data.faculty_notes or "",
                "status": input_data.intervention_status or "Not Contacted"
            })
            
        action_desc = f"Logged intervention for {student.full_name}: status = {input_data.intervention_status or 'Not Contacted'}"
        log_faculty_activity(current_user["faculty_id"], "student_monitoring", "Updated Intervention", action_desc, student_id, db=db)
        
        create_notification(
            db,
            "faculty",
            current_user["faculty_id"],
            "Intervention Logged",
            f"Successfully updated intervention records for {student.full_name}.",
            "risk",
            student_id
        )
        
        create_notification(
            db,
            "student",
            student_id,
            "Intervention Status Updated",
            f"An academic intervention status has been updated: {input_data.intervention_status or 'Not Contacted'}.",
            "risk",
            student_id
        )
        
        db.commit()
        return {"status": "success", "message": "Intervention logged successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.post("/api/faculty/run-risk-engine")
def run_risk_engine(data: RunRiskEngineInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, data.class_id)
        
        # Load students in class
        students = db.execute(text("""
            SELECT s.student_id, s.full_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
        """), {"cid": data.class_id}).fetchall()
        
        risk_count = 0
        for s in students:
            # 1. Get attendance rate from attendance_records
            att = db.execute(text("""
                SELECT COUNT(*) as total,
                       SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
                FROM attendance_records
                WHERE student_id = :sid AND class_id = :cid
            """), {"sid": s.student_id, "cid": data.class_id}).fetchone()
            
            att_rate = 100.0
            if att and att.total > 0:
                att_rate = round((att.present / att.total) * 100.0, 2)
                
            # 2. Get missing/pending assignments count
            pending_assigns = db.execute(text("""
                SELECT COUNT(*) FROM assignment_submissions asub
                JOIN assignments a ON asub.assignment_id = a.assignment_id
                WHERE asub.student_id = :sid AND a.class_id = :cid AND asub.status = 'Pending'
            """), {"sid": s.student_id, "cid": data.class_id}).scalar() or 0
            
            # 3. Get low marks
            marks = db.execute(text("""
                SELECT AVG(total_marks) FROM student_marks
                WHERE student_id = :sid AND class_id = :cid
            """), {"sid": s.student_id, "cid": data.class_id}).scalar()
            avg_marks = float(marks) if marks else 80.0
            
            # Rule-based Engine logic:
            reasons = []
            risk_score = 0.0
            
            if att_rate < 75.0:
                reasons.append(f"Attendance drop to {att_rate}% (<75%)")
                risk_score += 50.0
            elif att_rate < 85.0:
                reasons.append(f"Attendance warning {att_rate}% (<85%)")
                risk_score += 20.0
                
            if pending_assigns > 0:
                reasons.append(f"{pending_assigns} missing assignment submissions")
                risk_score += pending_assigns * 15.0
                
            if avg_marks < 50.0:
                reasons.append(f"Failing grade warning (Average Score: {round(avg_marks, 1)})")
                risk_score += 40.0
            elif avg_marks < 65.0:
                reasons.append(f"Low grades warning (Average Score: {round(avg_marks, 1)})")
                risk_score += 15.0
                
            risk_level = "Low"
            if risk_score >= 50.0:
                risk_level = "High"
            elif risk_score >= 20.0:
                risk_level = "Medium"
                
            reason_str = "; ".join(reasons) if reasons else "No risk indicators detected."
            
            # Update predictions
            db.execute(text("""
                INSERT INTO risk_predictions (student_id, class_id, risk_score, risk_level, attendance_score, quiz_score, prediction_reason, model_version, created_at)
                VALUES (:sid, :cid, :score, :level, :att_score, :q_score, :reason, :model_ver, CURRENT_TIMESTAMP)
            """), {
                "sid": s.student_id,
                "cid": data.class_id,
                "score": risk_score,
                "level": risk_level,
                "att_score": att_rate,
                "q_score": avg_marks,
                "reason": reason_str,
                "model_ver": RISK_MODEL_VERSION
            })
            
            # Update student_metrics table
            db.execute(text("""
                UPDATE student_metrics
                SET attendance = :att, quiz_score = :quiz, risk_level = :level, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """), {
                "att": att_rate,
                "quiz": avg_marks,
                "level": risk_level,
                "sid": s.student_id
            })
            
            if risk_level == "High":
                create_notification(
                    db,
                    "faculty",
                    faculty_id,
                    "High-Risk Student Detected",
                    f"Student {s.full_name} has been identified as high-risk. Reasons: {reason_str}",
                    "risk",
                    s.student_id
                )
                
            risk_count += 1
            
        db.commit()
        log_faculty_activity(db, faculty_id, "updated", "risk", f"Ran risk prediction analysis for class.", data.class_id)
        create_notification(db, "faculty", faculty_id, "Risk Engine Run Completed", "Successfully analyzed student risk metrics.", "risk", data.class_id)
        log_audit(db, "RUN_RISK_ENGINE", "Class", data.class_id, f"Faculty {faculty_id}")
        return {"message": f"Risk engine successfully analyzed {risk_count} students."}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/faculty/{faculty_id}/analytics")
def get_faculty_analytics(
    faculty_id: int, 
    class_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["faculty", "admin", "platform_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user["role"] == "faculty" and current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied: Faculty ID mismatch")
    db = SessionLocal()
    try:
        # Load classes assigned to faculty with filters
        query_str = """
            SELECT fa.class_id, fa.subject_id, c.class_name, s.subject_name
            FROM faculty_assignments fa
            JOIN classes c ON fa.class_id = c.class_id
            JOIN subjects s ON fa.subject_id = s.subject_id
            WHERE fa.faculty_id = :fid
        """
        params = {"fid": faculty_id}
        if class_id:
            query_str += " AND fa.class_id = :cid"
            params["cid"] = class_id
        if subject_id:
            query_str += " AND fa.subject_id = :sid"
            params["sid"] = subject_id

        classes = db.execute(text(query_str), params).fetchall()
        
        class_ids = [c.class_id for c in classes]
        if not class_ids:
            return {
                "attendance_trend": [],
                "performance_trend": [],
                "top_students": [],
                "weak_students": [],
                "subject_averages": [],
                "risk_distribution": {"High": 0, "Medium": 0, "Low": 0},
                "engagement_metrics": {"avg_xp": 0.0, "total_students": 0},
                "assignment_metrics": {"total_assignments": 0, "submission_rate": 0.0, "avg_score": 0.0}
            }
            
        # 1. Attendance Trend
        att_query = """
            SELECT attendance_date,
                   ROUND(AVG(CASE WHEN status = 'Present' THEN 100.0 ELSE 0.0 END), 2) as attendance_rate
            FROM attendance_records
            WHERE class_id IN :cids
        """
        att_params = {"cids": tuple(class_ids)}
        if start_date:
            att_query += " AND attendance_date >= :sdate"
            att_params["sdate"] = start_date
        if end_date:
            att_query += " AND attendance_date <= :edate"
            att_params["edate"] = end_date
        if subject_id:
            att_query += " AND subject_id = :subid"
            att_params["subid"] = subject_id
            
        att_query += """
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
            LIMIT 10
        """
        att_trend = db.execute(text(att_query), att_params).fetchall()
        
        # 2. Performance Trend
        perf_trend = db.execute(text("""
            SELECT s.department as branch,
                   ROUND(AVG(sm.attendance), 2) as attendance,
                   ROUND(AVG(sm.quiz_score), 2) as average
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
            GROUP BY s.department
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
        # 3. Top students
        top_students = db.execute(text("""
            SELECT s.student_id, s.full_name, sm.quiz_score as score, s.roll_no, s.department
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
            ORDER BY sm.quiz_score DESC
            LIMIT 5
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
        # 4. Weak students
        weak_students = db.execute(text("""
            SELECT s.student_id, s.full_name, sm.quiz_score as score, s.roll_no, s.department, sm.risk_level, sm.attendance
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids AND sm.risk_level IN ('High', 'Medium')
            ORDER BY sm.quiz_score ASC
            LIMIT 5
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
        # 5. Subject performance average
        subj_perf = []
        for c in classes:
            avg_score = db.execute(text("""
                SELECT AVG(total_marks) FROM student_marks
                WHERE class_id = :cid AND subject_id = :sid
            """), {"cid": c.class_id, "sid": c.subject_id}).scalar()
            subj_perf.append({
                "subject_name": c.subject_name,
                "class_name": c.class_name,
                "average": float(avg_score) if avg_score else 75.0
            })

        # 6. Risk Distribution
        risk_dist = db.execute(text("""
            SELECT sm.risk_level, COUNT(*) as count
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
            GROUP BY sm.risk_level
        """).bindparams(cids=tuple(class_ids))).fetchall()
        risk_counts = {"High": 0, "Medium": 0, "Low": 0}
        for r in risk_dist:
            if r.risk_level in risk_counts:
                risk_counts[r.risk_level] = r.count

        # 7. Student Engagement Metrics
        avg_xp = db.execute(text("""
            SELECT AVG(sm.xp_points)
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
        """).bindparams(cids=tuple(class_ids))).scalar() or 0.0
        
        total_students = db.execute(text("""
            SELECT COUNT(DISTINCT s.student_id)
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id IN :cids
        """).bindparams(cids=tuple(class_ids))).scalar() or 0

        # 8. Assignment Metrics
        total_assignments = db.execute(text("""
            SELECT COUNT(*) FROM assignments
            WHERE class_id IN :cids
        """).bindparams(cids=tuple(class_ids))).scalar() or 0
        
        enrollment_count = db.execute(text("""
            SELECT COUNT(*) FROM enrollments WHERE class_id IN :cids
        """).bindparams(cids=tuple(class_ids))).scalar() or 0
        
        expected_submissions = total_assignments * enrollment_count
        submitted_count = db.execute(text("""
            SELECT COUNT(*) FROM assignment_submissions sub
            JOIN assignments a ON sub.assignment_id = a.assignment_id
            WHERE a.class_id IN :cids AND sub.status IN ('Submitted', 'Late')
        """).bindparams(cids=tuple(class_ids))).scalar() or 0
        
        submission_rate = round((submitted_count / expected_submissions) * 100.0, 2) if expected_submissions > 0 else 100.0
        
        avg_assign_score = db.execute(text("""
            SELECT AVG(sub.marks_obtained * 100.0 / a.total_marks)
            FROM assignment_submissions sub
            JOIN assignments a ON sub.assignment_id = a.assignment_id
            WHERE a.class_id IN :cids AND sub.status IN ('Submitted', 'Late') AND a.total_marks > 0
        """).bindparams(cids=tuple(class_ids))).scalar() or 80.0

        return {
            "attendance_trend": [
                {"date": str(a.attendance_date), "rate": float(a.attendance_rate) if a.attendance_rate is not None else 0.0}
                for a in reversed(att_trend)
            ],
            "performance_trend": [
                {
                    "branch": p.branch,
                    "attendance": float(p.attendance) if p.attendance is not None else 0.0,
                    "average": float(p.average) if p.average is not None else 0.0
                }
                for p in perf_trend
            ],
            "top_students": [
                {"student_id": t.student_id, "name": t.full_name, "score": float(t.score) if t.score else 0.0, "roll": t.roll_no, "branch": t.department}
                for t in top_students
            ],
            "weak_students": [
                {"student_id": w.student_id, "name": w.full_name, "score": float(w.score) if w.score else 0.0, "roll": w.roll_no, "branch": w.department, "risk": w.risk_level, "attendance": float(w.attendance) if w.attendance else 100.0}
                for w in weak_students
            ],
            "subject_averages": subj_perf,
            "risk_distribution": risk_counts,
            "engagement_metrics": {
                "avg_xp": float(avg_xp) if avg_xp is not None else 0.0,
                "total_students": total_students
            },
            "assignment_metrics": {
                "total_assignments": total_assignments,
                "submission_rate": float(submission_rate) if submission_rate is not None else 0.0,
                "avg_score": float(avg_assign_score) if avg_assign_score is not None else 0.0
            }
        }
    finally:
        db.close()

@router.get("/api/v1/faculty/{faculty_id}/activities")
def get_faculty_activities(
    faculty_id: int, 
    module: Optional[str] = None, 
    time_range: Optional[str] = None, 
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        ensure_default_activities(db, faculty_id)
        
        query = "SELECT activity_id, action, module, details, related_id, created_at FROM faculty_activities WHERE faculty_id = :fid"
        params = {"fid": faculty_id}
        
        if module and module != "all":
            if module == "gradebook":
                query += " AND module IN ('gradebook', 'marks')"
            elif module == "risk_prediction":
                query += " AND (module = 'risk_prediction' OR (module = 'risk' AND action NOT LIKE '%Intervention%'))"
            elif module == "student_monitoring":
                query += " AND (module = 'student_monitoring' OR (module = 'risk' AND action LIKE '%Intervention%'))"
            elif module == "authentication":
                query += " AND module IN ('authentication', 'auth')"
            elif module == "announcement":
                query += " AND module IN ('announcement', 'announcements')"
            else:
                query += " AND module = :module"
                params["module"] = module
                
        if time_range == "today":
            query += " AND created_at >= CURRENT_DATE"
        elif time_range in ("week", "7days"):
            query += " AND created_at >= CURRENT_DATE - INTERVAL '7 days'"
        elif time_range in ("month", "30days"):
            query += " AND created_at >= CURRENT_DATE - INTERVAL '30 days'"
            
        query += " ORDER BY created_at DESC LIMIT :limit"
        params["limit"] = limit
        
        rows = db.execute(text(query), params).fetchall()
        
        activities_list = []
        for r in rows:
            act_id = r.activity_id
            action = r.action
            
            # Standardize module name for frontend
            mod_name = r.module
            if mod_name == "marks":
                mod_name = "gradebook"
            elif mod_name == "risk":
                if r.action and ("Intervention" in r.action or "intervention" in r.action.lower()):
                    mod_name = "student_monitoring"
                else:
                    mod_name = "risk_prediction"
            elif mod_name == "auth":
                mod_name = "authentication"
                
            details = r.details
            related_id = r.related_id
            created_at = r.created_at.isoformat() if r.created_at else None
            
            # Enrich academic context
            related_class = None
            related_subject = None
            related_student = None
            
            if related_id:
                try:
                    if mod_name == 'attendance':
                        # related_id is class_id
                        cls = db.execute(text("SELECT class_name FROM classes WHERE class_id = :rid"), {"rid": related_id}).fetchone()
                        if cls:
                            related_class = cls.class_name
                    elif mod_name == 'assignment':
                        # related_id is assignment_id
                        assign = db.execute(text("""
                            SELECT a.title, c.class_name, s.subject_name 
                            FROM assignments a
                            LEFT JOIN classes c ON a.class_id = c.class_id
                            LEFT JOIN subjects s ON a.subject_id = s.subject_id
                            WHERE a.assignment_id = :rid
                        """), {"rid": related_id}).fetchone()
                        if assign:
                            related_class = assign.class_name
                            related_subject = assign.subject_name
                    elif mod_name == 'gradebook':
                        # related_id is class_id
                        cls = db.execute(text("SELECT class_name FROM classes WHERE class_id = :rid"), {"rid": related_id}).fetchone()
                        if cls:
                            related_class = cls.class_name
                    elif mod_name == 'remedial':
                        # related_id is session_id
                        session = db.execute(text("""
                            SELECT rs.topic, c.class_name, s.subject_name 
                            FROM remedial_sessions rs
                            LEFT JOIN classes c ON rs.class_id = c.class_id
                            LEFT JOIN subjects s ON rs.subject_id = s.subject_id
                            WHERE rs.session_id = :rid
                        """), {"rid": related_id}).fetchone()
                        if session:
                            related_class = session.class_name
                            related_subject = session.subject_name
                    elif mod_name == 'announcement':
                        # related_id is announcement_id
                        ann = db.execute(text("SELECT title, target_type, target_id FROM announcements WHERE announcement_id = :rid"), {"rid": related_id}).fetchone()
                        if ann:
                            if ann.target_type == 'class':
                                cls = db.execute(text("SELECT class_name FROM classes WHERE class_id = :cid"), {"cid": ann.target_id}).fetchone()
                                if cls:
                                    related_class = cls.class_name
                    elif mod_name in ('student_monitoring', 'risk_prediction'):
                        # related_id is student_id
                        stud = db.execute(text("""
                            SELECT s.full_name, c.class_name 
                            FROM students s
                            LEFT JOIN enrollments e ON s.student_id = e.student_id
                            LEFT JOIN classes c ON e.class_id = c.class_id
                            WHERE s.student_id = :rid
                            LIMIT 1
                        """), {"rid": related_id}).fetchone()
                        if stud:
                            related_student = stud.full_name
                            related_class = stud.class_name
                except Exception as ex:
                    print(f"Error enriching activity context: {ex}")
                    
            activities_list.append({
                "activity_id": act_id,
                "action": action,
                "module": mod_name,
                "details": details,
                "related_id": related_id,
                "created_at": created_at,
                "related_class": related_class,
                "related_subject": related_subject,
                "related_student": related_student
            })
            
        return activities_list
    finally:
        db.close()

@router.get("/api/v1/faculty/{faculty_id}/dashboard-command-center")
def get_faculty_dashboard_command_center(
    faculty_id: int,
    class_id: int,
    subject_id: int,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    db = SessionLocal()
    try:
        # 1. Fetch workspace details
        faculty = db.execute(
            text("SELECT faculty_code, full_name, department, designation, institution_id FROM faculty WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).fetchone()
        
        if not faculty:
            raise HTTPException(status_code=404, detail="Faculty not found")
            
        inst_name = None
        if faculty.institution_id:
            inst = db.execute(
                text("SELECT institution_name FROM institutions WHERE institution_id = :iid"),
                {"iid": faculty.institution_id}
            ).fetchone()
            if inst:
                inst_name = inst.institution_name
                
        cls_info = db.execute(
            text("SELECT class_name, semester FROM classes WHERE class_id = :cid"),
            {"cid": class_id}
        ).fetchone()
        
        sub_info = db.execute(
            text("SELECT subject_name FROM subjects WHERE subject_id = :sid"),
            {"sid": subject_id}
        ).fetchone()
        
        assignment_mapping = db.execute(
            text("SELECT academic_year FROM faculty_assignments WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid LIMIT 1"),
            {"fid": faculty_id, "cid": class_id, "sid": subject_id}
        ).fetchone()
        
        academic_year = assignment_mapping.academic_year if assignment_mapping else None
        class_name = cls_info.class_name if cls_info else None
        subject_name = sub_info.subject_name if sub_info else None
        semester = cls_info.semester if cls_info else None
        
        workspace_summary = {
            "faculty_name": faculty.full_name,
            "faculty_code": faculty.faculty_code,
            "department": faculty.department,
            "designation": faculty.designation,
            "institution": inst_name,
            "academic_year": academic_year,
            "semester": f"Semester {semester}" if semester else None,
            "selected_class": class_name,
            "selected_subject": subject_name
        }
        
        # 2. Today's Overview statistics & counts
        # Classes count (Total classes assigned to this faculty)
        classes_count = db.execute(
            text("SELECT COUNT(*) FROM faculty_assignments WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).scalar() or 0
        
        # Pending Attendance today
        att_marked_today = db.execute(
            text("SELECT COUNT(*) FROM attendance_records WHERE class_id = :cid AND subject_id = :sid AND attendance_date = :today"),
            {"cid": class_id, "sid": subject_id, "today": datetime.now().date()}
        ).scalar() or 0
        pending_attendance = 1 if att_marked_today == 0 else 0
        
        # Pending Marks components count
        # Check if marks are published
        marks_published = db.execute(
            text("SELECT COUNT(*) FROM student_marks WHERE class_id = :cid AND subject_id = :sid AND is_published = TRUE"),
            {"cid": class_id, "sid": subject_id}
        ).scalar() or 0
        
        enrolled_students = db.execute(
            text("SELECT COUNT(*) FROM enrollments WHERE class_id = :cid"),
            {"cid": class_id}
        ).scalar() or 0
        
        # Get components count
        components_count = db.execute(
            text("SELECT COUNT(*) FROM subject_assessments WHERE subject_id = :sid AND academic_year = :ay AND semester = :sem"),
            {"sid": subject_id, "ay": academic_year or get_current_academic_year(db, current_user.get("institution_id")), "sem": semester or 5}
        ).scalar() or 0
        
        if components_count == 0:
            # Fallback to default count of 4 if not seeded/configured yet
            components_count = 4
            
        pending_marks_count = components_count if (marks_published < enrolled_students) else 0
        
        # Pending Assignment Reviews
        pending_assignments = db.execute(
            text("""
                SELECT COUNT(*) 
                FROM assignment_submissions s
                JOIN assignments a ON s.assignment_id = a.assignment_id
                WHERE a.class_id = :cid AND a.subject_id = :sid AND (s.status = 'submitted' OR s.marks_obtained IS NULL)
            """),
            {"cid": class_id, "sid": subject_id}
        ).scalar() or 0
        
        # High Risk Students
        high_risk_students = db.execute(
            text("""
                SELECT COUNT(*) 
                FROM student_metrics sm
                JOIN enrollments e ON sm.student_id = e.student_id
                WHERE e.class_id = :cid AND sm.risk_level = 'High'
            """),
            {"cid": class_id}
        ).scalar() or 0
        
        # Upcoming Remedials
        upcoming_remedials = db.execute(
            text("""
                SELECT COUNT(*) 
                FROM remedial_sessions 
                WHERE class_id = :cid AND subject_id = :sid AND session_date >= :today
            """),
            {"cid": class_id, "sid": subject_id, "today": datetime.now().date()}
        ).scalar() or 0
        
        # Unread Notifications
        unread_notifications = db.execute(
            text("SELECT COUNT(*) FROM notifications WHERE faculty_id = :fid AND is_read = FALSE"),
            {"fid": faculty_id}
        ).scalar() or 0
        
        # Unread Announcements for faculty (aligned with visibility logic)
        iid = faculty.institution_id
        dept = faculty.department or ""
        unread_announcements = db.execute(
            text("""
                SELECT COUNT(DISTINCT a.announcement_id)
                FROM announcements a
                LEFT JOIN announcement_reads r ON a.announcement_id = r.announcement_id AND r.user_id = :uid
                WHERE a.institution_id = :iid
                  AND r.id IS NULL
                  AND NOT ((a.sender_type = 'faculty' OR a.sender_type = 'FACULTY') AND a.sender_id = :fid)
                  AND (
                    a.target_type = 'Institution'
                    OR (a.target_type = 'Faculty' AND (a.target_id IS NULL OR a.target_id = :fid))
                    OR (a.target_type = 'Department' AND a.target_id IN (
                        SELECT department_id FROM departments WHERE department_name = :dept OR department_code = :dept
                    ))
                  )
            """),
            {
                "uid": current_user["user_id"],
                "iid": iid,
                "fid": faculty_id,
                "dept": dept
            }
        ).scalar() or 0
        
        today_overview = {
            "today_classes": classes_count,
            "pending_attendance": pending_attendance,
            "pending_marks": pending_marks_count,
            "pending_assignments": pending_assignments,
            "high_risk_students": high_risk_students,
            "upcoming_remedials": upcoming_remedials,
            "unread_notifications": unread_notifications,
            "unread_announcements": unread_announcements
        }
        
        # 3. Build dynamic task list
        my_tasks = []
        
        # Task 1: Attendance Pending
        if pending_attendance > 0:
            my_tasks.append({
                "id": "task_attendance",
                "title": "Attendance Pending",
                "description": f"Today's attendance for {class_name} ({subject_name}) is pending.",
                "priority": "High",
                "status": "Pending",
                "route": "/faculty/attendance",
                "action_label": "Record Attendance"
            })
            
        # Task 2: Marks Pending
        if pending_marks_count > 0:
            my_tasks.append({
                "id": "task_marks",
                "title": "Marks Pending Publishing",
                "description": f"Assessment grades for {class_name} are in draft or pending entry.",
                "priority": "Medium",
                "status": "Draft / Pending",
                "route": "/faculty/gradebook",
                "action_label": "Open Gradebook"
            })
            
        # Task 3: Assignment Review Pending
        if pending_assignments > 0:
            my_tasks.append({
                "id": "task_assignments",
                "title": "Assignment Review Pending",
                "description": f"You have {pending_assignments} student submission(s) to grade and review.",
                "priority": "High",
                "status": f"{pending_assignments} Ungraded",
                "route": "/faculty/assignments",
                "action_label": "Grade Submissions"
            })
            
        # Task 4: High Risk Students
        if high_risk_students > 0:
            my_tasks.append({
                "id": "task_risk",
                "title": "High Risk Students Flagged",
                "description": f"{high_risk_students} student(s) in {class_name} are flagged in the high risk tier.",
                "priority": "High",
                "status": f"{high_risk_students} Flags",
                "route": "/faculty/performance",
                "action_label": "View Profiles"
            })
            
        # Task 5: Upcoming/Recommend Remedial
        next_remedial = db.execute(
            text("""
                SELECT topic, session_date, session_time 
                FROM remedial_sessions 
                WHERE class_id = :cid AND subject_id = :sid AND session_date >= :today 
                ORDER BY session_date ASC LIMIT 1
            """),
            {"cid": class_id, "sid": subject_id, "today": datetime.now().date()}
        ).fetchone()
        
        if next_remedial:
            my_tasks.append({
                "id": "task_remedial",
                "title": f"Remedial: {next_remedial.topic}",
                "description": f"Remedial session scheduled on {next_remedial.session_date} at {next_remedial.session_time}.",
                "priority": "Medium",
                "status": "Scheduled",
                "route": "/faculty/remedial",
                "action_label": "Manage Remedials"
            })
        elif high_risk_students > 0:
            my_tasks.append({
                "id": "task_remedial_recommend",
                "title": "Schedule Remedial Session",
                "description": "Schedule a remedial session for high-risk students in this class.",
                "priority": "Medium",
                "status": "Recommended",
                "route": "/faculty/remedial",
                "action_label": "Create Session"
            })
            
        # Task 6: Unread Announcements
        if unread_announcements > 0:
            my_tasks.append({
                "id": "task_announcements",
                "title": "Unread Announcements",
                "description": f"You have {unread_announcements} unread institutional announcements.",
                "priority": "Low",
                "status": f"{unread_announcements} New",
                "route": "/faculty/announcements",
                "action_label": "View Announcements"
            })
            
        # 4. Smart Insights (Rule-based)
        smart_insights = []
        
        # Insight 1: Attendance Trend
        avg_attendance = db.execute(
            text("""
                SELECT AVG(sm.attendance) 
                FROM student_metrics sm 
                JOIN enrollments e ON sm.student_id = e.student_id 
                WHERE e.class_id = :cid
            """),
            {"cid": class_id}
        ).scalar()
        
        if avg_attendance is not None:
            avg_attendance = float(avg_attendance)
            if avg_attendance < 75.0:
                smart_insights.append({
                    "type": "attendance",
                    "title": "Class Attendance Critical",
                    "description": f"Average class attendance has dropped to {round(avg_attendance, 1)}%, which is below the 75% mandatory threshold. Review attendance registry.",
                    "badge_color": "rose",
                    "severity": "danger"
                })
            elif avg_attendance < 80.0:
                smart_insights.append({
                    "type": "attendance",
                    "title": "Attendance Warning",
                    "description": f"Average class attendance is currently {round(avg_attendance, 1)}%. Monitor attendance patterns to prevent risk escalations.",
                    "badge_color": "amber",
                    "severity": "warning"
                })
            else:
                smart_insights.append({
                    "type": "attendance",
                    "title": "Healthy Attendance Levels",
                    "description": f"Class attendance is stable at {round(avg_attendance, 1)}%. Excellent lecture engagement!",
                    "badge_color": "emerald",
                    "severity": "success"
                })
                
        # Insight 2: Risk Prediction Trend
        total_class_students = db.execute(
            text("SELECT COUNT(*) FROM enrollments WHERE class_id = :cid"),
            {"cid": class_id}
        ).scalar() or 0
        
        total_risk_students = db.execute(
            text("""
                SELECT COUNT(*) 
                FROM student_metrics sm 
                JOIN enrollments e ON sm.student_id = e.student_id 
                WHERE e.class_id = :cid AND sm.risk_level IN ('High', 'Medium')
            """),
            {"cid": class_id}
        ).scalar() or 0
        
        if total_class_students > 0:
            risk_ratio = (total_risk_students / total_class_students) * 100
            if risk_ratio > 20.0:
                smart_insights.append({
                    "type": "risk",
                    "title": "High Class Risk Ratio",
                    "description": f"{round(risk_ratio, 1)}% of students ({total_risk_students} total) are flagged in academic warning tiers. Proactive interventions recommended.",
                    "badge_color": "rose",
                    "severity": "danger"
                })
            elif risk_ratio > 10.0:
                smart_insights.append({
                    "type": "risk",
                    "title": "Moderate Academic Warning",
                    "description": f"{total_risk_students} students are currently flagged as academic risks. Consider scheduling a targeted remedial session.",
                    "badge_color": "amber",
                    "severity": "warning"
                })
            else:
                smart_insights.append({
                    "type": "risk",
                    "title": "Low Academic Risk Profile",
                    "description": "Less than 10% of class enrollment is currently flagged in risk tiers. Keep supporting overall student performance.",
                    "badge_color": "emerald",
                    "severity": "success"
                })
                
        # Insight 3: Marks Pending
        if pending_marks_count > 0:
            smart_insights.append({
                "type": "marks",
                "title": "Unpublished Gradebook Drafts",
                "description": "Assessment marks are saved in draft form or pending entry. Publish grades to update student performance insights.",
                "badge_color": "amber",
                "severity": "warning"
            })
            
        # Insight 4: Assignment Due
        next_assignment = db.execute(
            text("""
                SELECT title, due_date 
                FROM assignments 
                WHERE class_id = :cid AND subject_id = :sid AND due_date >= :today 
                ORDER BY due_date ASC LIMIT 1
            """),
            {"cid": class_id, "sid": subject_id, "today": datetime.now().date()}
        ).fetchone()
        
        if next_assignment:
            smart_insights.append({
                "type": "assignment",
                "title": "Active Assignment Deadline",
                "description": f"'{next_assignment.title}' is active and due on {next_assignment.due_date}. Expect student submissions shortly.",
                "badge_color": "indigo",
                "severity": "info"
            })
            
        # Insight 5: Remedial Session Recommendation
        if high_risk_students > 0 and upcoming_remedials == 0:
            smart_insights.append({
                "type": "remedial",
                "title": "Remedial Recommendation",
                "description": f"There are {high_risk_students} high-risk students in {class_name} but no upcoming remedial sessions scheduled. Scheduling a session is highly recommended.",
                "badge_color": "purple",
                "severity": "warning"
            })
            
        return {
            "workspace_summary": workspace_summary,
            "today_overview": today_overview,
            "my_tasks": my_tasks,
            "smart_insights": smart_insights
        }
    finally:
        db.close()

