# main.py
import warnings
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore",category=InconsistentVersionWarning )
import re
import joblib
from pathlib import Path
from datetime import datetime, timedelta, date
import jwt
import json
import bcrypt
import random
import asyncio
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import text
from backend.database import SessionLocal, engine
from typing import Optional, List, Dict, Union
from backend.services.ai_mentor.prompt_builder import build_prompt
from backend.services.ai_mentor.groq_service import generate_response
from backend.services.ai_mentor.context_builder import build_student_context
from backend.services.ai_mentor.memory_service import (get_memory, add_message,clear_memory)
from backend.services.ai_mentor.chat_service import (create_chat_session,get_latest_chat_session,save_chat_message,get_active_chat_sessions,get_chat_messages,get_chat_session_owner,rename_chat_session,delete_chat_session)
import logging

#models input 
from backend.schemas.auth import *
from backend.schemas.student import *
from backend.schemas.faculty import *
from backend.schemas.academic import *
from backend.schemas.assignment import *
from backend.schemas.attendance import *
from backend.schemas.announcement import *
from backend.schemas.career import *
from backend.schemas.mentor import *
from backend.schemas.wellness import *
from backend.schemas.prediction import *
from backend.schemas.institution import *
from backend.schemas.admin import *


#core modules
from backend.core.security import (
    hash_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    require_role,
)
from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    log_faculty_activity,
    create_notification,
)
log_activity = log_faculty_activity
from backend.core.access import (
    verify_faculty_access,
    verify_student_access,
)

class StudentInterventionUpdateInput(BaseModel):
    faculty_notes: Optional[str] = None
    intervention_status: Optional[str] = None
    faculty_id: int

#routes
 # from backend.routes.auth import router as auth_router
from backend.routes.student import router as student_router
from backend.routes.faculty import router as faculty_router
from backend.routes.assignment import router as assignment_router
from backend.routes.attendance import router as attendance_router
from backend.routes.announcement import router as announcement_router
from backend.routes.notifications import router as notification_router
from backend.routes.gamification import router as gamification_router
from backend.routes.domain import router as domain_router
from backend.routes.programming import router as programming_router
from backend.routes.marks import router as marks_router
from backend.routes.prediction import router as prediction_router
from backend.routes.career import router as career_router
from backend.routes.wellness import router as wellness_router
from backend.routes.institution import router as institution_router
from backend.routes.admin import router as admin_router
from backend.routes.mentor import router as ai_mentor_router
from backend.routes.auth import router as auth_router
from backend.routes.faculty_dashboard import router as faculty_dashboard_router
from backend.routes.institution_management import router as institution_management_router
from backend.routes.student_hub import router as student_hub_router
from backend.routes.remedial import router as remedial_router
from backend.routes.platform_admin import router as platform_admin_router

# Configure production logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("neurolearn_api")


app = FastAPI()
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(attendance_router)
app.include_router(assignment_router)
app.include_router(announcement_router)
app.include_router(notification_router)
app.include_router(gamification_router)
app.include_router(domain_router)
app.include_router(programming_router)
app.include_router(marks_router)
app.include_router(prediction_router)
app.include_router(career_router)
app.include_router(wellness_router)
app.include_router(institution_router)
app.include_router(admin_router)
app.include_router(ai_mentor_router)
app.include_router(auth_router)
app.include_router(faculty_dashboard_router)
app.include_router(institution_management_router)
app.include_router(student_hub_router)
app.include_router(remedial_router)
app.include_router(platform_admin_router)

    


