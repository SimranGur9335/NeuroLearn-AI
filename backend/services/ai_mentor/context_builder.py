from sqlalchemy import text
from backend.database import SessionLocal
import json


def build_student_context(current_user):
    """
    Builds the student context for the AI Mentor.
    """

    db = SessionLocal()

    try:
        # ---------------- Student ----------------
        student = db.execute(
            text("""
                SELECT
                    full_name,
                    email,
                    department,
                    semester,
                    division
                FROM students
                WHERE student_id = :student_id
            """),
            {
                "student_id": current_user["student_id"]
            }
        ).mappings().first()

        # ---------------- Wellness ----------------
        wellness = db.execute(
            text("""
                SELECT
                    focus_score,
                    learning_consistency,
                    current_streak,
                    weekly_study_hours
                FROM wellness_statistics
                WHERE student_id = :student_id
                AND is_deleted = FALSE
            """),
            {
                "student_id": current_user["student_id"]
            }
        ).mappings().first()

        # ---------------- Academic Prediction ----------------
        prediction = db.execute(
            text("""
                SELECT
                    predicted_cgpa,
                    risk_level,
                    weak_subjects,
                    recommendations
                FROM student_academic_predictions
                WHERE student_id = :student_id
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {
                "student_id": current_user["student_id"]
            }
        ).mappings().first()

        # Parse JSON fields
        weak_subjects = []
        recommendations = []

        if prediction:
            try:
                weak_subjects = json.loads(prediction["weak_subjects"]) if prediction["weak_subjects"] else []
            except Exception:
                weak_subjects = []

            try:
                recommendations = json.loads(prediction["recommendations"]) if prediction["recommendations"] else []
            except Exception:
                recommendations = []

        # Final Context
        context = {
            "student_name": student["full_name"] if student else "Student",
            "email": student["email"] if student else current_user.get("email"),
            "role": current_user.get("role", "student"),

            "department": student["department"] if student else "Unknown",
            "semester": student["semester"] if student else "Unknown",
            "division": student["division"] if student else "Unknown",

            # Wellness
            "focus_score": wellness["focus_score"] if wellness else None,
            "learning_consistency": wellness["learning_consistency"] if wellness else None,
            "current_streak": wellness["current_streak"] if wellness else None,
            "weekly_study_hours": wellness["weekly_study_hours"] if wellness else None,

            # Academic Prediction
            "predicted_cgpa": prediction["predicted_cgpa"] if prediction else None,
            "risk_level": prediction["risk_level"] if prediction else "Unknown",
            "weak_subjects": weak_subjects,
            "recommendations": recommendations,
        }

        return context

    finally:
        db.close()