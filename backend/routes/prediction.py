import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal
from backend.schemas.prediction import AcademicPredictInput
from backend.schemas.student import StudentPerformanceInput
from backend.core.security import get_current_user
from backend.core.helpers import handle_exception_securely
from backend.services.prediction_service import (
    run_academic_prediction_pipeline,
    predict_student_performance_logic
)

router = APIRouter(
    tags=["Prediction"]
)


@router.get("/api/v1/academic/student-stats")
def get_academic_student_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can access academic stats")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Calculate failures (count of grades F or total_marks < 40)
        failures_row = db.execute(text("""
            SELECT COUNT(*) FROM student_marks 
            WHERE student_id = :sid AND (grade = 'F' OR total_marks < 40)
        """), {"sid": student_id}).fetchone()
        failures = failures_row[0] if failures_row else 0
        
        # Calculate absences (count of status = 'Absent')
        absences_row = db.execute(text("""
            SELECT COUNT(*) FROM attendance_records 
            WHERE student_id = :sid AND status = 'Absent'
        """), {"sid": student_id}).fetchone()
        absences = absences_row[0] if absences_row else 0
        
        # Calculate average internal (G1)
        g1_row = db.execute(text("""
            SELECT AVG(internal_marks) FROM student_marks 
            WHERE student_id = :sid AND internal_marks IS NOT NULL
        """), {"sid": student_id}).fetchone()
        g1_avg = float(g1_row[0]) if g1_row and g1_row[0] is not None else 14.0
        if g1_avg > 20.0:
            g1_avg = (g1_avg / 100.0) * 20.0
            
        # Calculate average quiz/midterm (G2)
        g2_row = db.execute(text("""
            SELECT AVG(quiz_marks) FROM student_marks 
            WHERE student_id = :sid AND quiz_marks IS NOT NULL
        """), {"sid": student_id}).fetchone()
        g2_avg = float(g2_row[0]) if g2_row and g2_row[0] is not None else 15.0
        if g2_avg > 20.0:
            g2_avg = (g2_avg / 100.0) * 20.0
            
        # Default age and studytime
        age = 20
        studytime = 3
        
        # Try to pull from previous runs to remember age and studytime
        prev_pred = db.execute(text("""
            SELECT age, studytime FROM student_academic_predictions 
            WHERE student_id = :sid 
            ORDER BY created_at DESC LIMIT 1
        """), {"sid": student_id}).fetchone()
        if prev_pred:
            age = prev_pred.age
            studytime = prev_pred.studytime
            
        return {
            "age": age,
            "studytime": studytime,
            "failures": min(4, failures),
            "absences": min(93, absences),
            "G1": round(g1_avg, 1),
            "G2": round(g2_avg, 1)
        }
    finally:
        db.close()


@router.post("/api/v1/academic/predict")
def predict_academic_outcome(data: AcademicPredictInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can run academic projections")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        result = run_academic_prediction_pipeline(data, student_id, db)
        return result
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/academic/predictions/history")
def get_academic_predictions_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can view predictions history")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        query = text("""
            SELECT prediction_id, age, studytime, failures, absences, g1_score, g2_score,
                   predicted_grade, predicted_cgpa, attendance_rate, backlog_risk, risk_level,
                   weak_subjects, recommendations, created_at
            FROM student_academic_predictions
            WHERE student_id = :sid
            ORDER BY created_at DESC
        """)
        rows = db.execute(query, {"sid": student_id}).fetchall()
        
        history = []
        for r in rows:
            try:
                w_subs = json.loads(r.weak_subjects) if r.weak_subjects else []
            except Exception:
                w_subs = r.weak_subjects.split(",") if r.weak_subjects else []
                
            try:
                recs = json.loads(r.recommendations) if r.recommendations else []
            except Exception:
                recs = r.recommendations.split(",") if r.recommendations else []
                
            history.append({
                "prediction_id": r.prediction_id,
                "age": r.age,
                "studytime": r.studytime,
                "failures": r.failures,
                "absences": r.absences,
                "G1": float(r.g1_score),
                "G2": float(r.g2_score),
                "predicted_grade": float(r.predicted_grade),
                "predicted_cgpa": float(r.predicted_cgpa),
                "attendance_rate": float(r.attendance_rate),
                "backlog_risk": float(r.backlog_risk),
                "risk_level": r.risk_level,
                "weak_subjects": w_subs,
                "recommendations": recs,
                "created_at": str(r.created_at)
            })
        return history
    finally:
        db.close()


@router.post("/api/predict/student-performance")
def predict_student_performance(data: StudentPerformanceInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id") if current_user["role"] == "student" else None
        result = predict_student_performance_logic(data, student_id, db)
        return result
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()