def run_migrations():
    db = SessionLocal()
    try:
        # Check and add columns to assignments table
        cols_assignments = {
            "attachment_name": "VARCHAR(255) DEFAULT NULL",
            "attachment_url": "TEXT DEFAULT NULL",
            "attachment_type": "VARCHAR(50) DEFAULT NULL",
            "attachment_size": "INTEGER DEFAULT NULL",
            "status": "VARCHAR(50) DEFAULT 'Published'",
            "instructions": "TEXT DEFAULT NULL"
        }
        for col, col_type in cols_assignments.items():
            db.execute(text(f"ALTER TABLE assignments ADD COLUMN IF NOT EXISTS {col} {col_type};"))
        
        # Check and add columns to assignment_submissions table
        cols_submissions = {
            "submission_file_name": "VARCHAR(255) DEFAULT NULL",
            "submission_file_size": "INTEGER DEFAULT NULL",
            "external_url": "TEXT DEFAULT NULL",
            "feedback": "TEXT DEFAULT NULL"
        }
        for col, col_type in cols_submissions.items():
            db.execute(text(f"ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS {col} {col_type};"))
            
        # Check and add columns to notifications table
        db.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE DEFAULT NULL;"))
        db.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS module VARCHAR(100) DEFAULT NULL;"))
        db.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS reference_id INTEGER DEFAULT NULL;"))
        
        # Ensure existing assignments default safely to 'Published'
        db.execute(text("UPDATE assignments SET status = 'Published' WHERE status IS NULL OR status = 'Open';"))
        
        # Create domains table if not exists
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS domains (
                domain_id SERIAL PRIMARY KEY,
                domain_key VARCHAR(100) UNIQUE NOT NULL,
                category VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                icon VARCHAR(100) NOT NULL,
                difficulty VARCHAR(50) NOT NULL DEFAULT 'Intermediate',
                duration VARCHAR(50) NOT NULL DEFAULT '100 Hours',
                avg_salary VARCHAR(100) NOT NULL DEFAULT '$80,000',
                popular BOOLEAN NOT NULL DEFAULT FALSE,
                skills JSONB NOT NULL DEFAULT '[]'::jsonb,
                roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
                courses JSONB NOT NULL DEFAULT '[]'::jsonb,
                certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
                projects JSONB NOT NULL DEFAULT '[]'::jsonb,
                salary JSONB NOT NULL DEFAULT '{}'::jsonb,
                placements JSONB NOT NULL DEFAULT '[]'::jsonb,
                learning_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
                interview_prep JSONB NOT NULL DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create college_notes table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS college_notes (
                note_id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                semester INTEGER NOT NULL,
                subject_code VARCHAR(50) NOT NULL,
                subject_name VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_size INTEGER NOT NULL,
                download_count INTEGER DEFAULT 0,
                institution_id INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create programming_topics table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS programming_topics (
                topic_id SERIAL PRIMARY KEY,
                category VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                icon VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create programming_questions table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS programming_questions (
                question_id SERIAL PRIMARY KEY,
                topic_id INTEGER REFERENCES programming_topics(topic_id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                difficulty VARCHAR(50) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create student_programming_progress table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_programming_progress (
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                question_id INTEGER REFERENCES programming_questions(question_id) ON DELETE CASCADE,
                completed BOOLEAN DEFAULT TRUE,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_id, question_id)
            );
        """))

        # Alter student_metrics table
        db.execute(text("ALTER TABLE student_metrics ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;"))
        db.execute(text("ALTER TABLE student_metrics ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT NULL;"))
        
        # Create student_badges table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_badges (
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                badge_id VARCHAR(100) NOT NULL,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_id, badge_id)
            );
        """))
        
        # Create quiz_attempts table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                attempt_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                node_id VARCHAR(100) NOT NULL,
                domain_id VARCHAR(100) NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                xp_earned INTEGER NOT NULL,
                passed BOOLEAN NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create student_career_profiles table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_career_profiles (
                student_id INTEGER PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
                resume_text TEXT DEFAULT NULL,
                target_career VARCHAR(100) DEFAULT 'ai-engineer',
                custom_skills JSONB DEFAULT '[]'::jsonb,
                ai_analysis JSONB DEFAULT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create student_academic_predictions table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_academic_predictions (
                prediction_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                age INTEGER NOT NULL,
                studytime INTEGER NOT NULL,
                failures INTEGER NOT NULL,
                absences INTEGER NOT NULL,
                g1_score NUMERIC(5, 2) NOT NULL,
                g2_score NUMERIC(5, 2) NOT NULL,
                predicted_grade NUMERIC(5, 2) NOT NULL,
                predicted_cgpa NUMERIC(5, 2) NOT NULL,
                attendance_rate NUMERIC(5, 2) NOT NULL,
                backlog_risk NUMERIC(5, 2) NOT NULL,
                risk_level VARCHAR(50) NOT NULL,
                weak_subjects TEXT NULL,
                recommendations TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Check and add columns to wellness_mood_logs table
        db.execute(text("ALTER TABLE wellness_mood_logs ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(5, 2) DEFAULT 8.00;"))
        db.execute(text("ALTER TABLE wellness_mood_logs ADD COLUMN IF NOT EXISTS study_hours NUMERIC(5, 2) DEFAULT 0.00;"))
        db.execute(text("ALTER TABLE wellness_mood_logs ADD COLUMN IF NOT EXISTS learning_habits TEXT DEFAULT '[]';"))
        db.execute(text("ALTER TABLE wellness_mood_logs ADD COLUMN IF NOT EXISTS recommendations TEXT DEFAULT '[]';"))
        
        # Check and add columns for extended profile features
        db.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile VARCHAR(20) DEFAULT NULL;"))
        db.execute(text("ALTER TABLE student_career_profiles ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb;"))
        db.execute(text("ALTER TABLE student_career_profiles ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;"))
        
        # Create token_blacklist table for logout invalidation
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS token_blacklist (
                token TEXT PRIMARY KEY,
                blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Create learning_wellness_logs
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS learning_wellness_logs (
                log_id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
                mood VARCHAR(50) NOT NULL,
                energy_level INTEGER NOT NULL,
                focus_level INTEGER NOT NULL,
                stress_level INTEGER NOT NULL,
                sleep_hours NUMERIC(5, 2) NOT NULL,
                planned_study_hours NUMERIC(5, 2) NOT NULL,
                learning_goal TEXT,
                log_date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        """))

        # Create focus_sessions
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS focus_sessions (
                session_id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
                preset_minutes INTEGER NOT NULL,
                duration_minutes INTEGER DEFAULT 0,
                status VARCHAR(50) NOT NULL,
                started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        """))

        # Create weekly_reflections
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS weekly_reflections (
                reflection_id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
                reflection_text TEXT NOT NULL,
                ref_date DATE NOT NULL DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        """))

        # Create wellness_preferences
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS wellness_preferences (
                preference_id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE UNIQUE,
                pomodoro_preset INTEGER DEFAULT 25,
                daily_study_goal NUMERIC(5, 2) DEFAULT 4.00,
                daily_sleep_goal NUMERIC(5, 2) DEFAULT 8.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        """))

        # Create wellness_statistics
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS wellness_statistics (
                stat_id SERIAL PRIMARY KEY,
                student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE UNIQUE,
                focus_score NUMERIC(5, 2) DEFAULT 0.00,
                weekly_study_hours NUMERIC(5, 2) DEFAULT 0.00,
                focus_sessions_count INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                average_sleep NUMERIC(5, 2) DEFAULT 0.00,
                average_focus NUMERIC(5, 2) DEFAULT 0.00,
                average_study_hours NUMERIC(5, 2) DEFAULT 0.00,
                completed_sessions INTEGER DEFAULT 0,
                interrupted_sessions INTEGER DEFAULT 0,
                avg_session_duration NUMERIC(5, 2) DEFAULT 0.00,
                attendance_rate NUMERIC(5, 2) DEFAULT 0.00,
                assignment_completion_rate NUMERIC(5, 2) DEFAULT 0.00,
                quiz_performance_rate NUMERIC(5, 2) DEFAULT 0.00,
                learning_consistency NUMERIC(5, 2) DEFAULT 0.00,
                last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE
            );
        """))
        
        db.commit()
        try:
            from backend.create_indexes import create_database_indexes
            create_database_indexes()
        except Exception as idx_err:
            print(f"Warning: Could not create database indexes automatically: {idx_err}")


    except Exception as e:
        db.rollback()
    finally:
        db.close()

run_migrations()

import os
from dotenv import load_dotenv
load_dotenv()

# Gemini API Key startup check
gemini_key = os.getenv("GEMINI_API_KEY")


# --- JWT Config & Helpers ---
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is not set!")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
DEFAULT_ACADEMIC_YEAR = os.getenv("DEFAULT_ACADEMIC_YEAR", "2026-2027")
RISK_MODEL_VERSION = os.getenv("RISK_MODEL_VERSION", "Rule-Based V1.0")

def get_current_academic_year(db, institution_id: Optional[int] = None) -> str:
    try:
        iid = institution_id if institution_id is not None else 1
        row = db.execute(
            text("""
                SELECT academic_year 
                FROM academic_terms 
                WHERE institution_id = :iid 
                ORDER BY academic_year DESC 
                LIMIT 1
            """),
            {"iid": iid}
        ).fetchone()
        if row and row.academic_year:
            return row.academic_year
    except Exception as e:
        print(f"Error fetching current academic year from DB: {e}")
    return DEFAULT_ACADEMIC_YEAR

security = HTTPBearer()

allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent

# Load ML model
student_model = None
try:
    student_model = joblib.load(
        BASE_DIR / "models" / "academic" / "student_performance_rf.pkl"
    )
except Exception as e:
    print(f"Error loading student performance model: {e}")





# --- Public / Core Routes ---

@app.get("/")
def home():
    return {"message": "NeuroLearn AI Backend Running"}

# --- Authentication Endpoints ---

failed_logins_tracker = {}


@app.post("/api/predict/student-performance")
def predict_student_performance(data: StudentPerformanceInput, current_user: dict = Depends(get_current_user)):
    if not student_model:
        db = SessionLocal()
        try:
            if data.G1 > 0 or data.G2 > 0:
                predicted_grade = round((float(data.G1) + float(data.G2)) / 2.0, 2)
            else:
                student_id = current_user.get("student_id") if current_user["role"] == "student" else None
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
        finally:
            db.close()
            
    prediction = student_model.predict([
        [
            0, 0, data.age, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
            data.studytime, data.failures, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 1, 1, 3, data.absences, data.G1, data.G2, 0
        ]
    ])
    return {"predicted_grade": round(float(prediction[0]), 2)}


# --- faculty Telemetry Routes ---










# --- Faculty Mapping CRUD ---






# --- Course CRUD ---






# --- Subject CRUD ---






# --- Class CRUD ---






# --- Phase B: Department CRUD & Stats ---







# --- Phase C: Enrollment Management & History ---







# --- Phase D: Course-Subject Mapping ---





# --- Phase E: Announcement Center ---

def fetch_announcements_helper(db, current_user: dict):
    role = current_user["role"] 
    iid = current_user.get("institution_id")
    
    if role == "admin":
        # Admin sees all announcements in their institution
        query = text("SELECT * FROM announcements WHERE institution_id = :iid ORDER BY announcement_id DESC")
        result = db.execute(query, {"iid": iid}).fetchall()
        
    elif role == "faculty":
        # faculty sees: Institution targets, Faculty targets, and their own sent announcements
        faculty_id = current_user["faculty_id"]
        faculty = db.execute(text("SELECT department FROM faculty WHERE faculty_id = :fid"), {"fid": faculty_id}).fetchone()
        dept = faculty.department if faculty else ""
        
        query = text("""
            SELECT DISTINCT a.* FROM announcements a
            WHERE a.institution_id = :iid
              AND (
                a.target_type = 'Institution'
                OR (a.target_type = 'Faculty' AND (a.target_id IS NULL OR a.target_id = :fid))
                OR (a.target_type = 'Department' AND a.target_id IN (
                    SELECT department_id FROM departments WHERE department_name = :dept OR department_code = :dept
                ))
                OR (a.sender_type = 'faculty' AND a.sender_id = :fid)
              )
            ORDER BY a.announcement_id DESC
        """)
        result = db.execute(query, {"fid": faculty_id, "dept": dept, "iid": iid}).fetchall()
        
    elif role == "student":
        # Student sees: Institution, Department, Class (if enrolled), or Student (if they are the target)
        student_id = current_user["student_id"]
        student = db.execute(text("SELECT department, student_id FROM students WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        dept = student.department if student else ""
        
        # Find enrolled classes
        enrolled_classes = db.execute(text("SELECT class_id FROM enrollments WHERE student_id = :sid"), {"sid": student_id}).fetchall()
        class_ids = [c.class_id for c in enrolled_classes]
        if not class_ids:
            class_ids = [-1]
            
        query = text("""
            SELECT DISTINCT a.* FROM announcements a
            WHERE a.institution_id = :iid
              AND (
                a.target_type = 'Institution'
                OR (a.target_type = 'Department' AND a.target_id IN (
                    SELECT department_id FROM departments WHERE department_code = :dept OR department_name = :dept
                ))
                OR (a.target_type = 'Class' AND a.target_id IN :class_ids)
                OR (a.target_type = 'Student' AND a.target_id = :sid)
              )
            ORDER BY a.announcement_id DESC
        """)
        result = db.execute(query.bindparams(class_ids=tuple(class_ids)), {"sid": student_id, "dept": dept, "iid": iid}).fetchall()
    else:
        result = []

    # Seen/Unseen read status tracking
    user_id = current_user["user_id"]
    reads = db.execute(
        text("SELECT announcement_id FROM announcement_reads WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchall()
    read_set = {r.announcement_id for r in reads}

    announcements = []
    for r in result:
        # Resolve sender name
        sender_name = "System Administrator"
        if r.sender_type == "faculty":
            sender = db.execute(text("SELECT full_name FROM faculty WHERE faculty_id = :fid"), {"fid": r.sender_id}).fetchone()
            if sender:
                sender_name = sender.full_name
        
        announcements.append({
            "announcement_id": r.announcement_id,
            "title": r.title,
            "description": r.description,
            "sender_type": r.sender_type,
            "sender_id": r.sender_id,
            "sender_name": sender_name,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "created_at": str(r.created_at),
            "is_read": r.announcement_id in read_set,
            "priority": getattr(r, 'priority', 'Normal') or 'Normal',
            "attachment_url": getattr(r, 'attachment_url', None),
            "attachment_name": getattr(r, 'attachment_name', None),
            "is_edited": bool(getattr(r, 'is_edited', 0))
        })
    return announcements

def create_announcement_helper(db, data: AnnouncementInput, current_user: dict):
    sender_type = current_user["role"]
    sender_id = current_user["faculty_id"] if sender_type == "faculty" else current_user["user_id"]
    iid = current_user["institution_id"]
    
    priority = getattr(data, 'priority', 'Normal') or 'Normal'
    attachment_url = getattr(data, 'attachment_url', None)
    attachment_name = getattr(data, 'attachment_name', None)

    new_id = db.execute(
        text("""
            INSERT INTO announcements
            (title, description, sender_type, sender_id, target_type, target_id, institution_id, priority, attachment_url, attachment_name, is_edited, created_at)
            VALUES
            (:title, :description, :sender_type, :sender_id, :target_type, :target_id, :iid, :priority, :attachment_url, :attachment_name, 0, CURRENT_TIMESTAMP)
            RETURNING announcement_id
        """),
        {
            "title": data.title,
            "description": data.description,
            "sender_type": sender_type,
            "sender_id": sender_id,
            "target_type": data.target_type,
            "target_id": data.target_id,
            "iid": iid,
            "priority": priority,
            "attachment_url": attachment_url,
            "attachment_name": attachment_name
        }
    ).scalar()

    db.commit()
    
    # Send notifications to target students
    student_ids = []
    if data.target_type == "Class" or data.target_type == "class":
        rows = db.execute(text("SELECT student_id FROM enrollments WHERE class_id = :cid"), {"cid": data.target_id}).fetchall()
        student_ids = [r.student_id for r in rows]
    elif data.target_type == "All" or data.target_type == "all" or data.target_type == "Institution" or data.target_type == "institution":
        rows = db.execute(text("SELECT student_id FROM students WHERE institution_id = :iid"), {"iid": iid}).fetchall()
        student_ids = [r.student_id for r in rows]
    elif data.target_type == "Department" or data.target_type == "department":
        dept_row = db.execute(text("SELECT department_name FROM departments WHERE department_id = :did"), {"did": data.target_id}).fetchone()
        if dept_row:
            rows = db.execute(text("SELECT student_id FROM students WHERE department = :dept AND institution_id = :iid"), {"dept": dept_row.department_name, "iid": iid}).fetchall()
            student_ids = [r.student_id for r in rows]
            
    # Sender name
    sender_name = "System"
    if sender_type == "faculty":
        fac_row = db.execute(text("SELECT full_name FROM faculty WHERE faculty_id = :fid"), {"fid": sender_id}).fetchone()
        if fac_row:
            sender_name = fac_row.full_name
            
    for sid in student_ids:
        create_notification(
            db,
            "student",
            sid,
            "New Announcement",
            f"New announcement from {sender_name}: '{data.title}'",
            "announcement",
            new_id
        )
        
    if sender_type == "faculty":
        log_faculty_activity(db, sender_id, "posted", "announcement", f"Posted announcement '{data.title}'.", new_id)
        create_notification(db, "faculty", sender_id, "Announcement Published", f"Announcement '{data.title}' published successfully.", "announcement", new_id)
        
    log_audit(db, "CREATE", "Announcement", new_id, performed_by=f"{sender_type.capitalize()} {sender_id}")
    return new_id

def update_announcement_helper(db, announcement_id: int, data: AnnouncementInput, current_user: dict):
    ann = db.execute(text("SELECT sender_type, sender_id, institution_id FROM announcements WHERE announcement_id = :id"), {"id": announcement_id}).fetchone()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.institution_id != current_user["institution_id"]:
        raise HTTPException(status_code=403, detail="Access denied: Announcement belongs to another institution")

    if current_user["role"] == "faculty":
        if ann.sender_type != "faculty" or ann.sender_id != current_user["faculty_id"]:
            raise HTTPException(status_code=403, detail="Access denied: You do not own this announcement")

    priority = getattr(data, 'priority', 'Normal') or 'Normal'
    attachment_url = getattr(data, 'attachment_url', None)
    attachment_name = getattr(data, 'attachment_name', None)

    db.execute(
        text("""
            UPDATE announcements
            SET title = :title,
                description = :description,
                target_type = :target_type,
                target_id = :target_id,
                priority = :priority,
                attachment_url = :attachment_url,
                attachment_name = :attachment_name,
                is_edited = 1
            WHERE announcement_id = :announcement_id
        """),
        {
            "title": data.title,
            "description": data.description,
            "target_type": data.target_type,
            "target_id": data.target_id,
            "priority": priority,
            "attachment_url": attachment_url,
            "attachment_name": attachment_name,
            "announcement_id": announcement_id
        }
    )
    db.commit()
    log_audit(db, "UPDATE", "Announcement", announcement_id, performed_by=f"{current_user['role'].capitalize()} {current_user['user_id']}")

def delete_announcement_helper(db, announcement_id: int, current_user: dict):
    ann = db.execute(text("SELECT sender_type, sender_id, institution_id FROM announcements WHERE announcement_id = :id"), {"id": announcement_id}).fetchone()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    if ann.institution_id != current_user["institution_id"]:
        raise HTTPException(status_code=403, detail="Access denied: Announcement belongs to another institution")

    if current_user["role"] == "faculty":
        if ann.sender_type != "faculty" or ann.sender_id != current_user["faculty_id"]:
            raise HTTPException(status_code=403, detail="Access denied: You do not own this announcement")

    db.execute(text("DELETE FROM announcements WHERE announcement_id = :id"), {"id": announcement_id})
    db.commit()
    log_audit(db, "DELETE", "Announcement", announcement_id, performed_by=f"{current_user['role'].capitalize()} {current_user['user_id']}")




# --- Phase F: Faculty Workload & Audit Logs & Dashboard Stats ---





# --- Academic Terms CRUD ---






# --- Institution Branding Endpoints ---




# --- System Settings (Admin Settings Center) ---







# --- Pydantic Schemas for V1 faculty Portal ---















# --- faculty Portal V1 Endpoints ---








@app.get("/api/student/{student_id}/profile")
@app.get("/student/{student_id}/profile")

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






















# --- Phase F: Student Hub Endpoints ---
















# --- Remedial Reusable Helpers ---




























# --- GRADEBOOK ERP DATABASE MIGRATIONS & ADMIN ENDPOINTS ---

def run_gradebook_migrations():
    db = SessionLocal()
    try:
        # 1. Create subject_assessments table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS subject_assessments (
                subject_assessment_id SERIAL PRIMARY KEY,
                academic_year VARCHAR(50) NOT NULL,
                semester INTEGER NOT NULL,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                max_marks NUMERIC(5, 2) NOT NULL,
                weightage NUMERIC(5, 2) NOT NULL,
                display_order INTEGER DEFAULT 0,
                is_mandatory BOOLEAN DEFAULT TRUE,
                visible_to_students BOOLEAN DEFAULT TRUE,
                editable_by_faculty BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(academic_year, semester, subject_id, name)
            );
        """))
        # 2. Create student_assessment_marks table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_assessment_marks (
                entry_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                subject_assessment_id INTEGER REFERENCES subject_assessments(subject_assessment_id) ON DELETE CASCADE,
                marks_obtained NUMERIC(5, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, subject_assessment_id)
            );
        """))
        # 3. Add is_published to student_marks if missing
        from sqlalchemy import inspect
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('student_marks')]
        if 'is_published' not in columns:
            db.execute(text("ALTER TABLE student_marks ADD COLUMN is_published BOOLEAN DEFAULT FALSE;"))
            # For backward compatibility, set existing marks to published
            db.execute(text("UPDATE student_marks SET is_published = TRUE WHERE is_published IS NULL;"))
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during Gradebook ERP migration: {e}")
    finally:
        db.close()


def run_remedial_migrations():
    db = SessionLocal()
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('remedial_sessions')]
        if 'cancellation_reason' not in columns:
            db.execute(text("ALTER TABLE remedial_sessions ADD COLUMN cancellation_reason TEXT;"))
        if 'completed_at' not in columns:
            db.execute(text("ALTER TABLE remedial_sessions ADD COLUMN completed_at TIMESTAMP;"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during Remedial migrations: {e}")
    finally:
        db.close()


@app.on_event("startup")
def startup_gradebook():
    run_gradebook_migrations()
    run_remedial_migrations()


# Admin Endpoints for Subject Assessment Configuration

@app.get("/api/v1/subjects/{subject_id}/assessments")
def get_subject_assessments(subject_id: int, academic_year: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "super_admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        subj = db.execute(text("SELECT semester FROM subjects WHERE subject_id = :sid"), {"sid": subject_id}).fetchone()
        if not subj:
            raise HTTPException(status_code=404, detail="Subject not found.")
        semester = subj.semester
        
        ay = academic_year or get_current_academic_year(db, current_user.get("institution_id"))
        components = db.execute(text("""
            SELECT * FROM subject_assessments 
            WHERE academic_year = :ay AND semester = :sem AND subject_id = :sid 
            ORDER BY display_order, name
        """), {"ay": ay, "sem": semester, "sid": subject_id}).fetchall()
        
        return [
            {
                "subject_assessment_id": c.subject_assessment_id,
                "name": c.name,
                "category": c.category,
                "max_marks": float(c.max_marks),
                "weightage": float(c.weightage),
                "display_order": c.display_order,
                "is_mandatory": bool(c.is_mandatory),
                "visible_to_students": bool(c.visible_to_students),
                "editable_by_faculty": bool(c.editable_by_faculty)
            } for c in components
        ]
    finally:
        db.close()





@app.post("/api/v1/subjects/{subject_id}/assessments")
def save_subject_assessments(subject_id: int, data: SubjectAssessmentsSaveInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        subj = db.execute(text("SELECT semester FROM subjects WHERE subject_id = :sid"), {"sid": subject_id}).fetchone()
        if not subj:
            raise HTTPException(status_code=404, detail="Subject not found.")
        semester = subj.semester
        
        # Load existing components
        existing_comps = db.execute(text("""
            SELECT subject_assessment_id, name FROM subject_assessments 
            WHERE academic_year = :ay AND semester = :sem AND subject_id = :sid
        """), {"ay": data.academic_year, "sem": semester, "sid": subject_id}).fetchall()
        existing_map = {ec.name: ec.subject_assessment_id for ec in existing_comps}
        
        new_comp_ids = []
        
        for c in data.components:
            if c.name in existing_map:
                comp_id = existing_map[c.name]
                db.execute(text("""
                    UPDATE subject_assessments 
                    SET category = :category, max_marks = :max_marks, weightage = :weightage, 
                        display_order = :display_order, is_mandatory = :is_mandatory, 
                        visible_to_students = :visible_to_students, editable_by_faculty = :editable_by_faculty,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE subject_assessment_id = :aid
                """), {
                    "category": c.category,
                    "max_marks": c.max_marks,
                    "weightage": c.weightage,
                    "display_order": c.display_order,
                    "is_mandatory": c.is_mandatory,
                    "visible_to_students": c.visible_to_students,
                    "editable_by_faculty": c.editable_by_faculty,
                    "aid": comp_id
                })
                new_comp_ids.append(comp_id)
            else:
                comp_id = db.execute(text("""
                    INSERT INTO subject_assessments (academic_year, semester, subject_id, name, category, max_marks, weightage, display_order, is_mandatory, visible_to_students, editable_by_faculty)
                    VALUES (:ay, :sem, :sid, :name, :category, :max_marks, :weightage, :display_order, :is_mandatory, :visible_to_students, :editable_by_faculty)
                    RETURNING subject_assessment_id
                """), {
                    "ay": data.academic_year,
                    "sem": semester,
                    "sid": subject_id,
                    "name": c.name,
                    "category": c.category,
                    "max_marks": c.max_marks,
                    "weightage": c.weightage,
                    "display_order": c.display_order,
                    "is_mandatory": c.is_mandatory,
                    "visible_to_students": c.visible_to_students,
                    "editable_by_faculty": c.editable_by_faculty
                }).scalar()
                new_comp_ids.append(comp_id)
                
        # Delete old components
        for name, comp_id in existing_map.items():
            if comp_id not in new_comp_ids:
                db.execute(text("""
                    DELETE FROM student_assessment_marks WHERE subject_assessment_id = :aid
                """), {"aid": comp_id})
                db.execute(text("""
                    DELETE FROM subject_assessments WHERE subject_assessment_id = :aid
                """), {"aid": comp_id})
                
        db.commit()
        log_audit(db, "CONFIGURE_SUBJECT_ASSESSMENTS", "Subject", subject_id, f"Admin {current_user.get('user_id')}")
        return {"success": True, "message": "Subject assessment structure saved successfully!"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()



# =====================================================================
# --- FACULTY PRODUCTIVITY HUB: NOTIFICATIONS & ACTIVITIES ---
# =====================================================================

def create_faculty_notification(db, faculty_id: int, title: str, message: str, type: str, related_id: Optional[int] = None):
    create_notification(db, "faculty", faculty_id, title, message, type, related_id)

def ensure_default_notifications(db, faculty_id: int):
    count = db.execute(
        text("SELECT COUNT(*) FROM notifications WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).scalar()
    if count > 0:
        return
    
    # Seed Announcements
    announcements = db.execute(text("""
        SELECT announcement_id, title, created_at FROM announcements
        WHERE sender_type = 'faculty' AND sender_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in announcements:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, :title, :msg, 'announcement', 'announcement', :rid, :rid, TRUE, :created)
        """), {
            "fid": faculty_id,
            "title": "Announcement Published",
            "msg": f"Your announcement '{a.title}' was successfully broadcasted.",
            "rid": a.announcement_id,
            "created": a.created_at
        })
        
    # Seed Remedial Sessions
    remedials = db.execute(text("""
        SELECT session_id, topic, session_date FROM remedial_sessions
        WHERE faculty_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for r in remedials:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, :title, :msg, 'remedial', 'remedial', :rid, :rid, FALSE, CURRENT_TIMESTAMP - INTERVAL '1 day')
        """), {
            "fid": faculty_id,
            "title": "Remedial Class Scheduled",
            "msg": f"Support session for '{r.topic}' scheduled on {r.session_date}.",
            "rid": r.session_id
        })
        
    # Seed Assignments
    assignments = db.execute(text("""
        SELECT a.assignment_id, a.title, c.class_name, a.created_at FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
        WHERE fa.faculty_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in assignments:
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, :title, :msg, 'assignment', 'assignment', :rid, :rid, FALSE, :created)
        """), {
            "fid": faculty_id,
            "title": "Assignment Created",
            "msg": f"New assignment '{a.title}' published to {a.class_name}.",
            "rid": a.assignment_id,
            "created": a.created_at
        })
        
    # Seed Risk Warnings
    classes = db.execute(text("SELECT DISTINCT class_id FROM faculty_assignments WHERE faculty_id = :fid"), {"fid": faculty_id}).fetchall()
    for c in classes:
        high_risk_count = db.execute(text("""
            SELECT COUNT(*) FROM student_metrics sm
            JOIN enrollments e ON sm.student_id = e.student_id
            WHERE e.class_id = :cid AND sm.risk_level = 'High'
        """), {"cid": c.class_id}).scalar() or 0
        if high_risk_count > 0:
            db.execute(text("""
                INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
                VALUES (:fid, :title, :msg, 'risk', 'risk', :rid, :rid, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours')
            """), {
                "fid": faculty_id,
                "title": "High Risk Warning",
                "msg": f"{high_risk_count} students flagged as High Risk in your class. Immediate intervention recommended.",
                "rid": c.class_id
            })
            
    # Seed Attendance
    attendance = db.execute(text("""
        SELECT DISTINCT class_id, subject_id, attendance_date FROM attendance_records
        WHERE faculty_id = :fid
        ORDER BY attendance_date DESC
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for att in attendance:
        c_name = db.execute(text("SELECT class_name FROM classes WHERE class_id = :cid"), {"cid": att.class_id}).scalar()
        s_name = db.execute(text("SELECT subject_name FROM subjects WHERE subject_id = :sid"), {"sid": att.subject_id}).scalar()
        db.execute(text("""
            INSERT INTO notifications (faculty_id, title, message, type, module, related_id, reference_id, is_read, created_at)
            VALUES (:fid, :title, :msg, 'attendance', 'attendance', :rid, :rid, TRUE, :created)
        """), {
            "fid": faculty_id,
            "title": "Attendance Recorded",
            "msg": f"Attendance successfully saved for {c_name} ({s_name}) on {att.attendance_date}.",
            "rid": att.class_id,
            "created": datetime.combine(att.attendance_date, datetime.min.time())
        })
    db.commit()






@app.post("/api/quiz/submit")
@app.post("/api/v1/quiz/submit")
def submit_quiz_score(data: QuizSubmitInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Only students can submit quiz scores")
            
        accuracy = (data.score / data.total_questions) if data.total_questions > 0 else 0.0
        passed = accuracy >= 0.60
        
        # 1. Insert into quiz_attempts
        db.execute(text("""
            INSERT INTO quiz_attempts (student_id, node_id, domain_id, score, total_questions, xp_earned, passed)
            VALUES (:sid, :nid, :did, :score, :tq, :xp, :passed)
        """), {
            "sid": student_id,
            "nid": data.node_id,
            "did": data.domain_id,
            "score": int(data.score),
            "tq": data.total_questions,
            "xp": data.xp_earned,
            "passed": passed
        })
        
        # 2. Calculate and update streak
        metrics = db.execute(text("SELECT streak, last_active_date FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        current_streak = metrics.streak if metrics and metrics.streak else 0
        last_active = metrics.last_active_date if metrics else None
        
        today = datetime.now().date()
        if last_active:
            if last_active == today:
                pass
            elif last_active == today - timedelta(days=1):
                current_streak += 1
            else:
                current_streak = 1
        else:
            current_streak = 1
            
        # 3. Update student metrics (XP & Streak)
        db.execute(text("""
            UPDATE student_metrics 
            SET xp_points = xp_points + :xp, streak = :streak, last_active_date = :today, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = :sid
        """), {"xp": data.xp_earned, "streak": current_streak, "today": today, "sid": student_id})
        
        # 4. Insert completion notification
        db.execute(text("""
            INSERT INTO notifications (student_id, title, message, type, created_at)
            VALUES (:sid, 'Quiz Completed', :msg, 'general', CURRENT_TIMESTAMP)
        """), {
            "sid": student_id,
            "msg": f"Congratulations! You completed the quiz for '{data.node_id}' and earned {data.xp_earned} XP."
        })
        
        # 5. Badge Unlocks Check
        unlocked_res = db.execute(text("SELECT badge_id FROM student_badges WHERE student_id = :sid"), {"sid": student_id}).fetchall()
        unlocked_badge_ids = {r.badge_id for r in unlocked_res}
        
        new_badges = []
        
        # Check: AI Enthusiast (b12) -> 100% score on any AI/ML quiz
        if data.domain_id == 'artificial-intelligence' and accuracy >= 1.0 and "b12" not in unlocked_badge_ids:
            new_badges.append(("b12", "AI Enthusiast", 200))
            
        # Check: Consistent Learner (b5) -> 15 day streak
        if current_streak >= 15 and "b5" not in unlocked_badge_ids:
            new_badges.append(("b5", "Consistent Learner", 200))
            
        # Check: Quiz Master (b10) -> 5 quizzes completed successfully
        quizzes_passed = db.execute(text("SELECT COUNT(*) FROM quiz_attempts WHERE student_id = :sid AND passed = TRUE"), {"sid": student_id}).scalar() or 0
        if quizzes_passed >= 5 and "b10" not in unlocked_badge_ids:
            new_badges.append(("b10", "Quiz Master", 300))
            
        # Check: Knowledge Explorer (b11) -> Quizzes attempted in 4 different domains
        unique_domains = db.execute(text("SELECT COUNT(DISTINCT domain_id) FROM quiz_attempts WHERE student_id = :sid"), {"sid": student_id}).scalar() or 0
        if unique_domains >= 4 and "b11" not in unlocked_badge_ids:
            new_badges.append(("b11", "Knowledge Explorer", 150))
            
        # Insert new badges and trigger notifications
        for bid, bname, reward in new_badges:
            db.execute(text("""
                INSERT INTO student_badges (student_id, badge_id)
                VALUES (:sid, :bid) ON CONFLICT DO NOTHING
            """), {"sid": student_id, "bid": bid})
            db.execute(text("""
                UPDATE student_metrics SET xp_points = xp_points + :reward WHERE student_id = :sid
            """), {"reward": reward, "sid": student_id})
            db.execute(text("""
                INSERT INTO notifications (student_id, title, message, type, created_at)
                VALUES (:sid, 'Badge Unlocked!', :msg, 'general', CURRENT_TIMESTAMP)
            """), {
                "sid": student_id,
                "msg": f"Prestige Unlock: You earned the '{bname}' badge and +{reward} XP!"
            })
            
        db.commit()
        return {"status": "success", "xp_earned": data.xp_earned, "passed": passed, "streak": current_streak, "unlocked_badges": [b[1] for b in new_badges]}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()