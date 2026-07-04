import os
import re
import json
import warnings
from typing import Optional, List, Dict, Any
from pathlib import Path
import joblib
from sqlalchemy import text
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load the student performance RF model
student_model = None
try:
    student_model = joblib.load(
        BASE_DIR / "models" / "academic" / "student_performance_rf.pkl"
    )
except Exception as e:
    print(f"Error loading student performance model in prediction service: {e}")


def run_academic_prediction_pipeline(data, student_id: int, db) -> Dict[str, Any]:
    # 1. Run grade prediction
    predicted_grade = None
    if student_model:
        try:
            # Format to integers for random forest features shape
            prediction = student_model.predict([
                [
                    0, 0, data.age, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
                    data.studytime, data.failures, 0, 0, 0, 0, 0, 0, 0, 0,
                    3, 3, 3, 1, 1, 3, data.absences, int(data.G1), int(data.G2), 0
                ]
            ])
            predicted_grade = round(float(prediction[0]), 2)
        except Exception as e:
            print(f"Model inference error: {e}")

    if predicted_grade is None:
        # Dynamic fallback using database/input features instead of a hardcoded constant
        if data.G1 > 0 or data.G2 > 0:
            predicted_grade = round((data.G1 + data.G2) / 2.0, 2)
        else:
            # Fetch average marks percentage from student_marks and convert to 0-20 scale
            avg_marks = db.execute(
                text("SELECT AVG(total_marks) FROM student_marks WHERE student_id = :sid"),
                {"sid": student_id}
            ).scalar()
            if avg_marks is not None:
                predicted_grade = round((float(avg_marks) / 100.0) * 20.0, 2)
            else:
                predicted_grade = 14.5
            
    # 2. Compute metrics
    predicted_cgpa = round(min(10.0, max(0.0, (predicted_grade / 20.0) * 10.0)), 2)
    
    # Heuristic for attendance prediction
    predicted_attendance = max(0.0, min(100.0, 100.0 - (data.absences * 1.5) + (data.studytime * 0.5)))
    predicted_attendance = round(predicted_attendance, 2)
    
    # Backlog risk score
    risk_score = (data.failures * 30.0) + (2.5 * data.absences) + (1.8 * (20.0 - data.G2))
    risk_score = min(100.0, max(0.0, round(risk_score, 2)))
    
    risk_level = "Low"
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
        
    # 3. Detect Weak Subjects
    weak_subjects_list = []
    db_marks = db.execute(text("""
        SELECT sm.total_marks, s.subject_name 
        FROM student_marks sm 
        JOIN subjects s ON sm.subject_id = s.subject_id 
        WHERE sm.student_id = :sid AND sm.total_marks IS NOT NULL
    """), {"sid": student_id}).fetchall()
    
    if db_marks:
        sorted_marks = sorted(db_marks, key=lambda x: float(x[0]))
        for row in sorted_marks:
            if float(row[0]) < 50.0 or len(weak_subjects_list) < 2:
                weak_subjects_list.append(row.subject_name)
    
    if not weak_subjects_list:
        s_profile = db.execute(text("SELECT department FROM students WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        dept = s_profile.department if s_profile else "Computer Engineering"
        
        dept_subjects = db.execute(text("""
            SELECT subject_name FROM subjects 
            WHERE department = :dept LIMIT 3
        """), {"dept": dept}).fetchall()
        
        if dept_subjects:
            weak_subjects_list = [row.subject_name for row in dept_subjects[:2]]
        else:
            weak_subjects_list = ["Data Structures & Algorithms", "Operating Systems"]
            
    # 4. Generate Recommendations (Gemini or Fallback Rules)
    gemini_key = os.getenv("GEMINI_API_KEY")
    recommendations_list = []
    
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            studytime_desc = {1: "Under 2 hours", 2: "2 to 5 hours", 3: "5 to 10 hours", 4: "Over 10 hours"}.get(data.studytime, "Medium")
            prompt = f"""
            You are an academic advisor AI at NeuroLearn-AI.
            Analyze the following student metrics and generate exactly 4 actionable recommendations for the student.
            
            Student Metrics:
            - Age: {data.age}
            - Weekly Study Time: {studytime_desc}
            - Past Academic Failures: {data.failures}
            - Absences this Semester: {data.absences}
            - Internal Marks (G1): {data.G1}/20
            - Midterm Marks (G2): {data.G2}/20
            - Predicted Final Grade: {predicted_grade}/20 (CGPA: {predicted_cgpa}/10.0)
            - Projected Attendance: {predicted_attendance}%
            - Backlog Risk Level: {risk_level} (Risk Score: {risk_score}%)
            - Weak Subjects identified: {", ".join(weak_subjects_list)}
            
            Respond with a valid JSON array of exactly 4 strings. Do not include markdown tags, code blocks, or explanations outside the JSON array.
            Example: ["Increase study time to 5-10 hours", "Attend next 5 classes to avoid attendance shortage", "Focus on operating systems", "Schedule AI mentor review"]
            """
            
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                raw_text = re.sub(r'\n```$', '', raw_text)
            
            recommendations_list = json.loads(raw_text.strip())
        except Exception as e:
            print(f"Gemini API error during academic recommendations: {e}")
            
    if not recommendations_list:
        if data.studytime <= 2:
            recommendations_list.append("Allocate 2-3 additional hours weekly to study outside class. Shifting study hours up helps improve final CGPA.")
        else:
            recommendations_list.append("Maintain your study routine! Dedicate specific focus sessions on core engineering concepts before finals.")
            
        if data.absences > 8:
            recommendations_list.append(f"Your attendance rate ({predicted_attendance}%) is approaching the warning limit. Attend all remaining classes to avoid debarment.")
        else:
            recommendations_list.append("Excellent lecture attendance consistency. Keep it up to earn academic compliance marks.")
            
        if risk_level == "High" or risk_level == "Medium":
            recommendations_list.append(f"Schedule a remediation checkpoint with your subject teachers or the AI Mentor to address concerns in {', '.join(weak_subjects_list)}.")
        else:
            recommendations_list.append(f"Strengthen your preparation in {weak_subjects_list[0] if weak_subjects_list else 'core topics'} by practicing interactive programming questions in the Student Hub.")
            
        if data.G2 < 12:
            recommendations_list.append(f"Review previous mid-term test questions and focus on topics where you scored lower in {weak_subjects_list[0] if weak_subjects_list else 'key courses'}.")
        else:
            recommendations_list.append("Aim for an honors grade by target-practicing advanced problem sets and attempting certification mocks.")
    
    # 5. Insert history record
    weak_subjects_json = json.dumps(weak_subjects_list)
    recommendations_json = json.dumps(recommendations_list)
    
    db.execute(text("""
        INSERT INTO student_academic_predictions (
            student_id, age, studytime, failures, absences, g1_score, g2_score,
            predicted_grade, predicted_cgpa, attendance_rate, backlog_risk, risk_level,
            weak_subjects, recommendations
        ) VALUES (
            :sid, :age, :studytime, :failures, :absences, :g1, :g2,
            :p_grade, :p_cgpa, :p_att, :b_risk, :risk_lvl,
            :w_sub, :recs
        )
    """), {
        "sid": student_id, "age": data.age, "studytime": data.studytime, "failures": data.failures,
        "absences": data.absences, "g1": data.G1, "g2": data.G2,
        "p_grade": predicted_grade, "p_cgpa": predicted_cgpa, "p_att": predicted_attendance,
        "b_risk": risk_score, "risk_lvl": risk_level,
        "w_sub": weak_subjects_json, "recs": recommendations_json
    })
    db.commit()
    
    # 6. Update student_metrics table
    metrics_exist = db.execute(text("SELECT student_id FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
    if metrics_exist:
        db.execute(text("""
            UPDATE student_metrics 
            SET attendance = :att, quiz_score = :qs, risk_level = :rl, predicted_cgpa = :cgpa, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = :sid
        """), {
            "att": predicted_attendance, "qs": float(data.G2), "rl": risk_level, "cgpa": predicted_cgpa, "sid": student_id
        })
    else:
        db.execute(text("""
            INSERT INTO student_metrics (student_id, attendance, quiz_score, risk_level, predicted_cgpa)
            VALUES (:sid, :att, :qs, :rl, :cgpa)
        """), {
            "sid": student_id, "att": predicted_attendance, "qs": float(data.G2), "rl": risk_level, "cgpa": predicted_cgpa
        })
    db.commit()
    
    # 7. Sync with risk_predictions table
    db.execute(text("""
        INSERT INTO risk_predictions (student_id, class_id, risk_score, risk_level, attendance_score, quiz_score, prediction_reason)
        VALUES (
            :sid,
            (SELECT class_id FROM enrollments WHERE student_id = :sid ORDER BY created_at DESC LIMIT 1),
            :r_score, :r_lvl, :att, :quiz,
            :reason
        )
    """), {
        "sid": student_id,
        "r_score": risk_score,
        "r_lvl": risk_level,
        "att": predicted_attendance,
        "quiz": float(data.G2),
        "reason": f"Self-reported prediction. Study hours: {data.studytime}. Absences: {data.absences}. Failures: {data.failures}."
    })
    db.commit()

    return {
        "predicted_grade": predicted_grade,
        "predicted_cgpa": predicted_cgpa,
        "attendance_rate": predicted_attendance,
        "backlog_risk": risk_score,
        "risk_level": risk_level,
        "weak_subjects": weak_subjects_list,
        "recommendations": recommendations_list
    }


def predict_student_performance_logic(data, student_id: Optional[int], db) -> Dict[str, Any]:
    if not student_model:
        if data.G1 > 0 or data.G2 > 0:
            predicted_grade = round((float(data.G1) + float(data.G2)) / 2.0, 2)
        else:
            avg_marks = None
            if student_id:
                avg_marks = db.execute(
                    text("SELECT AVG(total_marks) FROM student_marks WHERE student_id = :sid"),
                    {"sid": student_id}
                ).scalar()
            if avg_marks is not None:
                predicted_grade = round((float(avg_marks) / 100.0) * 20.0, 2)
            else:
                predicted_grade = 14.5
        return {"predicted_grade": predicted_grade, "warning": "Model not loaded, calculated from grade history"}
        
    prediction = student_model.predict([
        [
            0, 0, data.age, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
            data.studytime, data.failures, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 1, 1, 3, data.absences, data.G1, data.G2, 0
        ]
    ])
    return {"predicted_grade": round(float(prediction[0]), 2)}
