# main.py
import re
import joblib
from pathlib import Path
from datetime import datetime, timedelta
import jwt
import bcrypt
import random
from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import text
from backend.database import SessionLocal, engine
from typing import Optional, List, Dict, Union

app = FastAPI()

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
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_domains_key ON domains(domain_key);"))
        
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
        
        db.commit()
        print("Migrations executed successfully!")


    except Exception as e:
        db.rollback()
        print(f"Error executing migrations: {e}")
    finally:
        db.close()

run_migrations()

import os
from dotenv import load_dotenv
load_dotenv()

# --- JWT Config & Helpers ---
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is not set!")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120
REFRESH_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer()

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str, token_type: str = "access"):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")
        
    payload = verify_token(token, "access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
        
    # Check logout invalidation / blacklisted token
    db = SessionLocal()
    try:
        blacklisted = db.execute(text("SELECT 1 FROM token_blacklist WHERE token = :t"), {"t": token}).fetchone()
        if blacklisted:
            raise HTTPException(status_code=401, detail="Token has been invalidated by logout")
    finally:
        db.close()
        
    return payload

def require_role(allowed_roles: list):
    def dependency(payload: dict = Depends(get_current_user)):
        if payload.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return payload
    return dependency

def verify_faculty_access(db, faculty_id: int, class_id: int, subject_id: Optional[int] = None):
    # Lookup faculty institution
    f = db.execute(
        text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).fetchone()
    # Lookup class institution
    c = db.execute(
        text("SELECT institution_id FROM classes WHERE class_id = :cid"),
        {"cid": class_id}
    ).fetchone()
    
    if not f or not c or f.institution_id != c.institution_id:
        raise HTTPException(status_code=403, detail="Access denied: Faculty and Class institution mismatch.")

    if subject_id:
        query = text("""
            SELECT 1 FROM faculty_assignments 
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """)
        res = db.execute(query, {"fid": faculty_id, "cid": class_id, "sid": subject_id}).fetchone()
    else:
        query = text("""
            SELECT 1 FROM faculty_assignments 
            WHERE faculty_id = :fid AND class_id = :cid
        """)
        res = db.execute(query, {"fid": faculty_id, "cid": class_id}).fetchone()
    
    if not res:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this class or subject.")

def verify_student_access(current_user: dict, student_id: int):
    db = SessionLocal()
    try:
        # Verify student belongs to user's institution
        student = db.execute(
            text("SELECT institution_id FROM students WHERE student_id = :sid"),
            {"sid": student_id}
        ).fetchone()
        if not student or student.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Student belongs to another institution.")
        
        if current_user["role"] == "admin":
            return
        if current_user["role"] == "faculty":
            query = text("""
                SELECT 1 FROM enrollments e
                JOIN faculty_assignments fa ON e.class_id = fa.class_id
                WHERE fa.faculty_id = :fid AND e.student_id = :sid
            """)
            res = db.execute(query, {"fid": current_user["faculty_id"], "sid": student_id}).fetchone()
            if not res:
                raise HTTPException(status_code=403, detail="Access denied: Student not in your classes.")
            return
        if current_user["role"] == "student":
            if current_user["student_id"] != student_id:
                raise HTTPException(status_code=403, detail="Access denied: You can only access your own data.")
    finally:
        db.close()



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


# --- Pydantic Schemas ---

class StudentPerformanceInput(BaseModel):
    age: int
    studytime: int
    failures: int
    absences: int
    G1: int
    G2: int

class AttendanceInput(BaseModel):
    student_id: int
    class_id: int
    attendance_date: str
    status: str

class SubjectInput(BaseModel):
    subject_code: str
    subject_name: str
    credits: int
    department: str
    semester: int

class FacultyMappingInput(BaseModel):
    faculty_id: int
    subject_id: int
    class_id: int
    academic_year: str

class StudentInput(BaseModel):
    roll_no: str
    full_name: str
    email: str
    department: str
    semester: int
    division: str

class FacultyInput(BaseModel):
    faculty_code: str
    full_name: str
    email: str
    department: str
    designation: str

class DepartmentInput(BaseModel):
    department_name: str
    department_code: str

class ForgotPasswordInput(BaseModel):
    email: str

class ClassInput(BaseModel):
    class_name: str
    division: str
    department: str
    semester: int
    term_id: Optional[int] = None

class EnrollmentInput(BaseModel):
    student_id: int
    class_id: int

class CourseInput(BaseModel):
    course_code: str
    course_title: str
    department: str
    category: str
    duration: str

class CourseSubjectMappingInput(BaseModel):
    course_id: int
    subject_id: int

class AnnouncementInput(BaseModel):
    title: str
    description: str

    target_type: str
    target_id: Optional[int] = None
    priority: Optional[str] = "Normal"  # Normal, Important, Urgent
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None

class AcademicTermInput(BaseModel):
    academic_year: str
    semester: int

class SystemSettingsInput(BaseModel):
    institution_name: str
    institution_logo: Optional[str] = ""
    academic_year: str
    contact_email: Optional[str] = ""
    contact_phone: Optional[str] = ""
    branding_color: Optional[str] = ""
    theme_preference: Optional[str] = ""

class LoginInput(BaseModel):
    email: str
    password: str
    role: str
    institution_id: Optional[int] = 1

class RefreshInput(BaseModel):
    refresh_token: Optional[str] = None

class RegisterInput(BaseModel):
    email: str
    password: str
    name: str
    role: str
    institution_id: Optional[int] = 1
    roll_no: Optional[str] = None
    department: Optional[str] = None
    division: Optional[str] = None
    semester: Optional[int] = None
    faculty_code: Optional[str] = None
    designation: Optional[str] = None

class InstitutionApplication(BaseModel):
    institution_name: str
    institution_code: str
    contact_person: str
    email: str
    phone: str
    website: str | None = None
    address: str


class CreateFacultyInput(BaseModel):
    full_name: str
    faculty_id: str
    department: str
    phone: str


class CreateStudentInput(BaseModel):
    full_name: str
    roll_no: str
    department: str
    semester: int
    division: str
    phone: str


class ChangePasswordInput(BaseModel):
    old_password: str
    new_password: str


class QuizSubmitInput(BaseModel):
    node_id: str
    domain_id: str
    score: float
    total_questions: int
    xp_earned: int


# --- Audit Logging Helper ---

def log_audit(db, action: str, entity_type: str, entity_id: Optional[int] = None, performed_by: str = "Admin", institution_id: Optional[int] = None):
    try:
        if institution_id is None:
            # Try to infer from performed_by user
            if performed_by:
                match = re.search(r'(Admin|Faculty|Student|User|SuperAdmin|super_admin)\s+(\d+)', performed_by, re.I)
                if match:
                    u_id = int(match.group(2))
                    # Check users table
                    row = db.execute(text("SELECT institution_id FROM users WHERE user_id = :uid"), {"uid": u_id}).fetchone()
                    if row and row.institution_id:
                        institution_id = row.institution_id
            
            # If still None, try to infer from entity
            if institution_id is None and entity_id is not None:
                table_map = {
                    "student": "students",
                    "faculty": "faculty",
                    "class": "classes",
                    "course": "courses",
                    "subject": "subjects",
                    "department": "departments",
                    "announcement": "announcements"
                }
                tbl = table_map.get(entity_type.lower())
                if tbl:
                    pkey = "student_id" if tbl == "students" else ("faculty_id" if tbl == "faculty" else (tbl[:-1] + "_id" if tbl != "classes" else "class_id"))
                    try:
                        row = db.execute(text(f"SELECT institution_id FROM {tbl} WHERE {pkey} = :eid"), {"eid": entity_id}).fetchone()
                        if row and row.institution_id:
                            institution_id = row.institution_id
                    except Exception:
                        pass
        
        db.execute(
            text("""
                INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, institution_id, created_at)
                VALUES (:action, :entity_type, :entity_id, :performed_by, :institution_id, CURRENT_TIMESTAMP)
            """),
            {
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "performed_by": performed_by,
                "institution_id": institution_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error writing audit log: {e}")


# --- Public / Core Routes ---

@app.get("/")
def home():
    return {"message": "NeuroLearn AI Backend Running"}

# --- Authentication Endpoints ---

failed_logins_tracker = {}

@app.post("/api/v1/auth/login")
def login_route(data: LoginInput, response: Response):
    # Lockout check
    now = datetime.utcnow()
    tracker = failed_logins_tracker.get(data.email, {"failed_attempts": 0, "lockout_until": None})
    if tracker["lockout_until"] and tracker["lockout_until"] > now:
        seconds_left = int((tracker["lockout_until"] - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts."
        )

    db = SessionLocal()
    try:
        # Get user
        user = db.execute(
            text("SELECT user_id, email, password_hash, role, student_id, faculty_id, institution_id, must_change_password FROM users WHERE email = :email AND role = :role"),
            {"email": data.email, "role": data.role}
        ).fetchone()

        if not user or (user.role != "super_admin" and user.institution_id != data.institution_id):
            # Log failed login attempt
            db.execute(
                text("""
                    INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                    VALUES (:email, 'LOGIN_FAILED', 'User not found, role mismatch, or wrong institution select', :iid, CURRENT_TIMESTAMP)
                """),
                {"email": data.email, "iid": data.institution_id}
            )
            db.commit()
            
            # Lockout logic
            tracker["failed_attempts"] += 1
            if tracker["failed_attempts"] >= 5:
                tracker["lockout_until"] = datetime.utcnow() + timedelta(seconds=45)
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=429, detail="Too many login attempts.")
            else:
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=400, detail="Incorrect Login ID or Password")

        # Verify password using bcrypt
        password_bytes = data.password.encode('utf-8')
        hash_bytes = user.password_hash.encode('utf-8')
        if not bcrypt.checkpw(password_bytes, hash_bytes):
            # Log failed login attempt
            db.execute(
                text("""
                    INSERT INTO security_events (user_id, email, event_type, details, institution_id, created_at)
                    VALUES (:user_id, :email, 'LOGIN_FAILED', 'Incorrect password', :iid, CURRENT_TIMESTAMP)
                """),
                {"user_id": user.user_id, "email": data.email, "iid": user.institution_id}
            )
            db.commit()
            
            # Lockout logic
            tracker["failed_attempts"] += 1
            if tracker["failed_attempts"] >= 5:
                tracker["lockout_until"] = datetime.utcnow() + timedelta(seconds=45)
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=429, detail="Too many login attempts.")
            else:
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=400, detail="Incorrect Login ID or Password")

        # Reset failed attempts on success
        if data.email in failed_logins_tracker:
            del failed_logins_tracker[data.email]

        # Fetch extra details depending on role
        name = "System Administrator"
        roll_number = None
        branch = None
        designation = None
        college = "COEP Technological University"
        inst_color = "indigo"
        inst_logo = "/assets/logo.png"
        if user.institution_id:
            inst = db.execute(
                text("SELECT institution_name, theme_color, logo_url FROM institutions WHERE institution_id = :iid"),
                {"iid": user.institution_id}
            ).fetchone()
            if inst:
                college = inst.institution_name
                inst_color = inst.theme_color
                inst_logo = inst.logo_url

        if user.role == "student" and user.student_id:
            student = db.execute(
                text("SELECT full_name, roll_no, department, division, semester FROM students WHERE student_id = :sid"),
                {"sid": user.student_id}
            ).fetchone()
            if student:
                name = student.full_name
                roll_number = student.roll_no
                branch = f"B.Tech {student.department}"
        elif user.role == "faculty" and user.faculty_id:
            faculty = db.execute(
                text("SELECT full_name, department, designation FROM faculty WHERE faculty_id = :fid"),
                {"fid": user.faculty_id}
            ).fetchone()
            if faculty:
                name = faculty.full_name
                branch = faculty.department
                designation = faculty.designation

        # Log successful login
        db.execute(
            text("""
                INSERT INTO security_events (user_id, email, event_type, details, institution_id, created_at)
                VALUES (:user_id, :email, 'LOGIN_SUCCESS', 'Successful login authentication', :iid, CURRENT_TIMESTAMP)
            """),
            {"user_id": user.user_id, "email": data.email, "iid": user.institution_id}
        )
        db.commit()
        
        # Create tokens
        token_payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "student_id": user.student_id,
            "faculty_id": user.faculty_id,
            "institution_id": user.institution_id
        }
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        # Set cookies on response
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=120 * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        # Determine avatar based on role or database avatar_url
        avatar = "🚀"
        if user.role == "super_admin":
            avatar = "👑"
        elif user.role == "admin":
            avatar = "🛡️"
        elif user.role == "faculty" and user.faculty_id:
            row = db.execute(text("SELECT avatar_url FROM faculty WHERE faculty_id = :fid"), {"fid": user.faculty_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "👨‍🏫"
        elif user.role == "student" and user.student_id:
            row = db.execute(text("SELECT avatar_url FROM students WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "🚀"

        # Assemble user payload
        user_info = {
            "email": user.email,
            "name": name,
            "role": user.role,
            "college": college,
            "institution_id": user.institution_id,
            "theme_color": inst_color,
            "logo_url": inst_logo,
            "avatar": avatar,
            "mustChangePassword": bool(user.must_change_password)
        }
        if user.student_id:
            user_info["student_id"] = user.student_id
            user_info["rollNumber"] = roll_number
            user_info["branch"] = branch
            metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            user_info["xp"] = metrics_row.xp_points if metrics_row else 0
        if user.faculty_id:
            user_info["faculty_id"] = user.faculty_id
            user_info["branch"] = branch
            user_info["designation"] = designation

        return {
            "user": user_info,
            "accessToken": access_token,
            "refreshToken": refresh_token
        }
    finally:
        db.close()

@app.post("/api/v1/auth/refresh")
def refresh_token_route(data: RefreshInput, response: Response, request: Request):
    rf_token = data.refresh_token or request.cookies.get("refresh_token")
    if not rf_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token!")

    payload = verify_token(rf_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token!")

    db = SessionLocal()
    try:
        # Check blacklist for token rotation
        blacklisted = db.execute(text("SELECT 1 FROM token_blacklist WHERE token = :t"), {"t": rf_token}).fetchone()
        if blacklisted:
            raise HTTPException(status_code=401, detail="Refresh token has been invalidated.")
            
        # Blacklist the old refresh token (Token Rotation!)
        db.execute(text("INSERT INTO token_blacklist (token) VALUES (:t) ON CONFLICT DO NOTHING"), {"t": rf_token})
        db.commit()

        user = db.execute(
            text("SELECT user_id, email, role, student_id, faculty_id, institution_id FROM users WHERE user_id = :uid"),
            {"uid": payload["user_id"]}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="User not found!")

        # Re-fetch info
        name = "System Administrator"
        roll_number = None
        branch = None
        designation = None
        college = "COEP Technological University"

        inst_color = None
        inst_logo = None

        if user.institution_id:
            inst = db.execute(
                text("""
                    SELECT institution_name, theme_color, logo_url
                    FROM institutions
                    WHERE institution_id = :iid
                """),
                {"iid": user.institution_id}
            ).fetchone()

            if inst:
                college = inst.institution_name
                inst_color = inst.theme_color
                inst_logo = inst.logo_url

        if user.role == "super_admin":
            name = "Platform Owner"
            college = "NeuroLearn AI Platform"

        if user.role == "student" and user.student_id:
            student = db.execute(
                text("SELECT full_name, roll_no, department, division, semester FROM students WHERE student_id = :sid"),
                {"sid": user.student_id}
            ).fetchone()
            if student:
                name = student.full_name
                roll_number = student.roll_no
                branch = f"B.Tech {student.department}"
        elif user.role == "faculty" and user.faculty_id:
            faculty = db.execute(
                text("SELECT full_name, department, designation FROM faculty WHERE faculty_id = :fid"),
                {"fid": user.faculty_id}
            ).fetchone()
            if faculty:
                name = faculty.full_name
                branch = faculty.department
                designation = faculty.designation

        token_payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "student_id": user.student_id,
            "faculty_id": user.faculty_id,
            "institution_id": user.institution_id
        }
        access_token = create_access_token(token_payload)
        new_refresh_token = create_refresh_token(token_payload)

        # Set new rotated cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=120 * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        # Determine avatar based on database avatar_url
        avatar = "🚀"
        if user.role == "super_admin":
            avatar = "👑"
        elif user.role == "admin":
            avatar = "🛡️"
        elif user.role == "faculty" and user.faculty_id:
            row = db.execute(text("SELECT avatar_url FROM faculty WHERE faculty_id = :fid"), {"fid": user.faculty_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "👨‍🏫"
        elif user.role == "student" and user.student_id:
            row = db.execute(text("SELECT avatar_url FROM students WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "🚀"

        user_info = {
            "email": user.email,
            "name": name,
            "role": user.role,
            "college": college,
            "institution_id": user.institution_id,
            "theme_color": inst_color,
            "logo_url": inst_logo,
            "avatar": avatar
        }
        if user.student_id:
            user_info["student_id"] = user.student_id
            user_info["rollNumber"] = roll_number
            user_info["branch"] = branch
            metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            user_info["xp"] = metrics_row.xp_points if metrics_row else 0
        if user.faculty_id:
            user_info["faculty_id"] = user.faculty_id
            user_info["branch"] = branch
            user_info["designation"] = designation

        return {
            "user": user_info,
            "accessToken": access_token,
            "refreshToken": new_refresh_token
        }
    finally:
        db.close()

@app.post("/api/v1/auth/logout")
def logout_route(response: Response, current_user: dict = Depends(get_current_user), request: Request = None):
    # Retrieve token manually from cookie or Authorization header to blacklist
    token = request.cookies.get("access_token") if request else None
    if not token and request:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if token:
        db = SessionLocal()
        try:
            db.execute(text("INSERT INTO token_blacklist (token) VALUES (:t) ON CONFLICT DO NOTHING"), {"t": token})
            db.commit()
        finally:
            db.close()
            
    # Remove cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    
    return {"success": True, "message": "Successfully logged out and invalidated session."}

@app.post("/api/v1/auth/register")
def register_route(data: RegisterInput):
    email = data.email.strip().lower()
    db = SessionLocal()
    try:
        # Check institution exists
        inst = db.execute(
            text("SELECT institution_name, domain_name FROM institutions WHERE institution_id = :iid"),
            {"iid": data.institution_id}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=400, detail="Invalid selected institution selection.")

        # Enforce email domain rule (allowing @neurolearn.ai for demo accounts)
        valid_domain = inst.domain_name.lower()
        email_domain = email.split("@")[-1]
        
        is_valid_domain = (
            email_domain == valid_domain or 
            email_domain == "neurolearn.ai" or
            (inst.domain_name == "coeptech.ac.in" and email_domain in ["coep.smail.in", "coep.ac.in", "coeptech.ac.in"])
        )

        if not is_valid_domain:
            db.execute(
                text("""
                    INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                    VALUES (:email, 'REGISTER_BLOCKED', :details, :iid, CURRENT_TIMESTAMP)
                """),
                {"email": email, "details": f"Email domain {email_domain} does not match institution domain {valid_domain}", "iid": data.institution_id}
            )
            db.commit()
            raise HTTPException(
                status_code=400, 
                detail=f"Only official institutional emails ending with @{valid_domain} are allowed for {inst.institution_name}."
            )

        # Check if email already registered
        existing_user = db.execute(text("SELECT user_id FROM users WHERE email = :email"), {"email": email}).fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="This email is already registered inside NeuroLearn!")

        password_hash = hash_password(data.password)
        student_id = None
        faculty_id = None



        if data.role == "student":
            roll_no = data.roll_no or f"MOCK{random.randint(1000, 9999)}"
            existing_student = db.execute(text("SELECT student_id FROM students WHERE roll_no = :roll OR email = :email"), {"roll": roll_no, "email": email}).fetchone()
            if existing_student:
                student_id = existing_student.student_id
            else:
                dept = data.department or "Computer Engineering"
                div = data.division or "A"
                sem = data.semester or 5
                student_id = db.execute(
                    text("""
                        INSERT INTO students (roll_no, full_name, email, department, semester, division, institution_id, created_at)
                        VALUES (:roll, :name, :email, :dept, :sem, :div, :iid, CURRENT_TIMESTAMP)
                        RETURNING student_id
                    """),
                    {"roll": roll_no, "name": data.name, "email": email, "dept": dept, "sem": sem, "div": div, "iid": data.institution_id}
                ).scalar()

                db.execute(
                    text("INSERT INTO enrollments (student_id, class_id, created_at) VALUES (:sid, 1, CURRENT_TIMESTAMP)"),
                    {"sid": student_id}
                )

                db.execute(
                    text("""
                        INSERT INTO student_metrics (student_id, attendance, quiz_score, risk_level, predicted_cgpa, xp_points, updated_at)
                        VALUES (:sid, 85.0, 75.0, 'Low', 8.2, 500, CURRENT_TIMESTAMP)
                    """),
                    {"sid": student_id}
                )

        elif data.role == "faculty":
            code = data.faculty_code or f"FAC{random.randint(100, 999)}"
            existing_faculty = db.execute(text("SELECT faculty_id FROM faculty WHERE faculty_code = :code OR email = :email"), {"code": code, "email": email}).fetchone()
            if existing_faculty:
                faculty_id = existing_faculty.faculty_id
            else:
                dept = data.department or "Computer Engineering"
                desg = data.designation or "Assistant Professor"
                faculty_id = db.execute(
                    text("""
                        INSERT INTO faculty (faculty_code, full_name, email, department, designation, institution_id, created_at)
                        VALUES (:code, :name, :email, :dept, :desg, :iid, CURRENT_TIMESTAMP)
                        RETURNING faculty_id
                    """),
                    {"code": code, "name": data.name, "email": email, "dept": dept, "desg": desg, "iid": data.institution_id}
                ).scalar()

                db.execute(
                    text("""
                        INSERT INTO faculty_assignments (faculty_id, class_id, subject_id, role, academic_year, created_at)
                        VALUES (:fid, 1, 1, 'Theory', '2026-2027', CURRENT_TIMESTAMP)
                    """),
                    {"fid": faculty_id}
                )

        # Create user account
        db.execute(
            text("""
                INSERT INTO users (email, password_hash, role, student_id, faculty_id, institution_id, created_at, updated_at)
                VALUES (:email, :hash, :role, :sid, :fid, :iid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {"email": email, "hash": password_hash, "role": data.role, "sid": student_id, "fid": faculty_id, "iid": data.institution_id}
        )

        db.commit()
        
        # Log successful registration
        db.execute(
            text("""
                INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                VALUES (:email, 'REGISTER_SUCCESS', 'Successful registration', :iid, CURRENT_TIMESTAMP)
            """),
            {"email": email, "iid": data.institution_id}
        )
        db.commit()

        return {"success": True, "message": "User registered successfully"}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")
    finally:
        db.close()



# --- Institution Discovery Endpoints ---

@app.get("/api/v1/institutions")
def get_institutions_list():
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year 
                FROM institutions 
                WHERE status = 'active'
                ORDER BY institution_id ASC
            """)
        ).fetchall()
        
        return [
            {
                "institution_id": row.institution_id,
                "institution_name": row.institution_name,
                "short_name": row.short_name,
                "domain_name": row.domain_name,
                "logo_url": row.logo_url,
                "theme_color": row.theme_color,
                "website": row.website,
                "address": row.address,
                "status": row.status,
                "contact_email": row.contact_email or "",
                "contact_phone": row.contact_phone or "",
                "academic_year": row.academic_year
            } for row in result
        ]
    finally:
        db.close()


# --- Security Center Endpoints ---

@app.get("/api/v1/security/events")
def get_security_events(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        query = text("""
            SELECT event_id, email, event_type, details, created_at
            FROM security_events
            WHERE institution_id = :iid
            ORDER BY event_id DESC
        """)
        result = db.execute(query, {"iid": iid}).fetchall()
        
        events = []
        for row in result:
            events.append({
                "id": f"alert_{row.event_id}",
                "email": row.email,
                "timestamp": str(row.created_at),
                "actionType": "LOGIN" if "LOGIN" in row.event_type else "REGISTER",
                "status": "BLOCKED" if "FAILED" in row.event_type or "BLOCKED" in row.event_type else "ALLOWED",
                "details": row.details
            })
        return events
    finally:
        db.close()

@app.delete("/api/v1/security/events")
def clear_security_events(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        db.execute(text("DELETE FROM security_events WHERE institution_id = :iid"), {"iid": iid})
        db.commit()
        return {"message": "Security logs cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/model-status")
def model_status():
    return {"student_performance": "loaded" if student_model is not None else "failed"}

@app.get("/predict-test")
def predict_test():
    return {"predicted_grade": 14.8}

@app.post("/api/predict/student-performance")
def predict_student_performance(data: StudentPerformanceInput):
    if not student_model:
        return {"predicted_grade": 0.0, "error": "Model not loaded"}
    prediction = student_model.predict([
        [
            0, 0, data.age, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
            data.studytime, data.failures, 0, 0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 1, 1, 3, data.absences, data.G1, data.G2, 0
        ]
    ])
    return {"predicted_grade": round(float(prediction[0]), 2)}


# --- faculty Telemetry Routes ---

@app.get("/faculty/{faculty_id}/classes")
def get_faculty_classes(
    faculty_id: int,
    current_user: dict = Depends(get_current_user)
):
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

@app.get("/class/{class_id}/students")
def get_class_students(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        if current_user["role"] == "faculty":
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

@app.get("/class/{class_id}/student-metrics")
def get_class_student_metrics(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        if current_user["role"] == "faculty":
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

@app.get("/class/{class_id}/dashboard-summary")
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

@app.get("/class/{class_id}/attendance")
def get_class_attendance(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        if current_user["role"] not in ["faculty", "admin"]:
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
            SELECT
                s.student_id,
                s.roll_no,
                s.full_name,
                ar.status,
                ar.attendance_date
            FROM attendance_records ar
            JOIN students s
                ON ar.student_id = s.student_id
            WHERE ar.class_id = :class_id
            ORDER BY s.roll_no
        """)

        result = db.execute(
            query,
            {"class_id": class_id}
        )

        attendance = []

        for row in result:
            attendance.append({
                "student_id": row.student_id,
                "roll_no": row.roll_no,
                "full_name": row.full_name,
                "status": row.status,
                "attendance_date": str(row.attendance_date)
            })

        return attendance

    finally:
        db.close()

@app.get("/class/{class_id}/attendance-summary")
def get_attendance_summary(
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
        SELECT COUNT(*) AS total_records,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
               SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
               SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count
        FROM attendance_records
        WHERE class_id = :class_id
    """)
    result = db.execute(query, {"class_id": class_id}).fetchone()
    db.close()
    total = result.total_records or 0
    present = result.present_count or 0
    rate = round((present / total) * 100, 2) if total > 0 else 0.0
    return {
        "total_records": total,
        "present_count": present,
        "absent_count": result.absent_count or 0,
        "late_count": result.late_count or 0,
        "attendance_rate": rate
    }

@app.get("/student/{student_id}/attendance-history")
def get_student_attendance_history(
    student_id: int,
    current_user: dict = Depends(get_current_user)
):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        query = text("""
            SELECT attendance_date, status
            FROM attendance_records
            WHERE student_id = :student_id
            ORDER BY attendance_date DESC
        """)
        result = db.execute(query, {"student_id": student_id})
        history = [{"attendance_date": str(row.attendance_date), "status": row.status} for row in result]
        return history
    finally:
        db.close()

@app.post("/attendance/mark")
def mark_attendance(
    data: AttendanceInput,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role not in ["faculty", "admin", "super_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        if role == "faculty":
            verify_faculty_access(
                db,
                current_user["faculty_id"],
                data.class_id
            )
        elif role == "admin":
            cls = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": data.class_id}).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")

        existing = db.execute(
            text("""
                SELECT attendance_id FROM attendance_records
                WHERE student_id = :student_id AND class_id = :class_id AND attendance_date = :attendance_date
            """),
            {"student_id": data.student_id, "class_id": data.class_id, "attendance_date": data.attendance_date}
        ).fetchone()

        if existing:
            db.execute(
                text("UPDATE attendance_records SET status = :status WHERE attendance_id = :attendance_id"),
                {"status": data.status, "attendance_id": existing.attendance_id}
            )
            db.commit()
            return {"message": "Attendance updated successfully"}

        db.execute(
            text("""
                INSERT INTO attendance_records (student_id, class_id, attendance_date, status, created_at)
                VALUES (:student_id, :class_id, :attendance_date, :status, NOW())
            """),
            {"student_id": data.student_id, "class_id": data.class_id, "attendance_date": data.attendance_date, "status": data.status}
        )
        db.commit()
        return {"message": "Attendance marked successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/class/{class_id}/attendance-registry")
def get_attendance_registry(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    role = current_user["role"]
    if role not in ["faculty", "admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )

    db = SessionLocal()
    try:
        if role == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id)
        elif role == "admin":
            cls = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": class_id}).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")

        query = text("""
            SELECT s.student_id, s.roll_no, s.full_name,
                   COUNT(CASE WHEN ar.status = 'Present' THEN 1 END) AS present_count,
                   COUNT(CASE WHEN ar.status = 'Absent' THEN 1 END) AS absent_count,
                   COUNT(CASE WHEN ar.status = 'Late' THEN 1 END) AS late_count,
                   ROUND((COUNT(CASE WHEN ar.status = 'Present' THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) AS percentage
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.student_id
            WHERE ar.class_id = :class_id
            GROUP BY s.student_id, s.roll_no, s.full_name
            ORDER BY s.roll_no
        """)
        result = db.execute(query, {"class_id": class_id})
        students = []
        for row in result:
            students.append({
                "student_id": row.student_id,
                "roll_no": row.roll_no,
                "full_name": row.full_name,
                "present_count": row.present_count,
                "absent_count": row.absent_count,
                "late_count": row.late_count,
                "attendance_percentage": float(row.percentage) if row.percentage else 0.0
            })
        return students
    finally:
        db.close()

@app.get("/class/{class_id}/today-attendance")
def get_today_attendance(
    class_id: int,
    current_user: dict = Depends(get_current_user)
):
    role = current_user["role"]
    if role not in ["faculty", "admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Permission denied"
        )

    db = SessionLocal()
    try:
        if role == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id)
        elif role == "admin":
            cls = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": class_id}).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")

        today = datetime.now().date()
        result = db.execute(
            text("SELECT student_id, status FROM attendance_records WHERE class_id = :class_id AND attendance_date = :date"),
            {"class_id": class_id, "date": today}
        )
        attendance_map = {row.student_id: row.status for row in result}
        return attendance_map
    finally:
        db.close()


# --- Student CRUD (API-driven) ---

@app.get("/api/students")
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

@app.get("/api/students/{student_id}")
@app.get("/students/{student_id}")
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

@app.post("/api/students")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/students/{student_id}")
@app.put("/students/{student_id}")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/students/{student_id}")
@app.delete("/students/{student_id}")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Faculty CRUD ---

@app.get("/api/faculty")
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

@app.get("/api/faculty/{faculty_id}")
@app.get("/faculty/{faculty_id}")
def get_faculty_profile(faculty_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT * FROM faculty WHERE faculty_id = :id"),
            {"id": faculty_id}
        ).fetchone()
        if not f or f.institution_id != current_user["institution_id"]:
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

@app.post("/api/faculty")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/faculty/{faculty_id}")
@app.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: int, data: FacultyInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).fetchone()
        if not f or f.institution_id != current_user["institution_id"]:
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
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/faculty/{faculty_id}")
@app.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        f = db.execute(
            text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).fetchone()
        if not f or f.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Faculty belongs to another institution.")
            
        db.execute(text("DELETE FROM faculty_assignments WHERE faculty_id = :id"), {"id": faculty_id})
        db.execute(text("DELETE FROM users WHERE faculty_id = :id"), {"id": faculty_id})
        db.execute(text("DELETE FROM faculty WHERE faculty_id = :id"), {"id": faculty_id})
        db.commit()


        log_audit(db, "DELETE", "Faculty", faculty_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Faculty deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
# --- Faculty Mapping CRUD ---

@app.get("/api/faculty-mapping")
def get_mappings(current_user: dict = Depends(require_role(["admin", "super_admin", "faculty"]))):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "faculty":
            result = db.execute(
                text("""
                    SELECT fa.assignment_id AS mapping_id, fa.faculty_id, fa.subject_id, fa.class_id,
                           f.full_name AS faculty_name, s.subject_name, c.class_name, fa.academic_year, fa.role
                    FROM faculty_assignments fa
                    JOIN faculty f ON fa.faculty_id = f.faculty_id
                    JOIN subjects s ON fa.subject_id = s.subject_id
                    JOIN classes c ON fa.class_id = c.class_id
                    WHERE fa.faculty_id = :faculty_id
                    ORDER BY fa.assignment_id DESC
                """),
                {"faculty_id": current_user["faculty_id"]}
            )
        elif role == "admin":
            result = db.execute(
                text("""
                    SELECT fa.assignment_id AS mapping_id, fa.faculty_id, fa.subject_id, fa.class_id,
                           f.full_name AS faculty_name, s.subject_name, c.class_name, fa.academic_year, fa.role
                    FROM faculty_assignments fa
                    JOIN faculty f ON fa.faculty_id = f.faculty_id
                    JOIN subjects s ON fa.subject_id = s.subject_id
                    JOIN classes c ON fa.class_id = c.class_id
                    WHERE f.institution_id = :iid
                    ORDER BY fa.assignment_id DESC
                """),
                {"iid": current_user["institution_id"]}
            )
        else:
            # super_admin
            result = db.execute(
                text("""
                    SELECT fa.assignment_id AS mapping_id, fa.faculty_id, fa.subject_id, fa.class_id,
                           f.full_name AS faculty_name, s.subject_name, c.class_name, fa.academic_year, fa.role
                    FROM faculty_assignments fa
                    JOIN faculty f ON fa.faculty_id = f.faculty_id
                    JOIN subjects s ON fa.subject_id = s.subject_id
                    JOIN classes c ON fa.class_id = c.class_id
                    ORDER BY fa.assignment_id DESC
                """)
            )
        mappings = []
        for row in result:
            mappings.append({
                "mapping_id": row.mapping_id,
                "faculty_id": row.faculty_id,
                "subject_id": row.subject_id,
                "class_id": row.class_id,
                "faculty_name": row.faculty_name,
                "subject_name": row.subject_name,
                "class_name": row.class_name,
                "academic_year": row.academic_year,
                "role": row.role
            })
        return mappings
    finally:
        db.close()

@app.post("/api/faculty-mapping")
def create_mapping(data: FacultyMappingInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        if current_user["role"] == "admin":
            # Verify faculty is in the same institution
            fac = db.execute(
                text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
                {"fid": data.faculty_id}
            ).fetchone()
            if not fac or fac.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: faculty belongs to another institution.")
                
            # Verify class is in the same institution
            cls = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": data.class_id}
            ).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: class belongs to another institution.")

            # Verify subject is in the same institution
            sub = db.execute(
                text("SELECT institution_id FROM subjects WHERE subject_id = :sid"),
                {"sid": data.subject_id}
            ).fetchone()
            if not sub or sub.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: subject belongs to another institution.")

        new_id = db.execute(
            text("""
                INSERT INTO faculty_assignments (faculty_id, subject_id, class_id, academic_year, role, created_at)
                VALUES (:faculty_id, :subject_id, :class_id, :academic_year, 'Theory', NOW())
                RETURNING assignment_id
            """),
            {
                "faculty_id": data.faculty_id,
                "subject_id": data.subject_id,
                "class_id": data.class_id,
                "academic_year": data.academic_year
            }
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "FacultyAssignment", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Faculty assigned successfully", "mapping_id": new_id}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/faculty-mapping/{mapping_id}")
@app.put("/faculty-mapping/{mapping_id}")
def update_mapping(mapping_id: int, data: FacultyMappingInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        # Check mapping exists and verify ownership if admin
        mapping = db.execute(
            text("""
                SELECT fa.assignment_id, f.institution_id FROM faculty_assignments fa
                JOIN faculty f ON fa.faculty_id = f.faculty_id
                WHERE fa.assignment_id = :id
            """),
            {"id": mapping_id}
        ).fetchone()
        if not mapping:
            raise HTTPException(status_code=404, detail="Mapping not found")
        if current_user["role"] == "admin" and mapping.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: mapping belongs to another institution.")
        
        # Verify target faculty and class and subject belong to current_user's institution
        if current_user["role"] == "admin":
            fac = db.execute(
                text("SELECT institution_id FROM faculty WHERE faculty_id = :fid"),
                {"fid": data.faculty_id}
            ).fetchone()
            if not fac or fac.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: faculty belongs to another institution.")
            cls = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": data.class_id}
            ).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: class belongs to another institution.")
            sub = db.execute(
                text("SELECT institution_id FROM subjects WHERE subject_id = :sid"),
                {"sid": data.subject_id}
            ).fetchone()
            if not sub or sub.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: subject belongs to another institution.")
        
        db.execute(
            text("""
                UPDATE faculty_assignments
                SET faculty_id = :faculty_id, subject_id = :subject_id, class_id = :class_id, academic_year = :academic_year
                WHERE assignment_id = :mapping_id
            """),
            {
                "mapping_id": mapping_id,
                "faculty_id": data.faculty_id,
                "subject_id": data.subject_id,
                "class_id": data.class_id,
                "academic_year": data.academic_year
            }
        )
        db.commit()
        log_audit(db, "UPDATE", "FacultyAssignment", mapping_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Mapping updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/faculty-mapping/{mapping_id}")
@app.delete("/faculty-mapping/{mapping_id}")
def delete_mapping(mapping_id: int, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        # Check mapping exists and verify ownership if admin
        mapping = db.execute(
            text("""
                SELECT fa.assignment_id, f.institution_id FROM faculty_assignments fa
                JOIN faculty f ON fa.faculty_id = f.faculty_id
                WHERE fa.assignment_id = :id
            """),
            {"id": mapping_id}
        ).fetchone()
        if not mapping:
            raise HTTPException(status_code=404, detail="Mapping not found")
        if current_user["role"] == "admin" and mapping.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: mapping belongs to another institution.")
        
        db.execute(text("DELETE FROM faculty_assignments WHERE assignment_id = :id"), {"id": mapping_id})
        db.commit()
        log_audit(db, "DELETE", "FacultyAssignment", mapping_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Mapping deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Course CRUD ---

@app.get("/api/courses")
def get_courses(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM courses WHERE institution_id = :iid ORDER BY course_id DESC"),
            {"iid": current_user["institution_id"]}
        )
        courses = []
        for row in result:
            courses.append({
                "course_id": row.course_id,
                "course_code": row.course_code,
                "course_title": row.course_title,
                "department": row.department,
                "category": row.category,
                "duration": row.duration,
                "enrollment_count": row.enrollment_count or 0
            })
        return courses
    finally:
        db.close()

@app.post("/api/courses")
def create_course(data: CourseInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO courses (course_code, course_title, department, category, duration, enrollment_count, institution_id, created_at)
                VALUES (:course_code, :course_title, :department, :category, :duration, 0, :iid, CURRENT_TIMESTAMP)
                RETURNING course_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Course", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Course created successfully", "course_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/courses/{course_id}")
@app.put("/courses/{course_id}")
def update_course(course_id: int, data: CourseInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        course = db.execute(
            text("SELECT institution_id FROM courses WHERE course_id = :id"),
            {"id": course_id}
        ).fetchone()
        if not course or course.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Course belongs to another institution.")
            
        db.execute(
            text("""
                UPDATE courses
                SET course_code = :course_code, course_title = :course_title,
                    department = :department, category = :category, duration = :duration
                WHERE course_id = :course_id
            """),
            {**data.dict(), "course_id": course_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Course", course_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Course updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/courses/{course_id}")
@app.delete("/courses/{course_id}")
def delete_course(course_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        course = db.execute(
            text("SELECT institution_id FROM courses WHERE course_id = :id"),
            {"id": course_id}
        ).fetchone()
        if not course or course.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Course belongs to another institution.")

        db.execute(text("DELETE FROM course_subject_mapping WHERE course_id = :id"), {"id": course_id})
        db.execute(text("DELETE FROM courses WHERE course_id = :id"), {"id": course_id})
        db.commit()
        log_audit(db, "DELETE", "Course", course_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Course deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Subject CRUD ---

@app.get("/api/subjects")
def get_subjects(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM subjects WHERE institution_id = :iid ORDER BY subject_id DESC"),
            {"iid": current_user["institution_id"]}
        )
        subjects = []
        for row in result:
            subjects.append({
                "subject_id": row.subject_id,
                "subject_code": row.subject_code,
                "subject_name": row.subject_name,
                "credits": row.credits,
                "department": row.department,
                "semester": row.semester
            })
        return subjects
    finally:
        db.close()

@app.post("/api/subjects")
def create_subject(data: SubjectInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO subjects (subject_code, subject_name, credits, department, semester, institution_id, created_at)
                VALUES (:subject_code, :subject_name, :credits, :department, :semester, :iid, CURRENT_TIMESTAMP)
                RETURNING subject_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Subject", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Subject created successfully", "subject_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/subjects/{subject_id}")
@app.put("/subjects/{subject_id}")
def update_subject(subject_id: int, data: SubjectInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        sub = db.execute(
            text("SELECT institution_id FROM subjects WHERE subject_id = :id"),
            {"id": subject_id}
        ).fetchone()
        if not sub or sub.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Subject belongs to another institution.")
            
        db.execute(
            text("""
                UPDATE subjects
                SET subject_code = :subject_code, subject_name = :subject_name,
                    credits = :credits, department = :department, semester = :semester
                WHERE subject_id = :subject_id
            """),
            {**data.dict(), "subject_id": subject_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Subject", subject_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Subject updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/subjects/{subject_id}")
@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        sub = db.execute(
            text("SELECT institution_id FROM subjects WHERE subject_id = :id"),
            {"id": subject_id}
        ).fetchone()
        if not sub or sub.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Subject belongs to another institution.")

        db.execute(text("DELETE FROM course_subject_mapping WHERE subject_id = :id"), {"id": subject_id})
        db.execute(text("DELETE FROM faculty_assignments WHERE subject_id = :id"), {"id": subject_id})
        db.execute(text("DELETE FROM subjects WHERE subject_id = :id"), {"id": subject_id})
        db.commit()
        log_audit(db, "DELETE", "Subject", subject_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Subject deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Class CRUD ---

@app.get("/api/classes")
def get_classes(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM classes WHERE institution_id = :iid ORDER BY class_name"),
            {"iid": current_user["institution_id"]}
        )
        classes = []
        for row in result:
            classes.append({
                "class_id": row.class_id,
                "class_name": row.class_name,
                "division": row.division,
                "department": row.department,
                "semester": row.semester,
                "term_id": row.term_id
            })
        return classes
    finally:
        db.close()

@app.post("/api/classes")
def create_class(data: ClassInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO classes (class_name, division, department, semester, term_id, institution_id, created_at)
                VALUES (:class_name, :division, :department, :semester, :term_id, :iid, CURRENT_TIMESTAMP)
                RETURNING class_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Class", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Class created successfully", "class_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/classes/{class_id}")
@app.put("/classes/{class_id}")
def update_class(class_id: int, data: ClassInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        c = db.execute(
            text("SELECT institution_id FROM classes WHERE class_id = :id"),
            {"id": class_id}
        ).fetchone()
        if not c or c.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")
            
        db.execute(
            text("""
                UPDATE classes
                SET class_name = :class_name, division = :division,
                    department = :department, semester = :semester, term_id = :term_id
                WHERE class_id = :class_id
            """),
            {**data.dict(), "class_id": class_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Class", class_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Class updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/classes/{class_id}")
@app.delete("/classes/{class_id}")
def delete_class(class_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        c = db.execute(
            text("SELECT institution_id FROM classes WHERE class_id = :id"),
            {"id": class_id}
        ).fetchone()
        if not c or c.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")

        db.execute(text("DELETE FROM enrollments WHERE class_id = :id"), {"id": class_id})
        db.execute(text("DELETE FROM faculty_assignments WHERE class_id = :id"), {"id": class_id})
        db.execute(text("DELETE FROM classes WHERE class_id = :id"), {"id": class_id})
        db.commit()
        log_audit(db, "DELETE", "Class", class_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Class deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Phase B: Department CRUD & Stats ---

@app.get("/api/departments")
def get_departments(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("SELECT * FROM departments WHERE institution_id = :iid ORDER BY department_name"),
            {"iid": current_user["institution_id"]}
        )
        departments = []
        for row in result:
            departments.append({
                "department_id": row.department_id,
                "department_name": row.department_name,
                "department_code": row.department_code
            })
        return departments
    finally:
        db.close()

@app.post("/api/departments")
def create_department(data: DepartmentInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
                INSERT INTO departments (department_name, department_code, institution_id)
                VALUES (:department_name, :department_code, :iid)
                RETURNING department_id
            """),
            {**data.dict(), "iid": current_user["institution_id"]}
        ).scalar()
        db.commit()
        log_audit(db, "CREATE", "Department", new_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Department created successfully", "department_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/departments/{dept_id}")
@app.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        dept = db.execute(
            text("SELECT institution_id FROM departments WHERE department_id = :id"),
            {"id": dept_id}
        ).fetchone()
        if not dept or dept.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Department belongs to another institution.")
            
        db.execute(
            text("""
                UPDATE departments
                SET department_name = :department_name, department_code = :department_code
                WHERE department_id = :dept_id
            """),
            {**data.dict(), "dept_id": dept_id}
        )
        db.commit()
        log_audit(db, "UPDATE", "Department", dept_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Department updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/departments/{dept_id}")
@app.delete("/departments/{dept_id}")
def delete_department(dept_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        dept = db.execute(
            text("SELECT institution_id FROM departments WHERE department_id = :id"),
            {"id": dept_id}
        ).fetchone()
        if not dept or dept.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Department belongs to another institution.")

        db.execute(text("DELETE FROM departments WHERE department_id = :id"), {"id": dept_id})
        db.commit()
        log_audit(db, "DELETE", "Department", dept_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Department deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/departments/stats")
def get_department_stats(current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        result = db.execute(text("""
            SELECT d.department_id, d.department_name, d.department_code,
                   (SELECT COUNT(*) FROM students s 
                    WHERE s.institution_id = :iid 
                      AND (s.department = d.department_code 
                           OR d.department_code LIKE s.department || '%' 
                           OR s.department LIKE d.department_code || '%')) AS student_count,
                   (SELECT COUNT(*) FROM faculty f 
                    WHERE f.institution_id = :iid 
                      AND (f.department = d.department_code 
                           OR d.department_code LIKE f.department || '%' 
                           OR f.department LIKE d.department_code || '%'
                           OR d.department_name = f.department)) AS faculty_count,
                   (SELECT COUNT(*) FROM courses c 
                    WHERE c.institution_id = :iid 
                      AND (c.department = d.department_code 
                           OR c.department = d.department_name 
                           OR d.department_code LIKE c.department || '%' 
                           OR c.department LIKE d.department_code || '%')) AS course_count
            FROM departments d
            WHERE d.institution_id = :iid
            ORDER BY d.department_name
        """), {"iid": iid}).fetchall()
        stats = []
        for r in result:
            stats.append({
                "department_id": r.department_id,
                "department_name": r.department_name,
                "department_code": r.department_code,
                "student_count": r.student_count,
                "faculty_count": r.faculty_count,
                "course_count": r.course_count
            })
        return stats
    finally:
        db.close()


# --- Phase C: Enrollment Management & History ---

@app.get("/api/enrollments")
def get_enrollments(
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
        result = db.execute(text("""
            SELECT e.enrollment_id, e.student_id, e.class_id,
                   s.full_name AS student_name, s.roll_no, s.department,
                   c.class_name, c.semester, c.division
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            JOIN classes c ON e.class_id = c.class_id
            JOIN faculty_assignments fa ON fa.class_id = c.class_id
            WHERE fa.faculty_id = :fid
            ORDER BY e.enrollment_id DESC
        """), {"fid": current_user["faculty_id"]})
    else:
        result = db.execute(text("""
            SELECT e.enrollment_id, e.student_id, e.class_id,
                   s.full_name AS student_name, s.roll_no, s.department,
                   c.class_name, c.semester, c.division
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            JOIN classes c ON e.class_id = c.class_id
            WHERE c.institution_id = :iid
            ORDER BY e.enrollment_id DESC
        """), {"iid": current_user["institution_id"]})
    enrollments = []
    for r in result:
        enrollments.append({
            "enrollment_id": r.enrollment_id,
            "student_id": r.student_id,
            "class_id": r.class_id,
            "student_name": r.student_name,
            "roll_no": r.roll_no,
            "department": r.department,
            "class_name": r.class_name,
            "semester": r.semester,
            "division": r.division
        })
    db.close()
    return enrollments

@app.post("/api/enrollments")
def create_enrollment(
    data: EnrollmentInput,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role not in ["faculty", "admin", "super_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        if role == "faculty":
            verify_faculty_access(
                db,
                current_user["faculty_id"],
                data.class_id
            )
        elif role == "admin":
            # Check student institution
            student = db.execute(
                text("SELECT institution_id FROM students WHERE student_id = :sid"),
                {"sid": data.student_id}
            ).fetchone()
            if not student or student.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Student is in another institution.")
            # Check class institution
            cls = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": data.class_id}
            ).fetchone()
            if not cls or cls.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Class is in another institution.")

        # Check if student is already enrolled in this class
        existing = db.execute(
            text("SELECT enrollment_id FROM enrollments WHERE student_id = :sid AND class_id = :cid"),
            {"sid": data.student_id, "cid": data.class_id}
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Student is already enrolled in this class")

        new_id = db.execute(
            text("INSERT INTO enrollments (student_id, class_id, created_at) VALUES (:sid, :cid, NOW()) RETURNING enrollment_id"),
            {"sid": data.student_id, "cid": data.class_id}
        ).scalar()
        
        # Sync student record with class details
        class_details = db.execute(
            text("SELECT semester, division, department FROM classes WHERE class_id = :cid"),
            {"cid": data.class_id}
        ).fetchone()
        if class_details:
            db.execute(
                text("UPDATE students SET semester = :sem, division = :div, department = :dept WHERE student_id = :sid"),
                {
                    "sem": class_details.semester,
                    "div": class_details.division,
                    "dept": class_details.department,
                    "sid": data.student_id
                }
            )
            
        db.commit()
        log_audit(db, "ENROLL", "Student", data.student_id, performed_by=f"{role.capitalize()} {current_user['user_id']}")
        return {"message": "Student enrolled successfully", "enrollment_id": new_id}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/enrollments/{enrollment_id}")
@app.put("/enrollments/{enrollment_id}")
def transfer_enrollment(
    enrollment_id: int,
    data: EnrollmentInput,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role not in ["faculty", "admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="Permission denied")

        # Check current student details
        enrollment = db.execute(
            text("SELECT student_id, class_id FROM enrollments WHERE enrollment_id = :id"),
            {"id": enrollment_id}
        ).fetchone()
        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment record not found")

        if role == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], enrollment.class_id)
            verify_faculty_access(db, current_user["faculty_id"], data.class_id)
        elif role == "admin":
            # Verify enrollment class institution
            cls_src = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": enrollment.class_id}
            ).fetchone()
            if not cls_src or cls_src.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Source class is in another institution.")
            # Verify target class institution
            cls_dst = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": data.class_id}
            ).fetchone()
            if not cls_dst or cls_dst.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Target class is in another institution.")

        db.execute(
            text("UPDATE enrollments SET class_id = :cid WHERE enrollment_id = :id"),
            {"cid": data.class_id, "id": enrollment_id}
        )
        
        # Sync student record with class details
        class_details = db.execute(
            text("SELECT semester, division, department FROM classes WHERE class_id = :cid"),
            {"cid": data.class_id}
        ).fetchone()
        if class_details:
            db.execute(
                text("UPDATE students SET semester = :sem, division = :div, department = :dept WHERE student_id = :sid"),
                {
                    "sem": class_details.semester,
                    "div": class_details.division,
                    "dept": class_details.department,
                    "sid": enrollment.student_id
                }
            )
            
        db.commit()
        log_audit(db, "TRANSFER", "Student", enrollment.student_id, performed_by=f"{role.capitalize()} {current_user['user_id']}")
        return {"message": "Enrollment transferred successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/enrollments/{enrollment_id}")
@app.delete("/enrollments/{enrollment_id}")
def delete_enrollment(
    enrollment_id: int,
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role not in ["faculty", "admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="Permission denied")

        enrollment = db.execute(
            text("SELECT student_id, class_id FROM enrollments WHERE enrollment_id = :id"),
            {"id": enrollment_id}
        ).fetchone()
        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment record not found")

        if role == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], enrollment.class_id)
        elif role == "admin":
            cls_src = db.execute(
                text("SELECT institution_id FROM classes WHERE class_id = :cid"),
                {"cid": enrollment.class_id}
            ).fetchone()
            if not cls_src or cls_src.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Class is in another institution.")

        db.execute(text("DELETE FROM enrollments WHERE enrollment_id = :id"), {"id": enrollment_id})
        db.commit()
        log_audit(db, "UNENROLL", "Student", enrollment.student_id, performed_by=f"{role.capitalize()} {current_user['user_id']}")
        return {"message": "Enrollment removed successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/enrollments/history/{student_id}")
@app.get("/enrollments/history/{student_id}")
def get_enrollment_history(
    student_id: int,
    current_user: dict = Depends(get_current_user)
):
    verify_student_access(current_user, student_id)
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT al.action, al.created_at, al.performed_by
                FROM audit_logs al
                WHERE al.entity_type = 'Student' AND al.entity_id = :student_id
                  AND al.action IN ('ENROLL', 'TRANSFER', 'UNENROLL')
                ORDER BY al.created_at DESC
            """),
            {"student_id": student_id}
        ).fetchall()
        history = [
            {
                "action": r.action,
                "timestamp": str(r.created_at),
                "performed_by": r.performed_by
            } for r in result
        ]
        return history
    finally:
        db.close()


# --- Phase D: Course-Subject Mapping ---

@app.get("/api/course-subject-mappings")
def get_course_subject_mappings(
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role not in ["faculty", "admin", "super_admin"]:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        if role in ["faculty", "admin"]:
            result = db.execute(text("""
                SELECT m.mapping_id, m.course_id, m.subject_id,
                       c.course_title, c.course_code,
                       s.subject_name, s.subject_code, s.credits, s.semester
                FROM course_subject_mapping m
                JOIN courses c ON m.course_id = c.course_id
                JOIN subjects s ON m.subject_id = s.subject_id
                WHERE c.institution_id = :iid
                ORDER BY m.mapping_id DESC
            """), {"iid": current_user["institution_id"]})
        else:
            # super_admin
            result = db.execute(text("""
                SELECT m.mapping_id, m.course_id, m.subject_id,
                       c.course_title, c.course_code,
                       s.subject_name, s.subject_code, s.credits, s.semester
                FROM course_subject_mapping m
                JOIN courses c ON m.course_id = c.course_id
                JOIN subjects s ON m.subject_id = s.subject_id
                ORDER BY m.mapping_id DESC
            """))

        mappings = []
        for r in result:
            mappings.append({
                "mapping_id": r.mapping_id,
                "course_id": r.course_id,
                "subject_id": r.subject_id,
                "course_title": r.course_title,
                "course_code": r.course_code,
                "subject_name": r.subject_name,
                "subject_code": r.subject_code,
                "credits": r.credits,
                "semester": r.semester
            })
        return mappings
    finally:
        db.close()

@app.post("/api/course-subject-mappings")
def create_course_subject_mapping(
    data: CourseSubjectMappingInput,
    current_user: dict = Depends(require_role(["admin", "super_admin"]))
):
    db = SessionLocal()
    try:
        # Verify course belongs to admin's institution
        course = db.execute(
            text("SELECT institution_id FROM courses WHERE course_id = :cid"),
            {"cid": data.course_id}
        ).fetchone()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if current_user["role"] == "admin" and course.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Course belongs to another institution.")

        existing = db.execute(
            text("SELECT mapping_id FROM course_subject_mapping WHERE course_id = :cid AND subject_id = :sid"),
            {"cid": data.course_id, "sid": data.subject_id}
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Subject is already mapped to this course")

        new_id = db.execute(
            text("INSERT INTO course_subject_mapping (course_id, subject_id, created_at) VALUES (:cid, :sid, NOW()) RETURNING mapping_id"),
            {"cid": data.course_id, "sid": data.subject_id}
        ).scalar()
        db.commit()
        log_audit(db, "MAP_COURSE_SUBJECT", "Course", data.course_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Subject mapped successfully", "mapping_id": new_id}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/course-subject-mappings/{mapping_id}")
@app.delete("/course-subject-mappings/{mapping_id}")
def delete_course_subject_mapping(
    mapping_id: int,
    current_user: dict = Depends(require_role(["admin", "super_admin"]))
):
    db = SessionLocal()
    try:
        mapping = db.execute(
            text("""
                SELECT m.mapping_id, c.institution_id, c.course_id
                FROM course_subject_mapping m
                JOIN courses c ON m.course_id = c.course_id
                WHERE m.mapping_id = :id
            """),
            {"id": mapping_id}
        ).fetchone()
        if not mapping:
            raise HTTPException(status_code=404, detail="Mapping record not found")
        if current_user["role"] == "admin" and mapping.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Course belongs to another institution.")

        db.execute(text("DELETE FROM course_subject_mapping WHERE mapping_id = :id"), {"id": mapping_id})
        db.commit()
        log_audit(db, "UNMAP_COURSE_SUBJECT", "Course", mapping.course_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Mapping removed successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


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

@app.get("/api/announcements")
@app.get("/announcements")
@app.get("/faculty/announcements")
def get_announcements(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return fetch_announcements_helper(db, current_user)
    finally:
        db.close()

@app.post("/announcements/{announcement_id}/read")
@app.post("/faculty/announcements/{announcement_id}/read")
@app.post("/api/announcements/{announcement_id}/read")
def mark_announcement_as_read(announcement_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        existing = db.execute(text("""
            SELECT 1 FROM announcement_reads 
            WHERE announcement_id = :aid AND user_id = :uid
        """), {"aid": announcement_id, "uid": user_id}).fetchone()
        
        if not existing:
            db.execute(text("""
                INSERT INTO announcement_reads (announcement_id, user_id, read_at)
                VALUES (:aid, :uid, CURRENT_TIMESTAMP)
            """), {"aid": announcement_id, "uid": user_id})
            db.commit()
        return {"success": True, "message": "Announcement marked as read"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/announcements/read-all")
@app.post("/announcements/read-all")
@app.post("/faculty/announcements/read-all")
def mark_all_announcements_as_read(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user_id = current_user["user_id"]
        announcements = fetch_announcements_helper(db, current_user)
        unread_ids = [a["announcement_id"] for a in announcements if not a["is_read"]]
        
        for aid in unread_ids:
            existing = db.execute(text("""
                SELECT 1 FROM announcement_reads 
                WHERE announcement_id = :aid AND user_id = :uid
            """), {"aid": aid, "uid": user_id}).fetchone()
            if not existing:
                db.execute(text("""
                    INSERT INTO announcement_reads (announcement_id, user_id, read_at)
                    VALUES (:aid, :uid, CURRENT_TIMESTAMP)
                """), {"aid": aid, "uid": user_id})
        db.commit()
        return {"success": True, "message": "All announcements marked as read", "count": len(unread_ids)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/announcements")
@app.post("/announcements")
@app.post("/faculty/announcements")
def create_announcement(data: AnnouncementInput, current_user: dict = Depends(require_role(["admin", "faculty"]))):
    db = SessionLocal()
    try:
        new_id = create_announcement_helper(db, data, current_user)
        return {
            "message": "Announcement created successfully",
            "announcement_id": new_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/api/announcements/{announcement_id}")
@app.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    data: AnnouncementInput,
    current_user: dict = Depends(require_role(["admin", "faculty"]))
):
    db = SessionLocal()
    try:
        update_announcement_helper(db, announcement_id, data, current_user)
        return {"message": "Announcement updated successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/announcements/{announcement_id}")
@app.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_user: dict = Depends(require_role(["admin", "faculty"]))
):
    db = SessionLocal()
    try:
        delete_announcement_helper(db, announcement_id, current_user)
        return {"message": "Announcement deleted successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Phase F: Faculty Workload & Audit Logs & Dashboard Stats ---

@app.get("/api/faculty/{faculty_id}/workload")
@app.get("/faculty/{faculty_id}/workload")
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

@app.get("/api/audit-logs")
@app.get("/audit-logs")
def get_audit_logs(current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "super_admin":
            result = db.execute(text("SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT 100"))
        else:
            iid = current_user["institution_id"]
            result = db.execute(text("""
                SELECT al.log_id, al.action, al.entity_type, al.entity_id, al.performed_by, al.created_at
                FROM audit_logs al
                LEFT JOIN students s ON al.entity_type = 'Student' AND al.entity_id = s.student_id
                LEFT JOIN faculty f ON al.entity_type = 'Faculty' AND al.entity_id = f.faculty_id
                LEFT JOIN classes c ON al.entity_type = 'Class' AND al.entity_id = c.class_id
                LEFT JOIN courses co ON (al.entity_type = 'Course' OR al.entity_type = 'COURSES') AND al.entity_id = co.course_id
                LEFT JOIN subjects su ON al.entity_type = 'Subject' AND al.entity_id = su.subject_id
                LEFT JOIN users u ON al.entity_type = 'User' AND al.entity_id = u.user_id
                WHERE al.institution_id = :iid OR (al.institution_id IS NULL AND COALESCE(s.institution_id, f.institution_id, c.institution_id, co.institution_id, su.institution_id, u.institution_id) = :iid)
                ORDER BY al.log_id DESC LIMIT 100
            """), {"iid": iid})
            
        logs = []
        for r in result:
            logs.append({
                "log_id": r.log_id,
                "action": r.action,
                "entity_type": r.entity_type,
                "entity_id": r.entity_id,
                "performed_by": r.performed_by,
                "created_at": str(r.created_at)
            })
        return logs
    finally:
        db.close()

@app.get("/api/admin/dashboard-stats")
@app.get("/admin/dashboard-stats")
def get_admin_dashboard_stats(current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        role = current_user["role"]
        is_admin = role == "admin"
        iid = current_user.get("institution_id")
        
        # Counts
        if is_admin:
            student_count = db.execute(text("SELECT COUNT(*) FROM students WHERE institution_id = :iid"), {"iid": iid}).scalar() or 0
            faculty_count = db.execute(text("SELECT COUNT(*) FROM faculty WHERE institution_id = :iid"), {"iid": iid}).scalar() or 0
            course_count = db.execute(text("SELECT COUNT(*) FROM courses WHERE institution_id = :iid"), {"iid": iid}).scalar() or 0
            subject_count = db.execute(text("SELECT COUNT(*) FROM subjects WHERE institution_id = :iid"), {"iid": iid}).scalar() or 0
            class_count = db.execute(text("SELECT COUNT(*) FROM classes WHERE institution_id = :iid"), {"iid": iid}).scalar() or 0
            
            activities_result = db.execute(text("""
                SELECT al.action, al.entity_type, al.entity_id, al.performed_by, al.created_at 
                FROM audit_logs al
                LEFT JOIN students s ON al.entity_type = 'Student' AND al.entity_id = s.student_id
                LEFT JOIN faculty f ON al.entity_type = 'Faculty' AND al.entity_id = f.faculty_id
                LEFT JOIN classes c ON al.entity_type = 'Class' AND al.entity_id = c.class_id
                LEFT JOIN courses co ON (al.entity_type = 'Course' OR al.entity_type = 'COURSES') AND al.entity_id = co.course_id
                LEFT JOIN subjects su ON al.entity_type = 'Subject' AND al.entity_id = su.subject_id
                LEFT JOIN users u ON al.entity_type = 'User' AND al.entity_id = u.user_id
                WHERE al.institution_id = :iid OR (al.institution_id IS NULL AND COALESCE(s.institution_id, f.institution_id, c.institution_id, co.institution_id, su.institution_id, u.institution_id) = :iid)
                ORDER BY al.log_id DESC LIMIT 8
            """), {"iid": iid}).fetchall()
            
            dept_result = db.execute(text("""
                SELECT s.department, COUNT(*) as count 
                FROM students s 
                WHERE s.institution_id = :iid
                GROUP BY s.department
            """), {"iid": iid}).fetchall()
        else:
            student_count = db.execute(text("SELECT COUNT(*) FROM students")).scalar() or 0
            faculty_count = db.execute(text("SELECT COUNT(*) FROM faculty")).scalar() or 0
            course_count = db.execute(text("SELECT COUNT(*) FROM courses")).scalar() or 0
            subject_count = db.execute(text("SELECT COUNT(*) FROM subjects")).scalar() or 0
            class_count = db.execute(text("SELECT COUNT(*) FROM classes")).scalar() or 0
            
            activities_result = db.execute(text("""
                SELECT action, entity_type, entity_id, performed_by, created_at 
                FROM audit_logs 
                ORDER BY log_id DESC LIMIT 8
            """)).fetchall()
            
            dept_result = db.execute(text("""
                SELECT s.department, COUNT(*) as count 
                FROM students s 
                GROUP BY s.department
            """)).fetchall()
            
        activities = []
        for act in activities_result:
            time_str = act.created_at.strftime("%H:%M:%S") if act.created_at else ""
            activities.append({
                "action": act.action,
                "entity_type": act.entity_type,
                "entity_id": act.entity_id,
                "performed_by": act.performed_by,
                "timestamp": time_str,
                "text": f"{act.performed_by} performed {act.action} on {act.entity_type} (ID: {act.entity_id})"
            })
            
        dept_distribution = [{"branch": r.department or "Unknown", "score": r.count} for r in dept_result]
        
        return {
            "total_students": student_count,
            "total_faculty": faculty_count,
            "total_courses": course_count,
            "total_subjects": subject_count,
            "total_classes": class_count,
            "recent_activities": activities,
            "department_distribution": dept_distribution
        }
    finally:
        db.close()


# --- Academic Terms CRUD ---

@app.get("/api/academic-terms")
@app.get("/academic-terms")
def get_academic_terms(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
    text("""
        SELECT *
        FROM academic_terms
        WHERE institution_id = :iid
        ORDER BY academic_year DESC, semester ASC
    """),
    {"iid": current_user["institution_id"]}
)
        terms = []
        for r in result:
            terms.append({
                "term_id": r.term_id,
                "academic_year": r.academic_year,
                "semester": r.semester
            })
        return terms
    finally:
        db.close()

@app.post("/api/academic-terms")
@app.post("/academic-terms")
def create_academic_term(data: AcademicTermInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        new_id = db.execute(
            text("""
INSERT INTO academic_terms (
            academic_year,
            semester,
            institution_id,
            created_at
        )
        VALUES (
            :academic_year,
            :semester,
            :iid,
            NOW()
        )
        RETURNING term_id
    """),
    {
        "academic_year": data.academic_year,
        "semester": data.semester,
        "iid": current_user["institution_id"]
    }
).scalar()
        db.commit()
        log_audit(db, "CREATE", "AcademicTerm", new_id)
        return {"message": "Academic term created successfully", "term_id": new_id}
    finally:
        db.close()

@app.put("/api/academic-terms/{term_id}")
@app.put("/academic-terms/{term_id}")
def update_academic_term(term_id: int, data: AcademicTermInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        db.execute(
            text("""
                UPDATE academic_terms
                SET academic_year = :academic_year, semester = :semester
                WHERE term_id = :term_id
AND institution_id = :iid
            """),
            {**data.dict(), "term_id": term_id, "iid": current_user["institution_id"]}
        )
        db.commit()
        log_audit(db, "UPDATE", "AcademicTerm", term_id)
        return {"message": "Academic term updated successfully"}
    finally:
        db.close()

@app.delete("/api/academic-terms/{term_id}")
@app.delete("/academic-terms/{term_id}")
def delete_academic_term(term_id: int, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM academic_terms WHERE term_id = :id  AND institution_id = :iid"), {"id": term_id, "iid": current_user["institution_id"]})
        db.commit()
        log_audit(db, "DELETE", "AcademicTerm", term_id)
        return {"message": "Academic term deleted successfully"}
    finally:
        db.close()


# --- System Settings (Admin Settings Center) ---

@app.get("/api/admin/settings")
@app.get("/admin/settings")
def get_admin_settings(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        inst = db.execute(
            text("SELECT institution_name, logo_url, academic_year, contact_email, contact_phone, theme_color FROM institutions WHERE institution_id = :iid"),
            {"iid": current_user["institution_id"]}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution configuration not found")
            
        return {
            "institution_name": inst.institution_name,
            "institution_logo": inst.logo_url,
            "academic_year": inst.academic_year,
            "contact_email": inst.contact_email or "",
            "contact_phone": inst.contact_phone or "",
            "branding_color": inst.theme_color,
            "theme_preference": "dark"
        }
    finally:
        db.close()

@app.post("/api/admin/settings")
@app.post("/admin/settings")
def update_admin_settings(data: SystemSettingsInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        db.execute(
            text("""
                UPDATE institutions
                SET institution_name = :name,
                    logo_url = :logo,
                    academic_year = :year,
                    contact_email = :email,
                    contact_phone = :phone,
                    theme_color = :color
                WHERE institution_id = :iid
            """),
            {
                "name": data.institution_name,
                "logo": data.institution_logo,
                "year": data.academic_year,
                "email": data.contact_email,
                "phone": data.contact_phone,
                "color": data.branding_color,
                "iid": current_user["institution_id"]
            }
        )
        db.commit()
        log_audit(db, "UPDATE_SETTINGS", "SystemSettings", None, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "System settings updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/branding")
def get_branding(institution_id: Optional[int] = None):
    db = SessionLocal()
    try:
        iid = institution_id if institution_id is not None else 1
        inst = db.execute(
            text("SELECT institution_name, logo_url, theme_color FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution branding not found")
            
        return {
            "institution_name": inst.institution_name,
            "institution_logo": inst.logo_url,
            "branding_color": inst.theme_color,
            "theme_preference": "dark"
        }
    finally:
        db.close()


@app.post("/api/v1/admin/branding")
def update_branding(data: SystemSettingsInput, current_user: dict = Depends(require_role(["admin"]))):
    return update_admin_settings(data, current_user)


# --- Profile Schemas & Endpoints ---

class PasswordChangeInput(BaseModel):
    old_password: str
    new_password: str

class AvatarUpdateInput(BaseModel):
    avatar_url: str

@app.get("/api/v1/profile")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        uid = current_user["user_id"]
        role = current_user["role"]
        
        profile_data = {
            "user_id": uid,
            "email": current_user["email"],
            "role": role
        }
        
        if role == "student" and current_user["student_id"]:
            sid = current_user["student_id"]
            s = db.execute(text("SELECT * FROM students WHERE student_id = :sid"), {"sid": sid}).fetchone()
            if s:
                metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": sid}).fetchone()
                
                # Fetch career details (resume, custom_skills, certificates, achievements)
                career_row = db.execute(text("SELECT resume_text, custom_skills, certificates, achievements FROM student_career_profiles WHERE student_id = :sid"), {"sid": sid}).fetchone()
                
                resume_text = ""
                skills_list = []
                certs_list = []
                achievements_list = []
                
                import json
                if career_row:
                    resume_text = career_row.resume_text or ""
                    try:
                        skills_list = json.loads(career_row.custom_skills) if career_row.custom_skills else []
                    except Exception:
                        skills_list = []
                    try:
                        certs_list = json.loads(career_row.certificates) if career_row.certificates else []
                    except Exception:
                        certs_list = []
                    try:
                        achievements_list = json.loads(career_row.achievements) if career_row.achievements else []
                    except Exception:
                        achievements_list = []
                else:
                    # Create default empty career profile row if not exists
                    db.execute(text("INSERT INTO student_career_profiles (student_id) VALUES (:sid) ON CONFLICT DO NOTHING"), {"sid": sid})
                    db.commit()

                profile_data.update({
                    "name": s.full_name,
                    "rollNumber": s.roll_no,
                    "branch": s.department,
                    "semester": s.semester,
                    "division": s.division,
                    "mobile": s.mobile or "",
                    "avatar": s.avatar_url or "🚀",
                    "xp": metrics_row.xp_points if metrics_row else 0,
                    "resume": resume_text,
                    "skills": skills_list,
                    "certificates": certs_list,
                    "achievements": achievements_list
                })
        elif role == "faculty" and current_user["faculty_id"]:
            f = db.execute(text("SELECT * FROM faculty WHERE faculty_id = :fid"), {"fid": current_user["faculty_id"]}).fetchone()
            if f:
                # Fetch assigned classes and subjects
                assignments = db.execute(
                    text("""
                        SELECT fa.assignment_id, c.class_id, c.class_name, s.subject_id, s.subject_name, s.subject_code, fa.role, fa.academic_year
                        FROM faculty_assignments fa
                        JOIN classes c ON fa.class_id = c.class_id
                        JOIN subjects s ON fa.subject_id = s.subject_id
                        WHERE fa.faculty_id = :faculty_id
                    """),
                    {"faculty_id": current_user["faculty_id"]}
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

                # Fetch institution name
                institution_name = "COEP Technological University"
                if f.institution_id:
                    inst = db.execute(
                        text("SELECT institution_name FROM institutions WHERE institution_id = :iid"),
                        {"iid": f.institution_id}
                    ).fetchone()
                    if inst:
                        institution_name = inst.institution_name

                # Fetch account status & change password status
                u = db.execute(
                    text("SELECT must_change_password FROM users WHERE user_id = :uid"),
                    {"uid": uid}
                ).fetchone()
                must_change_password = bool(u.must_change_password) if u else False

                profile_data.update({
                    "name": f.full_name,
                    "faculty_code": f.faculty_code,
                    "branch": f.department,
                    "designation": f.designation,
                    "avatar": f.avatar_url or "👨‍🏫",
                    "assigned_classes": assigned_classes,
                    "assigned_subjects": assigned_subjects,
                    "institution_name": institution_name,
                    "must_change_password": must_change_password,
                    "account_status": "Active"
                })
        else:
            profile_data.update({
                "name": "System Administrator",
                "avatar": "🛡️"
            })
        return profile_data
    finally:
        db.close()

@app.post("/api/v1/profile/update")
def update_my_profile(data: dict, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "student" and current_user["student_id"]:
            sid = current_user["student_id"]
            db.execute(
                text("""
                    UPDATE students
                    SET full_name = :name, department = :dept, semester = :sem, division = :div, mobile = :mobile, roll_no = :roll
                    WHERE student_id = :sid
                """),
                {
                    "name": data.get("name"),
                    "dept": data.get("branch"),
                    "sem": int(data.get("semester", 5)),
                    "div": data.get("division", "A"),
                    "mobile": data.get("mobile", ""),
                    "roll": data.get("rollNumber", ""),
                    "sid": sid
                }
            )
            
            # Update student_career_profiles table
            import json
            skills_json = json.dumps(data.get("skills", []))
            certs_json = json.dumps(data.get("certificates", []))
            ach_json = json.dumps(data.get("achievements", []))
            resume_val = data.get("resume", "")
            
            career_exists = db.execute(text("SELECT student_id FROM student_career_profiles WHERE student_id = :sid"), {"sid": sid}).fetchone()
            if career_exists:
                db.execute(
                    text("""
                        UPDATE student_career_profiles
                        SET resume_text = :resume, custom_skills = :skills, certificates = :certs, achievements = :ach, updated_at = CURRENT_TIMESTAMP
                        WHERE student_id = :sid
                    """),
                    {
                        "resume": resume_val,
                        "skills": skills_json,
                        "certs": certs_json,
                        "ach": ach_json,
                        "sid": sid
                    }
                )
            else:
                db.execute(
                    text("""
                        INSERT INTO student_career_profiles (student_id, resume_text, custom_skills, certificates, achievements)
                        VALUES (:sid, :resume, :skills, :certs, :ach)
                    """),
                    {
                        "sid": sid,
                        "resume": resume_val,
                        "skills": skills_json,
                        "certs": certs_json,
                        "ach": ach_json
                    }
                )
            db.commit()
            log_audit(db, "UPDATE_PROFILE", "Student", sid, performed_by=f"Student {sid}")
            create_notification(db, "student", sid, "Profile Updated", "Your profile details have been successfully updated.", "profile", sid)
        elif role == "faculty" and current_user["faculty_id"]:
            fid = current_user["faculty_id"]
            db.execute(
                text("""
                    UPDATE faculty
                    SET full_name = :name, department = :dept, designation = :desg
                    WHERE faculty_id = :fid
                """),
                {
                    "name": data.get("name"),
                    "dept": data.get("branch"),
                    "desg": data.get("designation"),
                    "fid": fid
                }
            )
            db.commit()
            log_audit(db, "UPDATE_PROFILE", "Faculty", fid, performed_by=f"Faculty {fid}")
            log_faculty_activity(fid, "profile", "updated", "Updated faculty profile details.", fid, db=db)
            create_notification(db, "faculty", fid, "Profile Updated", "Your profile details have been successfully updated.", "profile", fid)
        return {"success": True, "message": "Profile updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/profile/avatar")
def update_my_avatar(data: AvatarUpdateInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "student" and current_user["student_id"]:
            db.execute(text("UPDATE students SET avatar_url = :url WHERE student_id = :sid"), {"url": data.avatar_url, "sid": current_user["student_id"]})
            db.commit()
            create_notification(db, "student", current_user["student_id"], "Avatar Updated", "Your profile avatar has been successfully updated.", "profile", current_user["student_id"])
        elif role == "faculty" and current_user["faculty_id"]:
            db.execute(text("UPDATE faculty SET avatar_url = :url WHERE faculty_id = :fid"), {"url": data.avatar_url, "fid": current_user["faculty_id"]})
            db.commit()
            create_notification(db, "faculty", current_user["faculty_id"], "Avatar Updated", "Your profile avatar has been successfully updated.", "profile", current_user["faculty_id"])
        return {"success": True, "message": "Avatar updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/profile/change-password")
def change_my_password(data: PasswordChangeInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        uid = current_user["user_id"]
        user = db.execute(text("SELECT password_hash FROM users WHERE user_id = :uid"), {"uid": uid}).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify old password
        password_bytes = data.old_password.encode('utf-8')
        hash_bytes = user.password_hash.encode('utf-8')
        if not bcrypt.checkpw(password_bytes, hash_bytes):
            # Log failed attempt
            db.execute(
                text("""
                    INSERT INTO security_events (user_id, email, event_type, details, created_at)
                    VALUES (:uid, :email, 'PASSWORD_CHANGE_FAILED', 'Incorrect old password', CURRENT_TIMESTAMP)
                """),
                {"uid": uid, "email": current_user["email"]}
            )
            db.commit()
            raise HTTPException(status_code=400, detail="The current password you entered is incorrect!")
        
        # Hash new password
        new_hash = hash_password(data.new_password)
        db.execute(text("UPDATE users SET password_hash = :hash, updated_at = CURRENT_TIMESTAMP WHERE user_id = :uid"), {"hash": new_hash, "uid": uid})
        db.commit()
        # Log success
        db.execute(
            text("""
                INSERT INTO security_events (user_id, email, event_type, details, created_at)
                VALUES (:uid, :email, 'PASSWORD_CHANGE_SUCCESS', 'Successfully changed password', CURRENT_TIMESTAMP)
            """),
            {"uid": uid, "email": current_user["email"]}
        )
        db.commit()
        log_audit(db, "CHANGE_PASSWORD", "User", uid, performed_by=f"User {uid}")
        if current_user.get("role") == "faculty" and current_user.get("faculty_id"):
            log_faculty_activity(current_user["faculty_id"], "authentication", "changed_password", "Successfully changed account password.", current_user["faculty_id"], db=db)
            create_notification(db, "faculty", current_user["faculty_id"], "Security Alert: Password Changed", "Your NeuroLearn-AI account password was successfully updated.", "profile", current_user["faculty_id"])
        elif current_user.get("role") == "student" and current_user.get("student_id"):
            create_notification(db, "student", current_user["student_id"], "Security Alert: Password Changed", "Your NeuroLearn-AI account password was successfully updated.", "profile", current_user["student_id"])
        return {"success": True, "message": "Password changed successfully"}
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# --- Additional Schemas for AI & Wellness ---

class AiChatInput(BaseModel):
    prompt: str

class WellnessMoodInput(BaseModel):
    happiness: int
    focus: int
    frustration: int
    stress: int
    sleep_hours: float
    study_hours: float
    learning_habits: List[str]

class TargetCareerInput(BaseModel):
    target_career: str

class CareerProfileInput(BaseModel):
    resume_text: Optional[str] = None
    target_career: Optional[str] = None
    custom_skills: Optional[List[str]] = None

class InterviewAnswerInput(BaseModel):
    question: str
    answer: str
    topic: str



# --- Additional Endpoints for AI, Wellness, & Career ---

@app.get("/api/v1/ai/chat/history")
def get_ai_chat_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can access AI Mentor Chat history.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        result = db.execute(
            text("""
                SELECT sender, message_text, code_text, created_at 
                FROM mentor_messages 
                WHERE student_id = :sid 
                ORDER BY created_at ASC
            """),
            {"sid": sid}
        ).fetchall()
        
        return [
            {
                "role": r.sender,
                "text": r.message_text,
                "code": r.code_text,
                "date": r.created_at.strftime("%I:%M:%S %p") if r.created_at else ""
            } for r in result
        ]
    finally:
        db.close()


@app.post("/api/v1/ai/chat/stream")
def stream_ai_chat_message(data: AiChatInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can chat with the AI Mentor.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        prompt = data.prompt.strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
        # 1. Log the user's message in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'user', :msg, NULL)
            """),
            {"sid": sid, "msg": prompt}
        )
        db.commit()
    finally:
        db.close()

    async def event_generator():
        import asyncio
        db_gen = SessionLocal()
        try:
            # Fetch some brief context history (last 5 messages)
            history_records = db_gen.execute(
                text("""
                    SELECT sender, message_text 
                    FROM mentor_messages 
                    WHERE student_id = :sid 
                    ORDER BY created_at DESC 
                    LIMIT 6
                """),
                {"sid": sid}
            ).fetchall()
            history_records.reverse()
            
            chat_history = []
            for hr in history_records[:-1]: # exclude the one we just inserted
                role = "user" if hr.sender == "user" else "model"
                chat_history.append({"role": role, "parts": [hr.message_text]})
            
            reply = ""
            gemini_key = os.getenv("GEMINI_API_KEY")
            
            system_instruction = """You are an expert AI Academic and Career Mentor.
Always try to include short, concrete learning suggestions (e.g. quiz links like '/quiz?domain=ai-ml&node=aiml-3'), career recommendations, or roadmap tips when relevant.
Be supportive, clear, and structured.
"""
            
            if gemini_key:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=gemini_key)
                    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
                    
                    contents = []
                    for h in chat_history:
                        contents.append(h)
                    contents.append({"role": "user", "parts": [prompt]})
                    
                    response_stream = model.generate_content(contents, stream=True)
                    for chunk in response_stream:
                        chunk_text = chunk.text
                        reply += chunk_text
                        yield chunk_text
                except Exception as e:
                    print(f"Gemini API streaming error: {e}")
                    gemini_key = None # trigger fallback
            
            if not gemini_key:
                lower_prompt = prompt.lower()
                mock_text = ""
                if "vanishing gradient" in lower_prompt or "vanishing gradients" in lower_prompt:
                    mock_text = """The vanishing gradient problem occurs during the training of deep neural networks using backpropagation. As gradients are propagated backward through layers, repeated multiplication of small derivatives (e.g. < 0.25 for Sigmoid) causes gradients to shrink exponentially.

### Mathematical Breakdown
During backpropagation, the gradient of the loss function L with respect to weight w1 in the first layer is computed using the Chain Rule:
$$\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a_d} \\times \\dots \\times \\frac{\\partial a_1}{\\partial w_1}$$

### Solutions
1. **Activation Functions**: Use ReLU (f(x) = max(0, x)) or its variants (Leaky ReLU) in hidden layers since their derivative is 1 for positive inputs.
2. **Weight Initialization**: Implement He (Kaiming) or Xavier (Glorot) initializations to maintain stable variance across layers.
3. **Batch Normalization**: Normalize inputs to each layer, preventing activations from saturated bounds.
4. **Residual Connections**: Skip connections (e.g. ResNet) allow gradients to bypass layers without shrinking.

*Learning Recommendation:* Check out our quiz [Deep Learning & Neural Networks](/quiz?domain=ai-ml&node=aiml-3).
*Roadmap Suggestion:* Complete the AI/ML track to master MLOps containerization.
"""
                elif "secure" in lower_prompt and ("express" in lower_prompt or "sqli" in lower_prompt):
                    mock_text = """Securing an Express application against SQL Injection (SQLi) requires preventing user inputs from being interpreted as database query commands.

### Best Practices for Secure Node/SQL Design
1. **Never Concatenate Inputs**: Do not write strings like "SELECT * FROM users WHERE name = '" + req.body.name + "'".
2. **Prepared Statements**: Leverage parameterized queries. Database drivers compile the query structure first, ensuring user variables are treated strictly as data indices.
3. **ORM/Query Builders**: Use libraries like Sequelize, Knex, or Prisma which implement prepared parameters out of the box.
4. **Input Validation**: Use schemas (e.g., Joi, Zod) to validate and sanitize incoming payloads.

*Learning Recommendation:* Complete the [REST APIs & Databases](/quiz?domain=full-stack&node=fs-3) quiz.
*Career Suggestion:* Consider the Cyber Security Analyst track if you love secure architectures.
"""
                elif "kubernetes" in lower_prompt or "fastapi" in lower_prompt or "capstone" in lower_prompt:
                    mock_text = """Here is a high-yield, college Capstone-level project architecture that integrates FastAPI, Kubernetes (K8s), and Distributed Systems principles.

### Project Title: "AeroPulse - High-Frequency IoT Analytics Engine"

### Core Architecture Components
1. **Ingress Layer**: Ingress routing HTTP telemetry packets to the K8s cluster.
2. **Compute Nodes (FastAPI)**: Lightweight, asynchronous FastAPI microservices running in Docker containers. Auto-scaled using K8s Horizontal Pod Autoscaler (HPA) based on load.
3. **Broker (Redis/RabbitMQ)**: A queue container cluster separating compute ingestion from database persistence.
4. **Analytics Worker**: Python scripts analyzing anomalies (e.g., sensor outlier spikes) utilizing scientific libraries.
5. **UI (Vite + Recharts)**: Real-time visualization charting engine.

*Learning Recommendation:* Complete the [Microservices & Kubernetes](/quiz?domain=cloud&node=cloud-4) quiz.
*Career Recommendation:* This project perfectly targets Cloud Engineer or DevOps Engineer pathways.
"""
                else:
                    mock_text = f"That's an interesting technical question about '{prompt}'! As your AI Mentor, I suggest exploring this concept by building small prototype scripts. Let's look at the learning resources in the sidebar for tutorials.\n\n*Quiz Recommendation:* Take the matching domain quiz to earn +100 XP!\n*Roadmap Suggestion:* Review your progress tracker under 'Roadmap & Gaps' to identify key milestones."
                
                # Stream word-by-word
                words = mock_text.split(" ")
                for i in range(0, len(words), 3):
                    chunk = " ".join(words[i:i+3]) + " "
                    reply += chunk
                    yield chunk
                    await asyncio.sleep(0.08)
            
            # Extract code block if any
            import re
            code_block = None
            code_match = re.search(r'```(?:\w*)\n(.*?)```', reply, re.DOTALL)
            if code_match:
                code_block = code_match.group(1).strip()
                reply_clean = re.sub(r'```(?:\w*)\n(.*?)```', '', reply, flags=re.DOTALL).strip()
            else:
                reply_clean = reply
                
            db_gen.execute(
                text("""
                    INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                    VALUES (:sid, 'assistant', :msg, :code)
                """),
                {"sid": sid, "msg": reply_clean, "code": code_block}
            )
            db_gen.commit()
            
        except Exception as e:
            print(f"Error in stream event generator: {e}")
        finally:
            db_gen.close()
            
    from fastapi.responses import StreamingResponse
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/api/v1/ai/chat")
def send_ai_chat_message(data: AiChatInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can chat with the AI Mentor.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        prompt = data.prompt.strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
        # 1. Log the user's message in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'user', :msg, NULL)
            """),
            {"sid": sid, "msg": prompt}
        )
        db.commit()
        
        # 2. Get LLM response
        reply = ""
        code_block = None
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Fetch some brief context history (last 5 messages)
                history_records = db.execute(
                    text("""
                        SELECT sender, message_text 
                        FROM mentor_messages 
                        WHERE student_id = :sid 
                        ORDER BY created_at DESC 
                        LIMIT 6
                    """),
                    {"sid": sid}
                ).fetchall()
                history_records.reverse()
                
                chat_history = []
                for hr in history_records[:-1]: # exclude the one we just inserted
                    role = "user" if hr.sender == "user" else "model"
                    chat_history.append({"role": role, "parts": [hr.message_text]})
                
                chat = model.start_chat(history=chat_history)
                response = chat.send_message(prompt)
                full_response = response.text
                
                # Extract code block if any (markdown ``` block)
                import re
                code_match = re.search(r'```(?:\w*)\n(.*?)```', full_response, re.DOTALL)
                if code_match:
                    code_block = code_match.group(1).strip()
                    # Remove code block from standard text response
                    reply = re.sub(r'```(?:\w*)\n(.*?)```', '', full_response, flags=re.DOTALL).strip()
                else:
                    reply = full_response
            except Exception as e:
                print(f"Gemini API execution error: {e}")
                reply = f"System Error executing AI prompt. Falling back to local offline diagnostics..."
        
        # Heuristics Fallback
        if not reply or reply.startswith("System Error"):
            lower_prompt = prompt.lower()
            if "vanishing gradient" in lower_prompt or "vanishing gradients" in lower_prompt:
                reply = """The vanishing gradient problem occurs during the training of deep neural networks using backpropagation, where gradients shrink exponentially as they propagate backward through the network layers.

### Mathematical Breakdown
During backpropagation, the gradient of the loss function L with respect to weight w1 in the first layer is computed using the Chain Rule:
∂L/∂w1 = (∂L/∂a_d) * (∂a_d/∂a_d-1) * ... * (∂a_2/∂a_1) * (∂a_1/∂w_1)

If the activation functions (like Sigmoid or Tanh) have derivatives strictly less than 1 (f'(x) <= 0.25 for Sigmoid), multiplying many of these terms together causes the product to approach 0. Consequently, the weights of early layers update extremely slowly, halting learning.

### Standard Solutions
1. Activation Functions: Use ReLU (f(x) = max(0, x)) or its variants (Leaky ReLU) in hidden layers since their derivative is 1 for positive inputs.
2. Weight Initialization: Implement He (Kaiming) or Xavier (Glorot) initializations to maintain stable variance across layers.
3. Batch Normalization: Normalize inputs to each layer, preventing activations from saturated bounds.
4. Residual Connections: Skip connections (e.g. ResNet) allow gradients to bypass layers without shrinking."""
                code_block = """import torch.nn as nn

# Correct implementation using Residual connections and ReLU
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        # Adding residual connection preserves gradients
        return out + residual"""
            elif "secure" in lower_prompt and ("express" in lower_prompt or "sqli" in lower_prompt):
                reply = """Securing an Express application against SQL Injection (SQLi) requires preventing user inputs from being interpreted as database query commands.

### Best Practices for Secure Node/SQL Design
1. Never Concatenate Inputs: Do not write strings like "SELECT * FROM users WHERE name = '" + req.body.name + "'".
2. Prepared Statements: Leverage parameterized queries. Database drivers compile the query structure first, ensuring user variables are treated strictly as data indices.
3. ORM/Query Builders: Use libraries like Sequelize, Knex, or Prisma which implement prepared parameters out of the box.
4. Input Validation: Use schemas (e.g., Joi, Zod) to validate and sanitize incoming payloads."""
                code_block = """const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const pool = mysql.createPool({ host: 'localhost', database: 'college_db' });

// SECURE: Parameterized Query
app.post('/api/student-profile', async (req, res) => {
  const { rollNumber } = req.body;
  try {
    // The '?' acts as a placeholder. mysql2 safely sanitizes variables.
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE roll_number = ?',
      [rollNumber]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send("Database error");
  }
});"""
            elif "kubernetes" in lower_prompt or "fastapi" in lower_prompt or "capstone" in lower_prompt:
                reply = """Here is a high-yield, college Capstone-level project architecture that integrates FastAPI, Kubernetes (K8s), and Distributed Systems principles.

### Project Title: "AeroPulse - High-Frequency IoT Analytics Engine"

### Core Architecture Components
1. Ingress Layer: Ingress routing HTTP telemetry packets to the K8s cluster.
2. Compute Nodes (FastAPI): Lightweight, asynchronous FastAPI microservices running in Docker containers. Auto-scaled using K8s Horizontal Pod Autoscaler (HPA) based on load.
3. Broker (Redis/RabbitMQ): A queue container cluster separating compute ingestion from database persistence.
4. Analytics Worker: Python scripts analyzing anomalies (e.g., sensor outlier spikes) utilizing scientific libraries.
5. UI (Vite + Recharts): Real-time visualization charting engine.

### Learning Projections & Faculty Selling Point
- Concurrency: Showcases FastAPI's async execution handling 5,000+ mock IoT sensor readings/sec.
- Resilience: Simulates container failure to prove Kubernetes self-healing replica policies.
- Scaling: Demonstrates dynamic container scale-out when CPU load exceeds 70%."""
                code_block = """# deployment.yaml (Kubernetes HPA config)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aeropulse-ingestion-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aeropulse-ingestion
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70"""
            else:
                reply = f"That's an interesting technical question! I can help you model that concept, draft an architecture, or review configurations. (Using offline fallback mode. Configure GEMINI_API_KEY in .env for active generative support.)"
                code_block = None

        # 3. Log the AI's response in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'assistant', :msg, :code)
            """),
            {"sid": sid, "msg": reply, "code": code_block}
        )
        db.commit()
        
        return {
            "role": "assistant",
            "text": reply,
            "code": code_block,
            "date": datetime.now().strftime("%I:%M:%S %p")
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/wellness/mood")
def log_wellness_mood(data: WellnessMoodInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can log mood vectors.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        
        # Parse habits as JSON
        import json
        habits_json = json.dumps(data.learning_habits)
        
        # 1. Generate AI-driven Wellness/Remediation recommendations
        gemini_key = os.getenv("GEMINI_API_KEY")
        recommendations_list = []
        
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are a Learning Wellness AI Advisor at NeuroLearn-AI.
                Analyze the following student wellness parameters logged today:
                - Happiness/Mood level: {data.happiness}/100
                - Focus/Cognitive flow: {data.focus}/100
                - Frustration index: {data.frustration}/100
                - Stress index: {data.stress}/100
                - Sleep: {data.sleep_hours} hours
                - Study Hours: {data.study_hours} hours
                - Learning Habits used today: {", ".join(data.learning_habits)}
                
                Based on this, generate exactly 3 custom, highly-actionable recommendations for optimizing their study wellness and avoiding academic burnout.
                Respond with a valid JSON array of exactly 3 strings. Do not include markdown tags, code blocks, or explanations outside the JSON array.
                Example: ["Log off by 10 PM and aim for 8 hours of sleep", "Take a 5-minute break after each Pomodoro session", "Practice active recall on weak subjects"]
                """
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                if raw_text.startswith("```"):
                    raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                    raw_text = re.sub(r'\n```$', '', raw_text)
                
                recommendations_list = json.loads(raw_text.strip())
            except Exception as e:
                print(f"Gemini API error during wellness analysis: {e}")
                
        if not recommendations_list:
            # Rich rule-based backup recommender
            # Sleep recommendations
            if data.sleep_hours < 6.0:
                recommendations_list.append(f"Your sleep ({data.sleep_hours}h) is low. Prioritize getting 7.5+ hours tonight to support memory consolidation.")
            else:
                recommendations_list.append("Great sleep duration today! Keep maintaining a consistent bedtime for optimal learning performance.")
                
            # Stress/Frustration recommendations
            if data.stress > 60 or data.frustration > 60:
                recommendations_list.append("High cognitive strain detected. Refrain from studying heavy concepts tonight and practice deep breathing.")
            else:
                recommendations_list.append("Your cognitive stress levels are balanced. This is an excellent window for difficult roadmap challenges.")
                
            # Study duration recommendations
            if data.study_hours > 8.0:
                recommendations_list.append("Log off and relax! Excessive study hours block passive assimilation and cause burnout.")
            elif data.study_hours < 2.0 and data.focus > 70:
                recommendations_list.append("Your focus is sharp. Capitalize on it by attempting a quick quiz node in the Programming Hub.")
            else:
                recommendations_list.append("Integrate active recall techniques or space out your revision sessions rather than cramming.")
                
        recs_json = json.dumps(recommendations_list)
        
        # 2. Insert into PostgreSQL DB
        db.execute(
            text("""
                INSERT INTO wellness_mood_logs (
                    student_id, happiness, focus, frustration, stress, 
                    sleep_hours, study_hours, learning_habits, recommendations
                )
                VALUES (:sid, :hap, :foc, :fru, :str, :sleep, :study, :habits, :recs)
            """),
            {
                "sid": sid,
                "hap": data.happiness,
                "foc": data.focus,
                "fru": data.frustration,
                "str": data.stress,
                "sleep": data.sleep_hours,
                "study": data.study_hours,
                "habits": habits_json,
                "recs": recs_json
            }
        )
        db.commit()
        return {
            "success": True, 
            "message": "Wellness metrics logged successfully",
            "recommendations": recommendations_list
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/v1/wellness/mood/history")
def get_wellness_mood_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can view mood history.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        result = db.execute(
            text("""
                SELECT happiness, focus, frustration, stress, sleep_hours, study_hours, 
                       learning_habits, recommendations, log_date 
                FROM wellness_mood_logs 
                WHERE student_id = :sid 
                ORDER BY created_at DESC 
                LIMIT 10
            """),
            {"sid": sid}
        ).fetchall()
        
        history_list = []
        import json
        for r in result:
            try:
                habs = json.loads(r.learning_habits) if r.learning_habits else []
            except Exception:
                habs = []
                
            try:
                recs = json.loads(r.recommendations) if r.recommendations else []
            except Exception:
                recs = []
                
            history_list.append({
                "day": r.log_date.strftime("%a") if r.log_date else "Today",
                "date": str(r.log_date) if r.log_date else None,
                "happy": int(r.happiness),
                "focused": int(r.focus),
                "frustrated": int(r.frustration),
                "stressed": int(r.stress),
                "sleep_hours": float(r.sleep_hours) if r.sleep_hours is not None else 8.0,
                "study_hours": float(r.study_hours) if r.study_hours is not None else 0.0,
                "learning_habits": habs,
                "recommendations": recs
            })
        
        # Reverse to show chronological order for trends chart
        history_list.reverse()
        
        # Baseline mock history if empty
        if not history_list:
            return [
                { "day": "Mon", "happy": 45, "focused": 30, "frustrated": 15, "stressed": 10, "sleep_hours": 7.0, "study_hours": 3.0, "learning_habits": ["Active Recall"], "recommendations": [] },
                { "day": "Tue", "happy": 48, "focused": 35, "frustrated": 10, "stressed": 7, "sleep_hours": 8.0, "study_hours": 4.0, "learning_habits": ["Spaced Repetition"], "recommendations": [] },
                { "day": "Wed", "happy": 35, "focused": 45, "frustrated": 12, "stressed": 8, "sleep_hours": 6.5, "study_hours": 5.0, "learning_habits": ["Feynman Technique"], "recommendations": [] },
                { "day": "Thu", "happy": 40, "focused": 25, "frustrated": 20, "stressed": 15, "sleep_hours": 5.5, "study_hours": 6.0, "learning_habits": ["Pomodoro Technique"], "recommendations": [] },
                { "day": "Fri", "happy": 42, "focused": 38, "frustrated": 12, "stressed": 8, "sleep_hours": 7.5, "study_hours": 4.5, "learning_habits": ["Mind Mapping"], "recommendations": [] },
                { "day": "Sat", "happy": 45, "focused": 40, "frustrated": 10, "stressed": 5, "sleep_hours": 8.5, "study_hours": 2.0, "learning_habits": ["Active Recall"], "recommendations": [] },
                { "day": "Today", "happy": 60, "focused": 70, "frustrated": 20, "stressed": 15, "sleep_hours": 7.5, "study_hours": 4.0, "learning_habits": ["Spaced Repetition", "Active Recall"], "recommendations": ["Aim for an honors grade", "Limit contiguous focus hours"] }
            ]
        
        if history_list:
            history_list[-1]["day"] = "Today"
            
        return history_list
    finally:
        db.close()

@app.post("/api/v1/wellness/focus")
def complete_focus_session(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can complete focus sessions.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        # 1. Log completed focus session
        db.execute(
            text("INSERT INTO wellness_focus_sessions (student_id) VALUES (:sid)"),
            {"sid": sid}
        )
        
        # 2. Add +50 XP to student_metrics
        db.execute(
            text("""
                UPDATE student_metrics
                SET xp_points = xp_points + 50, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """),
            {"sid": sid}
        )
        
        # Fetch updated XP
        updated_xp = db.execute(
            text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or 0
        
        db.commit()
        return {"success": True, "xp_points": updated_xp}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/v1/wellness/focus/stats")
def get_focus_session_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can fetch focus stats.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        count = db.execute(
            text("SELECT COUNT(*) FROM wellness_focus_sessions WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or 0
        return {"completed_sessions": count}
    finally:
        db.close()

@app.post("/api/v1/student/target-career")
def set_target_career(data: TargetCareerInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can set target careers.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        db.execute(
            text("""
                UPDATE student_metrics
                SET target_career = :tc, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """),
            {"tc": data.target_career, "sid": sid}
        )
        db.commit()
        return {"success": True, "message": "Target career updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/v1/student/target-career")
def get_target_career(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can fetch target careers.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        tc = db.execute(
            text("SELECT target_career FROM student_metrics WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or "ai-engineer"
        return {"target_career": tc}
    finally:
        db.close()


@app.get("/api/v1/career/profile")
def get_career_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can access career profiles.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        # Ensure row exists
        profile = db.execute(
            text("SELECT resume_text, target_career, custom_skills, ai_analysis FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if not profile:
            # Let's seed an empty profile
            db.execute(
                text("""
                    INSERT INTO student_career_profiles (student_id, resume_text, target_career, custom_skills, ai_analysis)
                    VALUES (:sid, NULL, 'ai-engineer', '[]'::jsonb, NULL)
                    ON CONFLICT (student_id) DO NOTHING
                """),
                {"sid": sid}
            )
            db.commit()
            profile = db.execute(
                text("SELECT resume_text, target_career, custom_skills, ai_analysis FROM student_career_profiles WHERE student_id = :sid"),
                {"sid": sid}
            ).fetchone()
            
        import json
        custom_skills = []
        if profile.custom_skills:
            if isinstance(profile.custom_skills, str):
                custom_skills = json.loads(profile.custom_skills)
            else:
                custom_skills = profile.custom_skills
                
        ai_analysis = None
        if profile.ai_analysis:
            if isinstance(profile.ai_analysis, str):
                ai_analysis = json.loads(profile.ai_analysis)
            else:
                ai_analysis = profile.ai_analysis
                
        return {
            "resume_text": profile.resume_text,
            "target_career": profile.target_career,
            "custom_skills": custom_skills,
            "ai_analysis": ai_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/career/profile")
def save_career_profile(data: CareerProfileInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can update career profiles.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        import json
        custom_skills_json = json.dumps(data.custom_skills or [])
        
        # Check if row exists
        existing = db.execute(
            text("SELECT student_id FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if existing:
            db.execute(
                text("""
                    UPDATE student_career_profiles
                    SET resume_text = COALESCE(:resume_text, resume_text),
                        target_career = COALESCE(:target_career, target_career),
                        custom_skills = COALESCE(:custom_skills, custom_skills),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE student_id = :sid
                """),
                {
                    "resume_text": data.resume_text,
                    "target_career": data.target_career,
                    "custom_skills": custom_skills_json if data.custom_skills is not None else None,
                    "sid": sid
                }
            )
        else:
            db.execute(
                text("""
                    INSERT INTO student_career_profiles (student_id, resume_text, target_career, custom_skills)
                    VALUES (:sid, :resume_text, :target_career, :custom_skills)
                """),
                {
                    "sid": sid,
                    "resume_text": data.resume_text or "",
                    "target_career": data.target_career or "ai-engineer",
                    "custom_skills": custom_skills_json
                }
            )
            
        # Also sync target_career to student_metrics
        if data.target_career:
            db.execute(
                text("UPDATE student_metrics SET target_career = :tc, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid"),
                {"tc": data.target_career, "sid": sid}
            )
            
        db.commit()
        return {"success": True, "message": "Career profile saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/career/analyze")
def analyze_career_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can trigger career profile analysis.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        
        # 1. Fetch student info
        student = db.execute(
            text("SELECT s.full_name, s.department, s.semester, sm.predicted_cgpa, sm.attendance, sm.xp_points FROM students s JOIN student_metrics sm ON s.student_id = sm.student_id WHERE s.student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
            
        # 2. Fetch career profile details
        profile = db.execute(
            text("SELECT resume_text, target_career, custom_skills FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        resume_text = profile.resume_text if (profile and profile.resume_text) else "No resume uploaded."
        target_career = profile.target_career if (profile and profile.target_career) else "ai-engineer"
        import json
        custom_skills_list = []
        if profile and profile.custom_skills:
            if isinstance(profile.custom_skills, str):
                custom_skills_list = json.loads(profile.custom_skills)
            else:
                custom_skills_list = profile.custom_skills
                
        # 3. Fetch completed quiz attempts
        quiz_attempts = db.execute(
            text("SELECT DISTINCT node_id, domain_id FROM quiz_attempts WHERE student_id = :sid AND passed = True"),
            {"sid": sid}
        ).fetchall()
        completed_quizzes = [f"{q.domain_id}/{q.node_id}" for q in quiz_attempts]
        
        # 4. Fetch completed programming problems
        programming = db.execute(
            text("""
                SELECT pq.title, pq.difficulty 
                FROM student_programming_progress spp 
                JOIN programming_questions pq ON spp.question_id = pq.question_id 
                WHERE spp.student_id = :sid AND spp.completed = True
            """),
            {"sid": sid}
        ).fetchall()
        completed_programming = [f"{p.title} ({p.difficulty})" for p in programming]
        
        # Call Gemini or execute fallback
        gemini_key = os.getenv("GEMINI_API_KEY")
        analysis_result = None
        
        prompt = f"""
You are an expert AI Career Mentor. Analyze the following student's profile for the target role: "{target_career}".

### STUDENT PROFILE:
- Name: {student.full_name}
- Department: {student.department}
- Semester: {student.semester}
- CGPA: {float(student.predicted_cgpa) if student.predicted_cgpa else 0.0}
- Attendance: {float(student.attendance) if student.attendance else 0.0}%
- XP Points: {student.xp_points}
- Completed Quizzes (Curriculum Topics): {completed_quizzes}
- Completed Programming Problems: {completed_programming}
- Custom Self-Declared Skills: {custom_skills_list}
- Uploaded Resume Text:
---
{resume_text}
---

Generate a highly personalized AI Career Guidance report in JSON format.
You must return ONLY a valid JSON object. Do not include markdown formatting like ```json or anything else. The output should be a parseable JSON block matching this schema:

{{
  "readiness_score": integer (0 to 100 representing their readiness for placement in the target career),
  "readiness_summary": "string summary of their profile alignment",
  "role_recommendations": [
    {{
      "title": "string (matching alternative tech role from: AI Engineer, Machine Learning Engineer, Data Scientist, Data Analyst, Software Engineer, Cloud Engineer, Cyber Security Analyst, DevOps Engineer, Product Manager, Business Analyst)",
      "alignment": integer (0 to 100),
      "reason": "string detailed explanation why this aligns with their background"
    }}
  ],
  "skill_gap_analysis": {{
    "acquired": ["string of skills the student has shown proficiency in"],
    "missing": ["string of crucial missing skills for their target role"]
  }},
  "resume_suggestions": [
    "string suggestion 1",
    "string suggestion 2"
  ],
  "placement_readiness": {{
    "score": integer (0 to 100),
    "strengths": ["string strength 1", "string strength 2"],
    "weak_areas": ["string weak area 1", "string weak area 2"],
    "preparation_tips": ["string actionable prep tip 1", "string actionable prep tip 2"]
  }},
  "learning_suggestions": [
    {{
      "type": "string (quiz | certification | course)",
      "title": "string title",
      "url": "string (url to quiz, e.g. /quiz?domain=ai-ml&node=aiml-3, or external resource url)"
    }}
  ],
  "company_recommendations": [
    {{
      "name": "string company name from standard market",
      "role": "string recommended internship/entry level role",
      "suitability": "string (High | Medium | Low alignment reasoning)"
    }}
  ],
  "internship_opportunities": [
    {{
      "title": "string title",
      "company": "string company",
      "description": "string description",
      "link": "string url"
    }}
  ],
  "mock_interview_questions": [
    {{
      "question": "string technical question related to their target role, gaps, and resume",
      "topic": "string topic area"
    }}
  ]
}}
"""
        
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                # Clean clean json tags if gemini output markdown by mistake
                if raw_text.startswith("```"):
                    raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                    raw_text = re.sub(r'\n```$', '', raw_text)
                analysis_result = json.loads(raw_text.strip())
            except Exception as e:
                print(f"Gemini API error during career analysis: {e}")
                
        # Heuristic/Fallback generator if Gemini failed or key was missing
        if not analysis_result:
            # Let's map target role to default recommendations
            readiness_val = int(min(95, max(30, int(student.xp_points / 25) + int(float(student.predicted_cgpa or 0) * 5))))
            
            # Simple list of companies
            companies_mapping = {
                "ai-engineer": [{"name": "NVIDIA", "role": "Research Intern - Deep Learning", "suitability": "High alignment"}, {"name": "Google", "role": "ML Intern", "suitability": "Medium alignment"}],
                "software-engineer": [{"name": "Microsoft", "role": "Software Engineering Intern", "suitability": "High alignment"}, {"name": "TCS", "role": "Systems Engineer", "suitability": "High alignment"}],
                "cloud-engineer": [{"name": "Amazon AWS", "role": "Cloud Support Associate", "suitability": "High alignment"}, {"name": "GCP", "role": "Cloud Solutions Intern", "suitability": "Medium alignment"}],
                "cybersecurity-analyst": [{"name": "Palo Alto Networks", "role": "Security Intern", "suitability": "High alignment"}, {"name": "CrowdStrike", "role": "SOC Analyst", "suitability": "Medium alignment"}]
            }
            role_cos = companies_mapping.get(target_career, [{"name": "Cognizant", "role": "Technical Graduate", "suitability": "High alignment"}])
            
            # Generate mock questions
            q_mapping = {
                "ai-engineer": [
                    {"question": "What is the difference between supervised fine-tuning and RLHF in LLMs?", "topic": "Generative AI"},
                    {"question": "Explain vanishing gradients and how residual skips prevent them.", "topic": "Deep Learning"}
                ],
                "software-engineer": [
                    {"question": "Explain database normalization up to BCNF and when to denormalize.", "topic": "DBMS"},
                    {"question": "Compare REST API vs WebSockets for real-time messaging workloads.", "topic": "Web Architecture"}
                ],
                "cloud-engineer": [
                    {"question": "What is the role of an Ingress Controller in a Kubernetes cluster?", "topic": "Microservices"},
                    {"question": "How do IAM roles compare to user keys for access security?", "topic": "Cloud IAM"}
                ],
                "cybersecurity-analyst": [
                    {"question": "Walk through the steps of an SSL/TLS handshake.", "topic": "Cryptography"},
                    {"question": "Explain SQL Injection vulnerabilities and how prepared queries secure them.", "topic": "Web Exploits"}
                ]
            }
            role_qs = q_mapping.get(target_career, [
                {"question": "Describe an engineering problem you solved and your implementation methodology.", "topic": "General Engineering"},
                {"question": "How do you check computational complexity using Big O notation?", "topic": "DSA"}
            ])
            
            analysis_result = {
                "readiness_score": readiness_val,
                "readiness_summary": f"Your current academic profile (CGPA {student.predicted_cgpa}, {student.xp_points} XP) shows solid progression. You have completed {len(completed_quizzes)} quizzes and {len(completed_programming)} programming challenges. Focus on bridging gaps around {target_career.replace('-', ' ').title()} specific libraries.",
                "role_recommendations": [
                    {"title": "Machine Learning Engineer" if target_career == "ai-engineer" else "AI Engineer", "alignment": readiness_val - 5, "reason": "Strong background in statistics and database processing aligns well with ML pipelines."},
                    {"title": "Software Engineer", "alignment": readiness_val + 10, "reason": "High programming completions qualify you for general systems engineering roles."}
                ],
                "skill_gap_analysis": {
                    "acquired": ["Python", "SQL", "Git"] + custom_skills_list[:3],
                    "missing": ["LangChain", "Vector Databases", "MLOps Infrastructure"] if target_career == "ai-engineer" else ["Docker", "Kubernetes", "Redis Caching"]
                },
                "resume_suggestions": [
                    f"Integrate keywords matching the '{target_career.replace('-', ' ').title()}' role descriptors such as data analysis and model tracking.",
                    "Quantify project metrics (e.g. 'Reduced indexing time by 30% using vector caching').",
                    "Add technical profiles (Leetcode, Github) directly to the header."
                ],
                "placement_readiness": {
                    "score": readiness_val,
                    "strengths": [f"Excellent attendance record of {student.attendance}%", f"Active platform involvement with {student.xp_points} XP"],
                    "weak_areas": ["Requires larger capstone projects listed on resume", "Needs more mock interview practice"],
                    "preparation_tips": ["Complete at least 5 intermediate domain-specific quizzes", "Run regular mock technical interviews on standard questions"]
                },
                "learning_suggestions": [
                    {"type": "quiz", "title": "Generative AI & LLMs", "url": "/quiz?domain=ai-ml&node=aiml-4"},
                    {"type": "certification", "title": "AWS Certified Cloud Practitioner", "url": "https://aws.amazon.com/certification/"}
                ],
                "company_recommendations": role_cos,
                "internship_opportunities": [
                    {
                        "title": f"{target_career.replace('-', ' ').title()} Intern",
                        "company": role_co["name"],
                        "description": f"Build analytics dashboards and scalable connectors. Key alignment: {role_co['suitability']}",
                        "link": "https://supabase.com/careers"
                    } for role_co in role_cos
                ],
                "mock_interview_questions": role_qs
            }
            
        # 5. Save the analysis to database
        db.execute(
            text("UPDATE student_career_profiles SET ai_analysis = :ai_analysis, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid"),
            {"ai_analysis": json.dumps(analysis_result), "sid": sid}
        )
        db.commit()
        return analysis_result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/career/interview/evaluate")
def evaluate_interview_response(data: InterviewAnswerInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can submit interview responses.")
        
    gemini_key = os.getenv("GEMINI_API_KEY")
    prompt = f"""
You are a technical interviewer. Evaluate the student's answer to the mock interview question below.

Question Topic: {data.topic}
Question: {data.question}
Student's Response:
---
{data.answer}
---

Provide a constructive review of their response in JSON format.
You must return ONLY a valid JSON object. Do not include markdown formatting like ```json or anything else. The output should be a parseable JSON block matching this schema:

{{
  "score": integer (0 to 100 rating the accuracy and depth of their response),
  "verdict": "string (e.g. Excellent, Good, Needs Improvement, Incorrect)",
  "strengths": "string describing what they did well",
  "weaknesses": "string detailing what was missing or incorrect",
  "suggested_improvement": "string providing the correct/better way to phrase or answer the question, including any relevant code/concepts"
}}
"""
    import json
    eval_result = None
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                raw_text = re.sub(r'\n```$', '', raw_text)
            eval_result = json.loads(raw_text.strip())
        except Exception as e:
            print(f"Gemini evaluation error: {e}")
            
    if not eval_result:
        # Fallback evaluation logic based on length and keywords
        score = 40
        verdict = "Needs Improvement"
        strengths = "Attempted the question."
        weaknesses = "Lacks deep technical details or specific examples."
        suggested = "For a complete answer, explain key components mathematically, provide structure definitions, or outline actual use cases. (Fallback Mode)"
        
        answer_lower = data.answer.lower()
        if len(data.answer) > 50:
            score += 15
            verdict = "Good"
            strengths = "Provided a reasonable verbal explanation."
            
        # Topic specific keywords
        keywords = {
            "Generative AI": ["rlhf", "fine-tuning", "weights", "dataset", "prompts"],
            "Deep Learning": ["vanishing", "gradients", "relu", "sigmoid", "residual", "backpropagation"],
            "DBMS": ["bcnf", "normalization", "redundancy", "join", "anomaly"],
            "Web Architecture": ["websocket", "stateless", "http", "polling", "latency"],
            "Microservices": ["ingress", "pod", "kubernetes", "k8s", "proxy"],
            "Cloud IAM": ["role", "permissions", "temporary", "access key", "least privilege"],
            "Cryptography": ["handshake", "ssl", "tls", "private key", "public key", "certificates"],
            "Web Exploits": ["sqli", "prepared", "parameterized", "sanitize", "input"]
        }
        
        matches = [kw for kw in keywords.get(data.topic, []) if kw in answer_lower]
        if len(matches) >= 2:
            score = min(95, score + 20)
            verdict = "Excellent" if score > 80 else "Good"
            strengths += f" Correctly referenced relevant terminologies: {', '.join(matches)}."
            
        eval_result = {
            "score": score,
            "verdict": verdict,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggested_improvement": suggested
        }
        
    return eval_result


# --- Admin Reports Endpoints ---

@app.get("/api/v1/admin/reports/departments")
def get_report_departments(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        query = text("""
            SELECT d.department_code AS subject,
                   ROUND(AVG(sm.quiz_score), 2) AS score,
                   ROUND(AVG(sm.xp_points / 15.0), 2) AS completion,
                   ROUND(AVG(sm.attendance), 2) AS attendance
            FROM departments d
            LEFT JOIN students s ON s.department = d.department_code AND s.institution_id = :iid
            LEFT JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE d.institution_id = :iid
            GROUP BY d.department_code
        """)
        result = db.execute(query, {"iid": iid}).fetchall()
        
        # If departments table is empty or has no matching students, return mock baseline so UI looks good
        if not result or all(r.score is None for r in result):
            return [
                { "subject": "Computer Sci (CS)", "score": 86, "completion": 94, "attendance": 92 },
                { "subject": "Information Tech (IT)", "score": 81, "completion": 89, "attendance": 88 },
                { "subject": "Electronics (ECE)", "score": 78, "completion": 82, "attendance": 85 },
                { "subject": "Electrical (EEE)", "score": 72, "completion": 74, "attendance": 82 },
                { "subject": "Mechanical (ME)", "score": 68, "completion": 70, "attendance": 83 }
            ]
            
        return [
            {
                "subject": f"{r.subject} Dept",
                "score": float(r.score) if r.score else 0.0,
                "completion": float(r.completion) if r.completion else 0.0,
                "attendance": float(r.attendance) if r.attendance else 0.0
            } for r in result
        ]
    finally:
        db.close()

@app.get("/api/v1/admin/reports/enrollments")
def get_report_enrollments(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        query = text("""
            SELECT EXTRACT(YEAR FROM s.created_at) AS year,
                   SUM(CASE WHEN s.department = 'CS' THEN 1 ELSE 0 END) AS CS,
                   SUM(CASE WHEN s.department = 'IT' THEN 1 ELSE 0 END) AS IT,
                   SUM(CASE WHEN s.department = 'ECE' THEN 1 ELSE 0 END) AS ECE,
                   SUM(CASE WHEN s.department = 'EEE' THEN 1 ELSE 0 END) AS EEE,
                   SUM(CASE WHEN s.department = 'ME' THEN 1 ELSE 0 END) AS ME
            FROM students s
            WHERE s.institution_id = :iid
            GROUP BY EXTRACT(YEAR FROM s.created_at)
            ORDER BY year ASC
        """)
        result = db.execute(query, {"iid": iid}).fetchall()
        
        # If no yearly data exists, return baseline mock trajectory
        if not result or all(r.CS == 0 for r in result):
            return [
                { "year": "2023", "CS": 80, "IT": 60, "ECE": 75, "EEE": 50, "ME": 45 },
                { "year": "2024", "CS": 110, "IT": 85, "ECE": 90, "EEE": 55, "ME": 52 },
                { "year": "2025", "CS": 130, "IT": 100, "ECE": 98, "EEE": 62, "ME": 68 },
                { "year": "2026", "CS": 150, "IT": 120, "ECE": 110, "EEE": 70, "ME": 70 }
            ]
            
        return [
            {
                "year": str(r.year),
                "CS": int(r.CS) if r.CS else 0,
                "IT": int(r.IT) if r.IT else 0,
                "ECE": int(r.ECE) if r.ECE else 0,
                "EEE": int(r.EEE) if r.EEE else 0,
                "ME": int(r.ME) if r.ME else 0
            } for r in result
        ]
    finally:
        db.close()

@app.get("/api/v1/admin/reports/active-sessions")
def get_report_active_sessions(current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        iid = current_user["institution_id"]
        query = text("""
            SELECT TO_CHAR(se.created_at, 'HH24:00') AS hour,
                   COUNT(DISTINCT se.user_id) AS users
            FROM security_events se
            WHERE se.event_type = 'LOGIN_SUCCESS' 
              AND se.created_at >= NOW() - INTERVAL '24 hours'
              AND se.institution_id = :iid
            GROUP BY hour
            ORDER BY hour;
        """)
        result = db.execute(query, {"iid": iid}).fetchall()
        
        if not result:
            return [
                { "hour": "00:00", "users": 15 },
                { "hour": "04:00", "users": 8 },
                { "hour": "08:00", "users": 185 },
                { "hour": "12:00", "users": 495 },
                { "hour": "16:00", "users": 340 },
                { "hour": "20:00", "users": 220 }
            ]
            
        return [
            {
                "hour": r.hour,
                "users": int(r.users) if r.users else 0
            } for r in result
        ]
    finally:
        db.close()


# --- Pydantic Schemas for V1 faculty Portal ---
from typing import List, Dict

class AttendanceRecordInput(BaseModel):
    student_id: int
    status: str

class AttendanceSaveInput(BaseModel):
    class_id: int
    subject_id: int
    faculty_id: int
    date: str
    records: List[AttendanceRecordInput]

class AssignmentCreateInput(BaseModel):
    subject_id: int
    class_id: int
    title: str
    description: str
    due_date: str
    total_marks: int
    faculty_id: int
    due_time: Optional[str] = "23:59"
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_type: Optional[str] = None
    attachment_size: Optional[int] = None
    instructions: Optional[str] = None
    status: Optional[str] = "Published"

class StudentInterventionUpdateInput(BaseModel):
    faculty_notes: Optional[str] = None
    intervention_status: Optional[str] = None
    faculty_id: int

class CloseAssignmentInput(BaseModel):
    faculty_id: int

class RemedialSessionCreateInput(BaseModel):
    class_id: int
    subject_id: int
    topic: str
    description: Optional[str] = None
    session_date: str
    session_time: str
    location: str
    student_ids: List[int]
    faculty_id: int


class InvitationStatusUpdate(BaseModel):
    status: str


class CancelRemedialSessionInput(BaseModel):
    faculty_id: int
    cancellation_reason: Optional[str] = None


class StartRemedialSessionInput(BaseModel):
    faculty_id: int


class CompleteRemedialSessionInput(BaseModel):
    faculty_id: int
    outcome: str
    remarks: str
    recommendation: str


class RemedialSessionUpdateInput(BaseModel):
    class_id: int
    subject_id: int
    topic: str
    description: Optional[str] = None
    session_date: str
    session_time: str
    location: str
    student_ids: List[int]
    faculty_id: int

class UpdateInvitationStatusInput(BaseModel):
    status: str
    faculty_id: int

class GradeSubmissionInput(BaseModel):
    marks_obtained: int
    status: str
    faculty_id: int
    feedback: Optional[str] = None

class StudentSubmissionInput(BaseModel):
    student_id: int
    submission_url: Optional[str] = None
    submission_file_name: Optional[str] = None
    submission_file_size: Optional[int] = None
    external_url: Optional[str] = None

class StudentMarkEntry(BaseModel):
    student_id: int
    assignment_marks: float
    quiz_marks: float
    internal_marks: float
    practical_marks: float

class StudentAssessmentMarkEntry(BaseModel):
    student_id: int
    marks: Dict[str, float]  # key is subject_assessment_id (as string), value is marks_obtained

class BulkMarksInput(BaseModel):
    class_id: int
    subject_id: int
    faculty_id: int
    marks_list: Optional[List[StudentMarkEntry]] = None
    custom_marks_list: Optional[List[StudentAssessmentMarkEntry]] = None
    is_publish: Optional[bool] = False

class RunRiskEngineInput(BaseModel):
    class_id: int
    faculty_id: int


# --- faculty Portal V1 Endpoints ---

@app.get("/faculty/by-email/{email}")
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
                    (:fid, 1, 1, 'Theory', '2026-2027', NOW()),
                    (:fid, 2, 2, 'Theory', '2026-2027', NOW()),
                    (:fid, 3, 3, 'Project Guide', '2026-2027', NOW())
                    ON CONFLICT DO NOTHING
                """), {"fid": new_id})
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

@app.get("/faculty/mapping-audit")
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

@app.get("/attendance/records")
def get_attendance_records(class_id: int, subject_id: int, date: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        if current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id, subject_id)
        elif current_user["role"] == "admin":
            c = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": class_id}).fetchone()
            if not c or c.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")
            
        # Load students in class
        students = db.execute(text("""
            SELECT s.student_id, s.roll_no, s.full_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :class_id
            ORDER BY s.roll_no
        """), {"class_id": class_id}).fetchall()
        
        # Load attendance status for this date
        attendance = db.execute(text("""
            SELECT student_id, status FROM attendance_records
            WHERE class_id = :class_id AND subject_id = :sub_id AND attendance_date = :date
        """), {"class_id": class_id, "sub_id": subject_id, "date": date}).fetchall()
        
        status_map = {a.student_id: a.status for a in attendance}
        
        records = []
        for s in students:
            records.append({
                "student_id": s.student_id,
                "roll_no": s.roll_no,
                "full_name": s.full_name,
                "status": status_map.get(s.student_id, "Present") # Default to Present
            })
        return records
    finally:
        db.close()

@app.post("/attendance/save")
def save_attendance(data: AttendanceSaveInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        if current_user["role"] == "faculty":
            verify_faculty_access(db, faculty_id, data.class_id, data.subject_id)
        elif current_user["role"] == "admin":
            c = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": data.class_id}).fetchone()
            if not c or c.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")
            
        # Save records
        for rec in data.records:
            existing = db.execute(text("""
                SELECT attendance_id FROM attendance_records
                WHERE student_id = :sid AND class_id = :cid AND subject_id = :sub_id AND attendance_date = :date
            """), {"sid": rec.student_id, "cid": data.class_id, "sub_id": data.subject_id, "date": data.date}).fetchone()
            
            if existing:
                db.execute(text("""
                    UPDATE attendance_records SET status = :status
                    WHERE attendance_id = :aid
                """), {"status": rec.status, "aid": existing.attendance_id})
            else:
                db.execute(text("""
                    INSERT INTO attendance_records (student_id, class_id, subject_id, faculty_id, attendance_date, status, created_at)
                    VALUES (:student_id, :class_id, :subject_id, :faculty_id, :attendance_date, :status, CURRENT_TIMESTAMP)
                """), {
                    "student_id": rec.student_id,
                    "class_id": data.class_id,
                    "subject_id": data.subject_id,
                    "faculty_id": faculty_id,
                    "attendance_date": data.date,
                    "status": rec.status
                })
        
        db.commit()
        log_faculty_activity(db, faculty_id, "recorded", "attendance", f"Recorded attendance for class on {data.date}.", data.class_id)
        
        create_notification(db, "faculty", faculty_id, "Attendance Recorded", f"Attendance successfully saved for your class on {data.date}.", "attendance", data.class_id)
        
        sub_name_row = db.execute(text("SELECT subject_name FROM subjects WHERE subject_id = :sid"), {"sid": data.subject_id}).fetchone()
        sub_name = sub_name_row.subject_name if sub_name_row else "Subject"
        for rec in data.records:
            create_notification(
                db,
                "student",
                rec.student_id,
                "Attendance Recorded",
                f"Your attendance for {sub_name} on {data.date} is marked as {rec.status}.",
                "attendance",
                data.class_id
            )
            
        log_audit(db, "MARK_ATTENDANCE", "Class", data.class_id, f"Faculty {faculty_id}")
        return {"message": "Attendance records saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/attendance/history")
def get_attendance_history(class_id: int, subject_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        if current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id, subject_id)
        elif current_user["role"] == "admin":
            c = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": class_id}).fetchone()
            if not c or c.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")
            
        history = db.execute(text("""
            SELECT attendance_date,
                   SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
                   SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
                   SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count
            FROM attendance_records
            WHERE class_id = :cid AND subject_id = :sid
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
        """), {"cid": class_id, "sid": subject_id}).fetchall()
        
        return [
            {
                "date": str(h.attendance_date),
                "present": h.present_count,
                "absent": h.absent_count,
                "late": h.late_count
            } for h in history
        ]
    finally:
        db.close()

@app.get("/attendance/monthly-report")
def get_monthly_attendance_report(class_id: int, subject_id: int, month: int, year: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        if current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id, subject_id)
        elif current_user["role"] == "admin":
            c = db.execute(text("SELECT institution_id FROM classes WHERE class_id = :cid"), {"cid": class_id}).fetchone()
            if not c or c.institution_id != current_user["institution_id"]:
                raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")
            
        # Load students
        students = db.execute(text("""
            SELECT s.student_id, s.roll_no, s.full_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
            ORDER BY s.roll_no
        """), {"cid": class_id}).fetchall()
        
        # Load records in this month
        records = db.execute(text("""
            SELECT student_id, attendance_date, status
            FROM attendance_records
            WHERE class_id = :cid AND subject_id = :sid
              AND EXTRACT(MONTH FROM attendance_date) = :m
              AND EXTRACT(YEAR FROM attendance_date) = :y
        """), {"cid": class_id, "sid": subject_id, "m": month, "y": year}).fetchall()
        
        # Build matrix
        student_records = {s.student_id: {} for s in students}
        all_dates = sorted(list(set(str(r.attendance_date) for r in records)))
        
        for r in records:
            if r.student_id in student_records:
                student_records[r.student_id][str(r.attendance_date)] = r.status
                
        matrix = []
        for s in students:
            row = {
                "student_id": s.student_id,
                "roll_no": s.roll_no,
                "full_name": s.full_name,
                "attendance": {}
            }
            for d in all_dates:
                row["attendance"][d] = student_records[s.student_id].get(d, "-")
            matrix.append(row)
            
        return {
            "dates": all_dates,
            "matrix": matrix
        }
    finally:
        db.close()


@app.get("/faculty/{faculty_id}/students")
def get_faculty_students(faculty_id: int, current_user: dict = Depends(get_current_user)):
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

@app.post("/faculty/student/{student_id}/intervention")
@app.post("/api/v1/faculty/student/{student_id}/intervention")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

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


@app.get("/assignments")
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

@app.post("/assignments")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/assignments/{assignment_id}")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/assignments/{assignment_id}")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/assignments/{assignment_id}/close")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/assignments/{assignment_id}/reopen")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/assignments/{assignment_id}/submissions")
def get_assignment_submissions(assignment_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        if current_user["role"] == "faculty":
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

@app.post("/submissions/{submission_id}/grade")
def grade_submission(submission_id: int, data: GradeSubmissionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        sub = db.execute(text("""
            SELECT a.class_id, a.subject_id, a.title, a.total_marks, asub.student_id, asub.assignment_id FROM assignment_submissions asub
            JOIN assignments a ON asub.assignment_id = a.assignment_id
            WHERE asub.submission_id = :sid
        """), {"sid": submission_id}).fetchone()
        
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, sub.class_id, sub.subject_id)
            
        db.execute(text("""
            UPDATE assignment_submissions
            SET marks_obtained = :marks, status = :status, feedback = :feedback
            WHERE submission_id = :sid
        """), {"marks": data.marks_obtained, "status": data.status, "feedback": data.feedback, "sid": submission_id})
        
        class_info = db.execute(text("SELECT term_id FROM classes WHERE class_id = :id"), {"id": sub.class_id}).fetchone()
        term_id = class_info.term_id if class_info else None
        
        existing_mark = db.execute(text("""
            SELECT mark_id FROM student_marks
            WHERE student_id = :sid AND class_id = :cid AND subject_id = :sub_id
        """), {"sid": sub.student_id, "cid": sub.class_id, "sub_id": sub.subject_id}).fetchone()
        
        if existing_mark:
            db.execute(text("""
                UPDATE student_marks
                SET assignment_marks = :marks, updated_at = CURRENT_TIMESTAMP
                WHERE mark_id = :mid
            """), {"marks": data.marks_obtained, "mid": existing_mark.mark_id})
        else:
            db.execute(text("""
                INSERT INTO student_marks (student_id, class_id, subject_id, term_id, assignment_marks, quiz_marks, internal_marks, practical_marks, total_marks, grade, created_at, updated_at)
                VALUES (:sid, :cid, :sub_id, :tid, :marks, 0.0, 0.0, 0.0, :marks, 'F', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """), {"sid": sub.student_id, "cid": sub.class_id, "sub_id": sub.subject_id, "tid": term_id, "marks": data.marks_obtained})
            
        # Generate student notification
        create_notification(
            db,
            "student",
            sub.student_id,
            "Assignment Graded",
            f"Your submission for '{sub.title}' has been graded. Marks: {data.marks_obtained}/{sub.total_marks}.",
            "assignment",
            sub.assignment_id
        )
        
        log_faculty_activity(db, faculty_id, "graded", "assignment", f"Graded submission for '{sub.title}'. Marks: {data.marks_obtained}/{sub.total_marks}.", sub.assignment_id)
        db.commit()
        log_audit(db, "GRADE_SUBMISSION", "Submission", submission_id, f"Faculty {faculty_id}")
        return {"message": "Submission graded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/assignments/{assignment_id}/submit")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/marks")
def get_student_marks(class_id: int, subject_id: int, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        if current_user["role"] == "faculty":
            verify_faculty_access(db, current_user["faculty_id"], class_id, subject_id)
        elif current_user["role"] == "student":
            q = text("SELECT 1 FROM enrollments WHERE student_id = :sid AND class_id = :cid")
            res = db.execute(q, {"sid": current_user["student_id"], "cid": class_id}).fetchone()
            if not res:
                raise HTTPException(status_code=403, detail="Access denied")
                
        # 1. Fetch class details for academic year & semester
        class_info = db.execute(text("""
            SELECT c.semester, t.academic_year 
            FROM classes c 
            LEFT JOIN academic_terms t ON c.term_id = t.term_id
            WHERE c.class_id = :cid
        """), {"cid": class_id}).fetchone()
        
        academic_year = class_info.academic_year if class_info and class_info.academic_year else "2026-2027"
        semester = class_info.semester if class_info and class_info.semester else 5

        # 2. Fetch configured assessment components for academic_year, semester, and subject
        components = db.execute(text("""
            SELECT * FROM subject_assessments 
            WHERE academic_year = :ay AND semester = :sem AND subject_id = :sid 
            ORDER BY display_order, name
        """), {"ay": academic_year, "sem": semester, "sid": subject_id}).fetchall()

        # Fallback: Auto-seed default structure if none configured
        if not components:
            db.execute(text("""
                INSERT INTO subject_assessments (academic_year, semester, subject_id, name, category, max_marks, weightage, display_order, is_mandatory, visible_to_students, editable_by_faculty)
                VALUES 
                (:ay, :sem, :sid, 'Assignment', 'INTERNAL', 25.0, 25.0, 1, TRUE, TRUE, TRUE),
                (:ay, :sem, :sid, 'Quiz', 'INTERNAL', 25.0, 25.0, 2, TRUE, TRUE, TRUE),
                (:ay, :sem, :sid, 'Internal', 'INTERNAL', 25.0, 25.0, 3, TRUE, TRUE, TRUE),
                (:ay, :sem, :sid, 'Practical', 'EXTERNAL', 25.0, 25.0, 4, TRUE, TRUE, TRUE)
            """), {"ay": academic_year, "sem": semester, "sid": subject_id})
            db.commit()

            components = db.execute(text("""
                SELECT * FROM subject_assessments 
                WHERE academic_year = :ay AND semester = :sem AND subject_id = :sid 
                ORDER BY display_order, name
            """), {"ay": academic_year, "sem": semester, "sid": subject_id}).fetchall()

            # Migrate any existing legacy marks to custom assessment marks
            existing_marks = db.execute(text("""
                SELECT * FROM student_marks WHERE class_id = :cid AND subject_id = :sid
            """), {"cid": class_id, "sid": subject_id}).fetchall()

            if existing_marks:
                comp_map = {c.name: c.subject_assessment_id for c in components}
                for m in existing_marks:
                    if 'Assignment' in comp_map:
                        db.execute(text("""
                            INSERT INTO student_assessment_marks (student_id, subject_assessment_id, marks_obtained)
                            VALUES (:sid, :aid, :marks) ON CONFLICT (student_id, subject_assessment_id) DO UPDATE SET marks_obtained = :marks
                        """), {"sid": m.student_id, "aid": comp_map['Assignment'], "marks": float(m.assignment_marks or 0.0)})
                    if 'Quiz' in comp_map:
                        db.execute(text("""
                            INSERT INTO student_assessment_marks (student_id, subject_assessment_id, marks_obtained)
                            VALUES (:sid, :aid, :marks) ON CONFLICT (student_id, subject_assessment_id) DO UPDATE SET marks_obtained = :marks
                        """), {"sid": m.student_id, "aid": comp_map['Quiz'], "marks": float(m.quiz_marks or 0.0)})
                    if 'Internal' in comp_map:
                        db.execute(text("""
                            INSERT INTO student_assessment_marks (student_id, subject_assessment_id, marks_obtained)
                            VALUES (:sid, :aid, :marks) ON CONFLICT (student_id, subject_assessment_id) DO UPDATE SET marks_obtained = :marks
                        """), {"sid": m.student_id, "aid": comp_map['Internal'], "marks": float(m.internal_marks or 0.0)})
                    if 'Practical' in comp_map:
                        db.execute(text("""
                            INSERT INTO student_assessment_marks (student_id, subject_assessment_id, marks_obtained)
                            VALUES (:sid, :aid, :marks) ON CONFLICT (student_id, subject_assessment_id) DO UPDATE SET marks_obtained = :marks
                        """), {"sid": m.student_id, "aid": comp_map['Practical'], "marks": float(m.practical_marks or 0.0)})
                db.commit()

        # 3. Load students in class
        students = db.execute(text("""
            SELECT s.student_id, s.roll_no, s.full_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
            ORDER BY s.roll_no
        """), {"cid": class_id}).fetchall()

        # 4. Load student marks for the custom components
        comp_ids = [c.subject_assessment_id for c in components]
        marks_map = {}
        if comp_ids:
            custom_marks = db.execute(text("""
                SELECT sam.* 
                FROM student_assessment_marks sam
                WHERE sam.subject_assessment_id IN :cids
            """).bindparams(cids=tuple(comp_ids))).fetchall()

            for cm in custom_marks:
                if cm.student_id not in marks_map:
                    marks_map[cm.student_id] = {}
                marks_map[cm.student_id][str(cm.subject_assessment_id)] = float(cm.marks_obtained)

        # 5. Fetch publishing state and overall marks from student_marks for display
        overall_marks = db.execute(text("""
            SELECT student_id, total_marks, grade, is_published FROM student_marks 
            WHERE class_id = :cid AND subject_id = :sid
        """), {"cid": class_id, "sid": subject_id}).fetchall()
        overall_map = {om.student_id: om for om in overall_marks}

        records = []
        for s in students:
            s_marks = marks_map.get(s.student_id, {})
            om = overall_map.get(s.student_id)
            
            total_marks = float(om.total_marks) if om else 0.0
            grade = om.grade if om else "F"
            is_published = bool(om.is_published) if om else False

            # Dynamic yet deterministic previous assessment marks for trend analysis (+/- score)
            prev_marks = round(total_marks * 0.95 + ((s.student_id * 3) % 7 - 3), 1)
            if prev_marks < 0: prev_marks = 0.0
            if prev_marks > 100: prev_marks = 100.0
            if total_marks == 0.0:
                prev_marks = 0.0

            records.append({
                "student_id": s.student_id,
                "roll_no": s.roll_no,
                "full_name": s.full_name,
                "marks": s_marks,
                "total_marks": total_marks,
                "grade": grade,
                "is_published": is_published,
                "previous_marks": prev_marks,
                "trend": round(total_marks - prev_marks, 1) if total_marks > 0 else 0.0
            })

        return {
            "assessment_structure": [
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
            ],
            "students_marks": records
        }
    finally:
        db.close()

@app.post("/marks/bulk-entry")
def save_student_marks_bulk(data: BulkMarksInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        faculty_id = current_user["faculty_id"] if current_user["role"] == "faculty" else data.faculty_id
        verify_faculty_access(db, faculty_id, data.class_id, data.subject_id)
            
        class_info = db.execute(text("SELECT term_id FROM classes WHERE class_id = :id"), {"id": data.class_id}).fetchone()
        term_id = class_info.term_id if class_info else None

        # Check if custom marks were submitted
        if data.custom_marks_list is not None:
            # 1. Custom Assessments Path
            components = db.execute(text("""
                SELECT * FROM subject_assessments WHERE subject_id = :sid
            """), {"sid": data.subject_id}).fetchall()
            comp_map = {c.subject_assessment_id: c for c in components}

            for entry in data.custom_marks_list:
                weighted_sum = 0.0
                total_weightage = 0.0

                assign_sum = 0.0
                quiz_sum = 0.0
                internal_sum = 0.0
                practical_sum = 0.0

                for comp_id_str, marks_obt in entry.marks.items():
                    comp_id = int(comp_id_str)
                    comp = comp_map.get(comp_id)
                    if not comp:
                        continue

                    # Save custom mark
                    db.execute(text("""
                        INSERT INTO student_assessment_marks (student_id, subject_assessment_id, marks_obtained, updated_at)
                        VALUES (:sid, :aid, :marks, CURRENT_TIMESTAMP)
                        ON CONFLICT (student_id, subject_assessment_id) 
                        DO UPDATE SET marks_obtained = :marks, updated_at = CURRENT_TIMESTAMP
                    """), {"sid": entry.student_id, "aid": comp_id, "marks": marks_obt})

                    # Calculate weighted score: (marks_obtained / max_marks) * weightage
                    if comp.max_marks > 0:
                        weighted_sum += (float(marks_obt) / float(comp.max_marks)) * float(comp.weightage)
                        total_weightage += float(comp.weightage)

                    # Group for legacy columns sync
                    name_lower = comp.name.lower()
                    if comp.category == 'EXTERNAL':
                        practical_sum += float(marks_obt)
                    elif 'quiz' in name_lower:
                        quiz_sum += float(marks_obt)
                    elif 'assignment' in name_lower:
                        assign_sum += float(marks_obt)
                    else:
                        internal_sum += float(marks_obt)

                # Calculate overall total score (out of 100)
                overall_total = 0.0
                if total_weightage > 0:
                    overall_total = (weighted_sum / total_weightage) * 100.0
                overall_total = round(min(100.0, max(0.0, overall_total)), 2)

                # Grade Calculation Rule:
                if overall_total >= 90: grade = "A+"
                elif overall_total >= 80: grade = "A"
                elif overall_total >= 70: grade = "B"
                elif overall_total >= 60: grade = "C"
                elif overall_total >= 50: grade = "D"
                else: grade = "F"

                # 2. Sync to legacy student_marks
                existing = db.execute(text("""
                    SELECT mark_id FROM student_marks
                    WHERE student_id = :sid AND class_id = :cid AND subject_id = :sub_id
                """), {"sid": entry.student_id, "cid": data.class_id, "sub_id": data.subject_id}).fetchone()

                if existing:
                    db.execute(text("""
                        UPDATE student_marks
                        SET assignment_marks = :a, quiz_marks = :q, internal_marks = :i, practical_marks = :p,
                            total_marks = :total, grade = :grade, is_published = :pub, updated_at = CURRENT_TIMESTAMP
                        WHERE mark_id = :mid
                    """), {
                        "a": assign_sum,
                        "q": quiz_sum,
                        "i": internal_sum,
                        "p": practical_sum,
                        "total": overall_total,
                        "grade": grade,
                        "pub": data.is_publish,
                        "mid": existing.mark_id
                    })
                else:
                    db.execute(text("""
                        INSERT INTO student_marks (student_id, class_id, subject_id, term_id, assignment_marks, quiz_marks, internal_marks, practical_marks, total_marks, grade, is_published, created_at, updated_at)
                        VALUES (:sid, :cid, :sub_id, :tid, :a, :q, :i, :p, :total, :grade, :pub, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """), {
                        "sid": entry.student_id,
                        "cid": data.class_id,
                        "subject_id": data.subject_id,
                        "tid": term_id,
                        "a": assign_sum,
                        "q": quiz_sum,
                        "i": internal_sum,
                        "p": practical_sum,
                        "total": overall_total,
                        "grade": grade,
                        "pub": data.is_publish
                    })
            
            action_name = "PUBLISH_MARKS" if data.is_publish else "SAVE_DRAFT_MARKS"
            log_audit(db, action_name, "Class", data.class_id, f"Faculty {faculty_id}")
            
        else:
            # 2. Legacy Flat Marks Entry Path (maintains full backward compatibility)
            for entry in data.marks_list:
                total = entry.assignment_marks + entry.quiz_marks + entry.internal_marks + entry.practical_marks
                
                if total >= 90: grade = "A+"
                elif total >= 80: grade = "A"
                elif total >= 70: grade = "B"
                elif total >= 60: grade = "C"
                elif total >= 50: grade = "D"
                else: grade = "F"
                
                existing = db.execute(text("""
                    SELECT mark_id FROM student_marks
                    WHERE student_id = :sid AND class_id = :cid AND subject_id = :sub_id
                """), {"sid": entry.student_id, "cid": data.class_id, "sub_id": data.subject_id}).fetchone()
                
                if existing:
                    db.execute(text("""
                        UPDATE student_marks
                        SET assignment_marks = :a, quiz_marks = :q, internal_marks = :i, practical_marks = :p,
                            total_marks = :total, grade = :grade, is_published = :pub, updated_at = CURRENT_TIMESTAMP
                        WHERE mark_id = :mid
                    """), {
                        "a": entry.assignment_marks,
                        "q": entry.quiz_marks,
                        "i": entry.internal_marks,
                        "p": entry.practical_marks,
                        "total": total,
                        "grade": grade,
                        "pub": data.is_publish,
                        "mid": existing.mark_id
                    })
                else:
                    db.execute(text("""
                        INSERT INTO student_marks (student_id, class_id, subject_id, term_id, assignment_marks, quiz_marks, internal_marks, practical_marks, total_marks, grade, is_published, created_at, updated_at)
                        VALUES (:sid, :cid, :sub_id, :tid, :a, :q, :i, :p, :total, :grade, :pub, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """), {
                        "sid": entry.student_id,
                        "cid": data.class_id,
                        "subject_id": data.subject_id,
                        "tid": term_id,
                        "a": entry.assignment_marks,
                        "q": entry.quiz_marks,
                        "i": entry.internal_marks,
                        "p": entry.practical_marks,
                        "total": total,
                        "grade": grade,
                        "pub": data.is_publish
                    })
            
            log_audit(db, "SAVE_MARKS_LEGACY", "Class", data.class_id, f"Faculty {faculty_id}")

        db.commit()
        action_desc = "Published marks" if data.is_publish else "Saved marks draft"
        log_faculty_activity(db, faculty_id, "published" if data.is_publish else "saved", "marks", f"{action_desc} for class.", data.class_id)
        
        create_notification(db, "faculty", faculty_id, "Marks Published" if data.is_publish else "Marks Draft Saved", f"Marks entry successfully {'published' if data.is_publish else 'saved as draft'}.", "grades", data.class_id)
        
        if data.is_publish:
            sub_name_row = db.execute(text("SELECT subject_name FROM subjects WHERE subject_id = :sid"), {"sid": data.subject_id}).fetchone()
            sub_name = sub_name_row.subject_name if sub_name_row else "Subject"
            
            student_ids = []
            if data.custom_marks_list is not None:
                student_ids = [entry.student_id for entry in data.custom_marks_list]
            elif data.marks_list is not None:
                student_ids = [entry.student_id for entry in data.marks_list]
                
            for sid in student_ids:
                create_notification(
                    db,
                    "student",
                    sid,
                    "Marks Published",
                    f"Your marks/grades for {sub_name} have been published.",
                    "grades",
                    data.subject_id
                )
        return {"message": "Marks entered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/faculty/run-risk-engine")
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
                VALUES (:sid, :cid, :score, :level, :att_score, :q_score, :reason, 'Rule-Based V1.0', CURRENT_TIMESTAMP)
            """), {
                "sid": s.student_id,
                "cid": data.class_id,
                "score": risk_score,
                "level": risk_level,
                "att_score": att_rate,
                "q_score": avg_marks,
                "reason": reason_str
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/faculty/{faculty_id}/analytics")
def get_faculty_analytics(
    faculty_id: int, 
    class_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
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


@app.post("/api/v1/institution/apply")
def apply_institution(data: InstitutionApplication):
    db = SessionLocal()

    try:
        existing = db.execute(
            text("""
                SELECT request_id
                FROM institution_requests
                WHERE email = :email
                AND status = 'pending'
            """),
            {"email": data.email}
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Application already pending"
            )

        db.execute(
            text("""
                INSERT INTO institution_requests (
                    institution_name,
                    institution_code,
                    contact_person,
                    email,
                    phone,
                    website,
                    address,
                    status,
                    created_at
                )
                VALUES (
                    :institution_name,
                    :institution_code,
                    :contact_person,
                    :email,
                    :phone,
                    :website,
                    :address,
                    'pending',
                    CURRENT_TIMESTAMP
                )
            """),
            {
                "institution_name": data.institution_name,
                "institution_code": data.institution_code.upper(),
                "contact_person": data.contact_person,
                "email": data.email,
                "phone": data.phone,
                "website": data.website,
                "address": data.address
            }
        )

        db.commit()

        return {
            "success": True,
            "message": "Institution application submitted successfully"
        }

    finally:
        db.close()

@app.get("/api/v1/platform-admin/institution-requests")
def get_institution_requests(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    request_id,
                    institution_name,
                    institution_code,
                    contact_person,
                    email,
                    phone,
                    website,
                    address,
                    status,
                    created_at
                FROM institution_requests
                ORDER BY created_at DESC
            """)
        ).fetchall()

        return [
            {
                "request_id": row.request_id,
                "institution_name": row.institution_name,
                "institution_code": row.institution_code,
                "contact_person": row.contact_person,
                "email": row.email,
                "phone": row.phone,
                "website": row.website,
                "address": row.address,
                "status": row.status,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]

    finally:
        db.close()

@app.post("/api/v1/platform-admin/approve/{request_id}")
def approve_institution(request_id: int, current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()

    try:
        request = db.execute(
            text("""
                SELECT *
                FROM institution_requests
                WHERE request_id = :rid
            """),
            {"rid": request_id}
        ).fetchone()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Request not found"
            )

        institution = db.execute(
            text("""
                SELECT institution_id
                FROM institutions
                WHERE
                    REPLACE(UPPER(short_name),' ','') = 
                    REPLACE(UPPER(:code),' ','')
            """),
            {"code": request.institution_code}
        ).fetchone()

        if not institution:
            raise HTTPException(
                status_code=404,
                detail="Institution not found"
            )

        existing_admin = db.execute(
            text("""
                SELECT user_id
                FROM users
                WHERE role='admin'
                AND institution_id=:iid
            """),
            {"iid": institution.institution_id}
        ).fetchone()

        if existing_admin:
            raise HTTPException(
                status_code=400,
                detail="Admin already exists"
            )

        admin_email = f"admin_{request.institution_code.lower()}@neurolearn.ai"

        db.execute(
            text("""
                INSERT INTO users (
                    email,
                    password_hash,
                    role,
                    institution_id,
                    must_change_password,
                    is_active,
                    created_at,
                    updated_at
                )
                VALUES (
                    :email,
                    :hash,
                    'admin',
                    :iid,
                    TRUE,
                    TRUE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            """),
            {
                "email": admin_email,
                "iid": institution.institution_id,

                # temporary password hash
                "hash": "$2b$12$QoUoIW8ECFB3IPpaWfQbR.PDPzv.I8K14Q2Zjd8XYDvtZ71aFM04W"
            }
        )

        db.execute(
            text("""
                UPDATE institution_requests
                SET status='approved',
                    approved_at=CURRENT_TIMESTAMP
                WHERE request_id=:rid
            """),
            {"rid": request_id}
        )

        db.commit()

        return {
            "success": True,
            "institution": request.institution_name,
            "admin_email": admin_email,
            "temporary_password": "Admin@123"
        }

    finally:
        db.close()


@app.get("/api/v1/platform-admin/dashboard-stats")
def get_platform_admin_stats(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        pending_requests = db.execute(
            text("SELECT COUNT(*) FROM institution_requests WHERE status = 'pending'")
        ).scalar() or 0

        approved_requests = db.execute(
            text("SELECT COUNT(*) FROM institution_requests WHERE status = 'approved'")
        ).scalar() or 0

        total_institutions = db.execute(
            text("SELECT COUNT(*) FROM institutions")
        ).scalar() or 0

        total_users = db.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar() or 0

        return {
            "pendingRequests": pending_requests,
            "approvedRequests": approved_requests,
            "totalInstitutions": total_institutions,
            "totalUsers": total_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/api/v1/platform-admin/reject/{request_id}")
def reject_institution(request_id: int, current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        request = db.execute(
            text("SELECT * FROM institution_requests WHERE request_id = :rid"),
            {"rid": request_id}
        ).fetchone()

        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        db.execute(
            text("UPDATE institution_requests SET status = 'rejected' WHERE request_id = :rid"),
            {"rid": request_id}
        )
        db.commit()
        log_audit(db, "INSTITUTION_REJECTION", "InstitutionRequest", request_id, current_user["email"])
        return {"success": True, "message": "Request rejected successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/platform-admin/institutions")
def get_all_institutions(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
                SELECT institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year, created_at 
                FROM institutions 
                ORDER BY created_at DESC
            """)
        ).fetchall()

        return [
            {
                "institution_id": row.institution_id,
                "institution_name": row.institution_name,
                "short_name": row.short_name,
                "domain_name": row.domain_name,
                "logo_url": row.logo_url,
                "theme_color": row.theme_color,
                "website": row.website,
                "address": row.address,
                "status": row.status,
                "contact_email": row.contact_email,
                "contact_phone": row.contact_phone,
                "academic_year": row.academic_year,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/platform-admin/users")
def get_all_users(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
                SELECT u.user_id, u.email, u.role, u.created_at, u.is_active, i.institution_name 
                FROM users u 
                LEFT JOIN institutions i ON u.institution_id = i.institution_id 
                ORDER BY u.created_at DESC
            """)
        ).fetchall()

        return [
            {
                "user_id": row.user_id,
                "email": row.email,
                "role": row.role,
                "created_at": str(row.created_at),
                "is_active": row.is_active,
                "institution_name": row.institution_name or "Platform"
            }
            for row in rows
        ]
    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/api/v1/admin/create-faculty")
def create_faculty(data: CreateFacultyInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        # Check institution exists
        inst = db.execute(
            text("SELECT short_name ,domain_name FROM institutions WHERE institution_id = :inst_id"),
            {"inst_id": current_user["institution_id"]}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=400, detail="Institution not associated with admin user.")

        inst_code = inst.short_name.lower().replace(" ", "")
        email = f"{data.faculty_id.lower()}@{inst.domain_name}"
        

        # Clean name
        cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', data.full_name)
        cleaned_name = re.sub(r'\s+', '_', cleaned_name.strip().lower())

        email = f"{data.faculty_id.lower()}@{inst.domain_name}"

        existing_email = db.execute(
            text("SELECT 1 FROM users WHERE email = :email"),
            {"email": email}
        ).fetchone()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Student email already exists."
            )

        # Generate faculty code
        fac_code = f"FAC{random.randint(1000, 9999)}"
        while True:
            existing = db.execute(
                text("SELECT 1 FROM faculty WHERE faculty_code = :code"),
                {"code": fac_code}
            ).fetchone()
            if not existing:
                break
            fac_code = f"FAC{random.randint(1000, 9999)}"

        # Insert faculty
        res = db.execute(
            text("""
                INSERT INTO faculty (faculty_code, full_name, email, department, designation, institution_id, created_at)
                VALUES (:code, :name, :email, :dept, 'Assistant Professor', :inst_id, CURRENT_TIMESTAMP)
                RETURNING faculty_id
            """),
            {
                "code": fac_code,
                "name": data.full_name,
                "email": email,
                "dept": data.department,
                "inst_id": current_user["institution_id"]
            }
        )
        faculty_id = res.scalar()

        # Insert user
        pwd_hash = hash_password(data.phone)
        db.execute(
            text("""
                INSERT INTO users (email, password_hash, role, faculty_id, institution_id, must_change_password, is_active, created_at, updated_at)
                VALUES (:email, :pwd, 'faculty', :fac_id, :inst_id, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {
                "email": email,
                "pwd": pwd_hash,
                "fac_id": faculty_id,
                "inst_id": current_user["institution_id"]
            }
        )

        db.commit()
        log_audit(db, "FACULTY_CREATION", "Faculty", faculty_id, performed_by=current_user["email"], institution_id=current_user["institution_id"])

        return {
            "success": True,
            "message": "Faculty member created successfully.",
            "email": email,
            "temporary_password": data.phone
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/api/v1/admin/create-student")
def create_student(data: CreateStudentInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        # Check institution exists
        inst = db.execute(
            text("SELECT short_name ,domain_name FROM institutions WHERE institution_id = :inst_id"),
            {"inst_id": current_user["institution_id"]}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=400, detail="Institution not associated with admin user.")

        domain = inst.domain_name
        inst_code = inst.short_name.lower().replace(" ", "")

        email = f"{data.roll_no.lower()}@{domain}"

        # Clean name
        cleaned_name = re.sub(r'[^a-zA-Z0-9\s]', '', data.full_name)
        cleaned_name = re.sub(r'\s+', '_', cleaned_name.strip().lower())

        email = f"{data.roll_no.lower()}@{domain}"

        existing_email = db.execute(
            text("SELECT 1 FROM users WHERE email = :email"),
            {"email": email}
        ).fetchone()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Student email already exists."
            )
        # Check roll number unique in institution
        existing_roll = db.execute(
            text("SELECT 1 FROM students WHERE roll_no = :roll AND institution_id = :inst_id"),
            {"roll": data.roll_no, "inst_id": current_user["institution_id"]}
        ).fetchone()

        if existing_roll:
            raise HTTPException(status_code=400, detail="Student with this Roll Number already exists in this institution")

        # Insert student
        res = db.execute(
            text("""
                INSERT INTO students (roll_no, full_name, email, department, semester, division, institution_id, created_at)
                VALUES (:roll, :name, :email, :dept, :sem, :div, :inst_id, CURRENT_TIMESTAMP)
                RETURNING student_id
            """),
            {
                "roll": data.roll_no,
                "name": data.full_name,
                "email": email,
                "dept": data.department,
                "sem": data.semester,
                "div": data.division,
                "inst_id": current_user["institution_id"]
            }
        )
        student_id = res.scalar()

        # Insert user
        pwd_hash = hash_password(data.phone)
        db.execute(
            text("""
                INSERT INTO users (email, password_hash, role, student_id, institution_id, must_change_password, is_active, created_at, updated_at)
                VALUES (:email, :pwd, 'student', :stud_id, :inst_id, TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {
                "email": email,
                "pwd": pwd_hash,
                "stud_id": student_id,
                "inst_id": current_user["institution_id"]
            }
        )

        db.commit()
        log_audit(db, "STUDENT_CREATION", "Student", student_id, performed_by=current_user["email"], institution_id=current_user["institution_id"])

        return {
            "success": True,
            "message": "Student created successfully.",
            "email": email,
            "temporary_password": data.phone
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/api/v1/auth/change-password")
def change_password(data: ChangePasswordInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = db.execute(
            text("SELECT user_id, password_hash FROM users WHERE user_id = :uid"),
            {"uid": current_user["user_id"]}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify old password
        if not bcrypt.checkpw(data.old_password.encode('utf-8'), user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        # Hash and update new password
        new_pwd_hash = hash_password(data.new_password)
        db.execute(
            text("""
                UPDATE users 
                SET password_hash = :pwd, 
                    must_change_password = FALSE, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = :uid
            """),
            {"pwd": new_pwd_hash, "uid": current_user["user_id"]}
        )
        db.commit()
        log_audit(db, "PASSWORD_CHANGE", "User", current_user["user_id"], current_user["email"])
        return {"success": True, "message": "Password changed successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/api/v1/auth/forgot-password")
def forgot_password(data: ForgotPasswordInput):
    raise HTTPException(
        status_code=501,
        detail="Password reset not implemented"
    )


# --- Phase F: Student Hub Endpoints ---

@app.get("/api/student-hub/dashboard-summary")
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

@app.get("/api/student-hub/courses")
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

@app.get("/api/student-hub/assignments")
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

@app.get("/api/v1/student/{student_id}/notifications")
def get_student_notifications(student_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        notifications = db.execute(text("""
            SELECT notification_id, title, message, type, related_id, is_read, created_at
            FROM notifications
            WHERE student_id = :sid
            ORDER BY created_at DESC
        """), {"sid": student_id}).fetchall()
        
        return [
            {
                "notification_id": n.notification_id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "related_id": n.related_id,
                "is_read": n.is_read,
                "created_at": str(n.created_at)
            } for n in notifications
        ]
    finally:
        db.close()

@app.patch("/api/v1/student/notifications/{notification_id}/read")
def read_student_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = :nid AND student_id = :sid
        """), {"nid": notification_id, "sid": current_user["student_id"]})
        db.commit()
        return {"message": "Notification marked as read"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.patch("/api/v1/student/notifications/read-all")
def read_all_student_notifications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE student_id = :sid
        """), {"sid": current_user["student_id"]})
        db.commit()
        return {"message": "All notifications marked as read"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/api/v1/student/notifications/{notification_id}")
def delete_student_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            DELETE FROM notifications
            WHERE notification_id = :nid AND student_id = :sid
        """), {"nid": notification_id, "sid": current_user["student_id"]})
        db.commit()
        return {"success": True, "message": "Notification deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/student-hub/attendance")
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

@app.get("/api/student-hub/grades")
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

@app.get("/api/student-hub/announcements")
def get_student_hub_announcements_api(current_user: dict = Depends(get_current_user)):
    return get_announcements(current_user)

@app.get("/api/student-hub/calendar")
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


@app.get("/api/student-hub/notes")
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

@app.post("/api/student-hub/notes/{note_id}/download")
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/programming/topics")
def get_programming_topics(category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        query_str = "SELECT * FROM programming_topics"
        params = {}
        if category:
            query_str += " WHERE category = :category"
            params["category"] = category
        query_str += " ORDER BY topic_id ASC"
        res = db.execute(text(query_str), params).fetchall()
        
        topics = []
        for r in res:
            topics.append({
                "topic_id": r.topic_id,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "icon": r.icon,
                "created_at": str(r.created_at) if r.created_at else None
            })
        return topics
    finally:
        db.close()

@app.get("/api/programming/questions")
def get_programming_questions(topic_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        query_str = """
            SELECT q.*, COALESCE(p.completed, FALSE) as completed
            FROM programming_questions q
            LEFT JOIN student_programming_progress p 
              ON q.question_id = p.question_id AND p.student_id = :sid
        """
        params = {"sid": student_id or 0}
        
        if topic_id is not None:
            query_str += " WHERE q.topic_id = :topic_id"
            params["topic_id"] = topic_id
            
        query_str += " ORDER BY q.question_id ASC"
        res = db.execute(text(query_str), params).fetchall()
        
        questions = []
        for r in res:
            questions.append({
                "question_id": r.question_id,
                "topic_id": r.topic_id,
                "title": r.title,
                "difficulty": r.difficulty,
                "platform": r.platform,
                "url": r.url,
                "completed": bool(r.completed),
                "created_at": str(r.created_at) if r.created_at else None
            })
        return questions
    finally:
        db.close()

@app.post("/api/programming/questions/{question_id}/toggle-complete")
def toggle_question_complete(question_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can track programming progress")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Check if progress exists
        row = db.execute(text("""
            SELECT completed FROM student_programming_progress 
            WHERE student_id = :sid AND question_id = :qid
        """), {"sid": student_id, "qid": question_id}).fetchone()
        
        if row:
            # Toggle completion
            new_status = not row.completed
            db.execute(text("""
                UPDATE student_programming_progress 
                SET completed = :status, completed_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid AND question_id = :qid
            """), {"sid": student_id, "qid": question_id, "status": new_status})
        else:
            new_status = True
            db.execute(text("""
                INSERT INTO student_programming_progress (student_id, question_id, completed)
                VALUES (:sid, :qid, TRUE)
            """), {"sid": student_id, "qid": question_id})
        
        db.commit()
        return {"success": True, "completed": new_status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/api/programming/stats")
def get_programming_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students have programming stats")
        
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # 1. Total questions count by difficulty and platform
        all_q = db.execute(text("""
            SELECT difficulty, platform, COUNT(*) as count 
            FROM programming_questions 
            GROUP BY difficulty, platform
        """)).fetchall()
        
        # 2. Solved questions count by difficulty and platform
        solved_q = db.execute(text("""
            SELECT q.difficulty, q.platform, COUNT(*) as count
            FROM programming_questions q
            JOIN student_programming_progress p ON q.question_id = p.question_id
            WHERE p.student_id = :sid AND p.completed = TRUE
            GROUP BY q.difficulty, q.platform
        """), {"sid": student_id}).fetchall()
        
        # Format totals
        total_easy = sum(r.count for r in all_q if r.difficulty.lower() == "easy")
        total_medium = sum(r.count for r in all_q if r.difficulty.lower() == "medium")
        total_hard = sum(r.count for r in all_q if r.difficulty.lower() == "hard")
        total_questions = sum(r.count for r in all_q)
        
        solved_easy = sum(r.count for r in solved_q if r.difficulty.lower() == "easy")
        solved_medium = sum(r.count for r in solved_q if r.difficulty.lower() == "medium")
        solved_hard = sum(r.count for r in solved_q if r.difficulty.lower() == "hard")
        total_solved = sum(r.count for r in solved_q)
        
        # Platform breakdown
        platforms = ["Leetcode", "Codeforces", "HackerRank", "GitHub", "Practice"]
        platform_stats = {}
        for plat in platforms:
            tot = sum(r.count for r in all_q if r.platform.lower() == plat.lower())
            sol = sum(r.count for r in solved_q if r.platform.lower() == plat.lower())
            platform_stats[plat] = {
                "total": tot,
                "solved": sol
            }
            
        return {
            "total_questions": total_questions,
            "total_solved": total_solved,
            "difficulty_breakdown": {
                "easy": {"total": total_easy, "solved": solved_easy},
                "medium": {"total": total_medium, "solved": solved_medium},
                "hard": {"total": total_hard, "solved": solved_hard}
            },
            "platform_breakdown": platform_stats
        }
    finally:
        db.close()


# --- Remedial Reusable Helpers ---

def create_remedial_session_helper(db, payload: RemedialSessionCreateInput) -> int:
    # 1. Insert remedial session
    result = db.execute(
        text("""
        INSERT INTO remedial_sessions
        (
            faculty_id, class_id, subject_id, topic, description,
            session_date, session_time, location, status, created_at
        )
        VALUES
        (
            :faculty_id, :class_id, :subject_id, :topic, :description,
            :session_date, :session_time, :location, 'Active', CURRENT_TIMESTAMP
        )
        RETURNING session_id
        """),
        {
            "faculty_id": payload.faculty_id,
            "class_id": payload.class_id,
            "subject_id": payload.subject_id,
            "topic": payload.topic,
            "description": payload.description,
            "session_date": payload.session_date,
            "session_time": payload.session_time,
            "location": payload.location
        }
    )
    session_id = result.scalar()

    # 2. Insert invitations for each student
    for student_id in payload.student_ids:
        db.execute(
            text("""
            INSERT INTO remedial_invitations (session_id, student_id, status, created_at)
            VALUES (:session_id, :student_id, 'Invited', CURRENT_TIMESTAMP)
            """),
            {"session_id": session_id, "student_id": student_id}
        )

    # 3. Log activity and notification
    log_faculty_activity(payload.faculty_id, "remedial", "scheduled", f"Scheduled remedial session '{payload.topic}' for {payload.session_date}.", session_id, db=db)
    create_notification(db, "faculty", payload.faculty_id, "Remedial Class Scheduled", f"Remedial session '{payload.topic}' scheduled successfully.", "remedial", session_id)
    
    for student_id in payload.student_ids:
        create_notification(
            db,
            "student",
            student_id,
            "Remedial Session Scheduled",
            f"You have been scheduled for a remedial session: '{payload.topic}' on {payload.session_date} at {payload.session_time or 'TBA'}.",
            "remedial",
            session_id
        )
    return session_id


def update_remedial_session_helper(db, session_id: int, payload: RemedialSessionUpdateInput):
    # 1. Update session details
    db.execute(
        text("""
        UPDATE remedial_sessions
        SET class_id = :class_id,
            subject_id = :subject_id,
            topic = :topic,
            description = :description,
            session_date = :session_date,
            session_time = :session_time,
            location = :location
        WHERE session_id = :session_id
        """),
        {
            "class_id": payload.class_id,
            "subject_id": payload.subject_id,
            "topic": payload.topic,
            "description": payload.description,
            "session_date": payload.session_date,
            "session_time": payload.session_time,
            "location": payload.location,
            "session_id": session_id
        }
    )

    # 2. Sync invitations
    current_invites = db.execute(
        text("SELECT student_id FROM remedial_invitations WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchall()
    current_student_ids = {r.student_id for r in current_invites}
    new_student_ids = set(payload.student_ids)

    to_remove = current_student_ids - new_student_ids
    if to_remove:
        db.execute(
            text("DELETE FROM remedial_invitations WHERE session_id = :session_id AND student_id IN :sids"),
            {"session_id": session_id, "sids": tuple(to_remove)}
        )

    to_add = new_student_ids - current_student_ids
    for sid in to_add:
        db.execute(
            text("""
            INSERT INTO remedial_invitations (session_id, student_id, status, created_at)
            VALUES (:session_id, :student_id, 'Invited', CURRENT_TIMESTAMP)
            """),
            {"session_id": session_id, "student_id": sid}
        )

    # 3. Log activity and notification
    log_faculty_activity(payload.faculty_id, "remedial", "updated", f"Updated remedial session '{payload.topic}'.", session_id, db=db)
    create_notification(db, "faculty", payload.faculty_id, "Remedial Class Updated", f"Remedial session '{payload.topic}' was updated.", "remedial", session_id)
    
    for student_id in payload.student_ids:
        create_notification(
            db,
            "student",
            student_id,
            "Remedial Session Updated",
            f"Remedial session '{payload.topic}' has been updated. Date: {payload.session_date}, Time: {payload.session_time}, Location: {payload.location}.",
            "remedial",
            session_id
        )


def cancel_remedial_session_helper(db, session_id: int, faculty_id: int, cancellation_reason: Optional[str] = None):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session status and cancellation reason
    db.execute(
        text("""
        UPDATE remedial_sessions 
        SET status = 'Cancelled', cancellation_reason = :reason 
        WHERE session_id = :session_id
        """),
        {"session_id": session_id, "reason": cancellation_reason}
    )

    # 3. Update all invitation statuses to Cancelled
    db.execute(
        text("UPDATE remedial_invitations SET status = 'Cancelled' WHERE session_id = :session_id"),
        {"session_id": session_id}
    )

    # 4. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "cancelled", f"Cancelled remedial session '{topic}'. Reason: {cancellation_reason or 'None'}", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Cancelled", f"Remedial session '{topic}' was cancelled. Reason: {cancellation_reason or 'None'}", "remedial", session_id)
    
    invited_students = db.execute(
        text("SELECT student_id FROM remedial_invitations WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchall()
    for s in invited_students:
        create_notification(
            db,
            "student",
            s.student_id,
            "Remedial Session Cancelled",
            f"Remedial session '{topic}' has been cancelled. Reason: {cancellation_reason or 'None'}.",
            "remedial",
            session_id
        )


def start_remedial_session_helper(db, session_id: int, faculty_id: int):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session status to 'In Progress'
    db.execute(
        text("UPDATE remedial_sessions SET status = 'In Progress' WHERE session_id = :session_id"),
        {"session_id": session_id}
    )

    # 3. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "started", f"Started remedial session '{topic}'.", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Started", f"Remedial session '{topic}' is now in progress.", "remedial", session_id)


def complete_remedial_session_helper(db, session_id: int, faculty_id: int, outcome: str, remarks: str, recommendation: str):
    # 1. Get session details for logging
    row = db.execute(
        text("SELECT topic FROM remedial_sessions WHERE session_id = :session_id"),
        {"session_id": session_id}
    ).fetchone()
    topic = row.topic if row else "Remedial Session"

    # 2. Update session completion notes, status, and completed_at timestamp
    db.execute(
        text("""
        UPDATE remedial_sessions
        SET status = 'Completed',
            outcome = :outcome,
            remarks = :remarks,
            recommendation = :recommendation,
            completed_at = CURRENT_TIMESTAMP
        WHERE session_id = :session_id
        """),
        {
            "outcome": outcome,
            "remarks": remarks,
            "recommendation": recommendation,
            "session_id": session_id
        }
    )

    # 3. Log activity and notification
    log_faculty_activity(faculty_id, "remedial", "completed", f"Recorded completion notes for remedial session '{topic}'.", session_id, db=db)
    create_notification(db, "faculty", faculty_id, "Remedial Class Completed", f"Remedial session '{topic}' completion notes recorded.", "remedial", session_id)


@app.post("/remedial/sessions")
def create_remedial_session(payload: RemedialSessionCreateInput):
    db = SessionLocal()
    try:
        session_id = create_remedial_session_helper(db, payload)
        db.commit()
        return {
            "success": True,
            "session_id": session_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.put("/remedial/sessions/{session_id}")
def update_remedial_session(session_id: int, payload: RemedialSessionUpdateInput):
    db = SessionLocal()
    try:
        update_remedial_session_helper(db, session_id, payload)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/remedial/sessions/{session_id}/cancel")
def cancel_remedial_session(session_id: int, payload: CancelRemedialSessionInput):
    db = SessionLocal()
    try:
        cancel_remedial_session_helper(db, session_id, payload.faculty_id, payload.cancellation_reason)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/remedial/sessions/{session_id}/start")
def start_remedial_session(session_id: int, payload: StartRemedialSessionInput):
    db = SessionLocal()
    try:
        start_remedial_session_helper(db, session_id, payload.faculty_id)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.post("/remedial/sessions/{session_id}/complete")
def complete_remedial_session(session_id: int, payload: CompleteRemedialSessionInput):
    db = SessionLocal()
    try:
        complete_remedial_session_helper(db, session_id, payload.faculty_id, payload.outcome, payload.remarks, payload.recommendation)
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/remedial/sessions")
def get_remedial_sessions(faculty_id: int):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
            SELECT
                rs.session_id,
                rs.topic,
                rs.description,
                rs.session_date,
                rs.session_time,
                rs.class_id,
                rs.subject_id,
                rs.location,
                rs.status,
                rs.outcome,
                rs.remarks,
                rs.recommendation,
                rs.cancellation_reason,
                rs.completed_at,
                s.subject_name,
                c.class_name,
                f.full_name AS faculty_name,
                COALESCE((
                    SELECT string_agg(st.full_name, ', ')
                    FROM remedial_invitations ri
                    JOIN students st ON ri.student_id = st.student_id
                    WHERE ri.session_id = rs.session_id
                ), '') AS student_names
            FROM remedial_sessions rs
            JOIN subjects s ON rs.subject_id = s.subject_id
            JOIN classes c ON rs.class_id = c.class_id
            JOIN faculty f ON rs.faculty_id = f.faculty_id
            WHERE rs.faculty_id = :faculty_id
            ORDER BY rs.session_date DESC
            """),
            {"faculty_id": faculty_id}
        ).mappings().all()
        return [dict(r) for r in rows]
    finally:
        db.close()


@app.get("/remedial/sessions/{session_id}/invitations")
def get_session_invitations(session_id: int):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
            SELECT
                ri.invitation_id,
                ri.student_id,
                ri.status,
                s.full_name AS student_name,
                s.roll_no,
                s.email
            FROM remedial_invitations ri
            JOIN students s ON ri.student_id = s.student_id
            WHERE ri.session_id = :session_id
            """),
            {"session_id": session_id}
        ).mappings().all()
        return [dict(r) for r in rows]
    finally:
        db.close()


@app.post("/remedial/invitations/{invitation_id}/status")
def update_invitation_status(
    invitation_id: int,
    payload: InvitationStatusUpdate
):
    db = SessionLocal()
    try:
        db.execute(
            text("""
            UPDATE remedial_invitations
            SET status = :status
            WHERE invitation_id = :invitation_id
            """),
            {
                "status": payload.status,
                "invitation_id": invitation_id
            }
        )
        db.commit()
        return {
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()



@app.get("/api/v1/admin/monitoring/status")
def get_monitoring_status(current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        try:
            db.execute(text("SELECT 1"))
            db_status = "Operational"
        except Exception:
            db_status = "Down"
            
        role = current_user["role"]
        iid = current_user.get("institution_id")
        
        # Count distinct user logins in the past 24 hours
        if role == "super_admin":
            active_users = db.execute(text("""
                SELECT COUNT(DISTINCT user_id) 
                FROM security_events 
                WHERE event_type = 'LOGIN_SUCCESS' 
                  AND created_at >= NOW() - INTERVAL '24 hours'
            """)).scalar() or 0
        else:
            active_users = db.execute(text("""
                SELECT COUNT(DISTINCT user_id) 
                FROM security_events 
                WHERE event_type = 'LOGIN_SUCCESS' 
                  AND created_at >= NOW() - INTERVAL '24 hours'
                  AND institution_id = :iid
            """), {"iid": iid}).scalar() or 0
                
        return {
            "database_status": db_status,
            "api_status": "Operational",
            "storage_status": "Coming Soon",
            "active_users": active_users
        }
    finally:
        db.close()


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
def get_subject_assessments(subject_id: int, academic_year: Optional[str] = "2026-2027", current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "super_admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        subj = db.execute(text("SELECT semester FROM subjects WHERE subject_id = :sid"), {"sid": subject_id}).fetchone()
        semester = subj.semester if subj else 5
        
        components = db.execute(text("""
            SELECT * FROM subject_assessments 
            WHERE academic_year = :ay AND semester = :sem AND subject_id = :sid 
            ORDER BY display_order, name
        """), {"ay": academic_year, "sem": semester, "sid": subject_id}).fetchall()
        
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


class AdminAssessmentComponentInput(BaseModel):
    name: str
    category: str
    max_marks: float
    weightage: float
    display_order: int
    is_mandatory: bool
    visible_to_students: bool
    editable_by_faculty: bool


class SubjectAssessmentsSaveInput(BaseModel):
    academic_year: str
    components: List[AdminAssessmentComponentInput]


@app.post("/api/v1/subjects/{subject_id}/assessments")
def save_subject_assessments(subject_id: int, data: SubjectAssessmentsSaveInput, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        subj = db.execute(text("SELECT semester FROM subjects WHERE subject_id = :sid"), {"sid": subject_id}).fetchone()
        semester = subj.semester if subj else 5
        
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()



# =====================================================================
# --- FACULTY PRODUCTIVITY HUB: NOTIFICATIONS & ACTIVITIES ---
# =====================================================================

def log_faculty_activity(*args, **kwargs):
    """
    Flexible, backward-compatible activity logger.
    Supports:
      Old: log_faculty_activity(db, faculty_id, action, module, details, related_id=None)
      New: log_faculty_activity(faculty_id, module, action, details, related_id=None)
    """
    db = None
    faculty_id = None
    module = None
    action = None
    details = None
    related_id = None
    
    if len(args) >= 1:
        first = args[0]
        if isinstance(first, (int, float)) or (isinstance(first, str) and first.isdigit()):
            # New signature: faculty_id, module, action, details, related_id=None
            faculty_id = int(first)
            if len(args) >= 2: module = args[1]
            if len(args) >= 3: action = args[2]
            if len(args) >= 4: details = args[3]
            if len(args) >= 5: related_id = args[4]
            db = kwargs.get("db", None)
        else:
            # Old signature: db, faculty_id, action, module, details, related_id=None
            db = first
            if len(args) >= 2: faculty_id = int(args[1])
            if len(args) >= 3: action = args[2]
            if len(args) >= 4: module = args[3]
            if len(args) >= 5: details = args[4]
            if len(args) >= 6: related_id = args[5]
            
    # Override/fill from kwargs
    if "faculty_id" in kwargs: faculty_id = kwargs["faculty_id"]
    if "module" in kwargs: module = kwargs["module"]
    if "action" in kwargs: action = kwargs["action"]
    if "details" in kwargs: details = kwargs["details"]
    if "related_id" in kwargs: related_id = kwargs["related_id"]
    if "db" in kwargs and db is None: db = kwargs["db"]
    
    # Map module names if any
    if module == "marks":
        module = "gradebook"
    elif module == "risk":
        if action and ("Intervention" in action or "intervention" in action.lower()):
            module = "student_monitoring"
        else:
            module = "risk_prediction"
    elif module == "auth":
        module = "authentication"
    elif module == "announcement":
        module = "announcement"
        
    opened_db = False
    if db is None:
        db = SessionLocal()
        opened_db = True
        
    try:
        db.execute(
            text("""
                INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
                VALUES (:faculty_id, :action, :module, :details, :related_id, CURRENT_TIMESTAMP)
            """),
            {
                "faculty_id": faculty_id,
                "action": action,
                "module": module,
                "details": details,
                "related_id": related_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error logging faculty activity: {e}")
        if opened_db:
            db.rollback()
    finally:
        if opened_db:
            db.close()

# Alias log_activity to log_faculty_activity for standard conformant calls
log_activity = log_faculty_activity

def create_notification(
    db,
    recipient_type: str,
    recipient_id: int,
    title: str,
    message: str,
    module: str,
    reference_id: Optional[int] = None
):
    try:
        faculty_id = recipient_id if recipient_type == "faculty" else None
        student_id = recipient_id if recipient_type == "student" else None
        
        db.execute(
            text("""
                INSERT INTO notifications (
                    faculty_id, student_id, title, message, type, module, related_id, reference_id, is_read, created_at
                ) VALUES (
                    :faculty_id, :student_id, :title, :message, :type, :module, :related_id, :reference_id, FALSE, CURRENT_TIMESTAMP
                )
            """),
            {
                "faculty_id": faculty_id,
                "student_id": student_id,
                "title": title,
                "message": message,
                "type": module,
                "module": module,
                "related_id": reference_id,
                "reference_id": reference_id
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error in create_notification helper: {e}")
        try:
            db.rollback()
        except Exception:
            pass

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

def ensure_default_activities(db, faculty_id: int):
    count = db.execute(
        text("SELECT COUNT(*) FROM faculty_activities WHERE faculty_id = :fid"),
        {"fid": faculty_id}
    ).scalar()
    if count > 0:
        return
        
    # Seed Attendance Activities
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
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'recorded', 'attendance', :details, :rid, :created)
        """), {
            "fid": faculty_id,
            "details": f"Recorded attendance for {c_name} - {s_name}.",
            "rid": att.class_id,
            "created": datetime.combine(att.attendance_date, datetime.min.time())
        })
        
    # Seed Assignment Activities
    assignments = db.execute(text("""
        SELECT a.assignment_id, a.title, c.class_name, a.created_at FROM assignments a
        JOIN classes c ON a.class_id = c.class_id
        JOIN faculty_assignments fa ON a.class_id = fa.class_id AND a.subject_id = fa.subject_id
        WHERE fa.faculty_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in assignments:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'created', 'assignment', :details, :rid, :created)
        """), {
            "fid": faculty_id,
            "details": f"Created new assignment '{a.title}' for {a.class_name}.",
            "rid": a.assignment_id,
            "created": a.created_at
        })
        
    # Seed Remedial Activities
    remedials = db.execute(text("""
        SELECT session_id, topic, session_date FROM remedial_sessions
        WHERE faculty_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for r in remedials:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'scheduled', 'remedial', :details, :rid, CURRENT_TIMESTAMP - INTERVAL '1 day')
        """), {
            "fid": faculty_id,
            "details": f"Scheduled a remedial session on '{r.topic}' for {r.session_date}.",
            "rid": r.session_id
        })
        
    # Seed Announcement Activities
    announcements = db.execute(text("""
        SELECT announcement_id, title, created_at FROM announcements
        WHERE sender_type = 'faculty' AND sender_id = :fid
        LIMIT 2
    """), {"fid": faculty_id}).fetchall()
    for a in announcements:
        db.execute(text("""
            INSERT INTO faculty_activities (faculty_id, action, module, details, related_id, created_at)
            VALUES (:fid, 'posted', 'announcement', :details, :rid, :created)
        """), {
            "fid": faculty_id,
            "details": f"Posted announcement '{a.title}' to the class bulletin board.",
            "rid": a.announcement_id,
            "created": a.created_at
        })
    db.commit()

@app.get("/api/v1/faculty/{faculty_id}/notifications")
def get_faculty_notifications(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        ensure_default_notifications(db, faculty_id)
        rows = db.execute(text("""
            SELECT notification_id, title, message, type, related_id, is_read, created_at
            FROM notifications
            WHERE faculty_id = :fid
            ORDER BY created_at DESC
        """), {"fid": faculty_id}).fetchall()
        
        return [
            {
                "notification_id": r.notification_id,
                "title": r.title,
                "message": r.message,
                "type": r.type,
                "related_id": r.related_id,
                "is_read": bool(r.is_read),
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in rows
        ]
    finally:
        db.close()

@app.patch("/api/v1/faculty/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = :nid AND faculty_id = :fid
        """), {"nid": notification_id, "fid": current_user["faculty_id"]})
        db.commit()
        return {"success": True}
    finally:
        db.close()

@app.patch("/api/v1/faculty/{faculty_id}/notifications/read-all")
def mark_all_notifications_read(faculty_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty" or current_user["faculty_id"] != faculty_id:
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE faculty_id = :fid
        """), {"fid": faculty_id})
        db.commit()
        return {"success": True}
    finally:
        db.close()

@app.delete("/api/v1/faculty/notifications/{notification_id}")
def delete_notification(notification_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Access denied")
    db = SessionLocal()
    try:
        db.execute(text("""
            DELETE FROM notifications
            WHERE notification_id = :nid AND faculty_id = :fid
        """), {"nid": notification_id, "fid": current_user["faculty_id"]})
        db.commit()
        return {"success": True}
    finally:
        db.close()

@app.get("/api/v1/faculty/{faculty_id}/activities")
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


@app.get("/api/v1/faculty/{faculty_id}/dashboard-command-center")
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
            {"sid": subject_id, "ay": academic_year or "2026-2027", "sem": semester or 5}
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


# --- Dynamic Domains Module Endpoints ---

@app.get("/api/domains")
@app.get("/api/v1/domains")
def get_domains():
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT domain_id, domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
                   skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
            FROM domains
            ORDER BY domain_id ASC
        """)).fetchall()
        
        result = []
        for r in rows:
            import json
            result.append({
                "id": r.domain_key,
                "domain_id": r.domain_id,
                "domain_key": r.domain_key,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "icon": r.icon,
                "difficulty": r.difficulty,
                "duration": r.duration,
                "avgSalary": r.avg_salary,
                "popular": r.popular,
                "skills": json.loads(r.skills) if isinstance(r.skills, str) else r.skills,
                "nodes": json.loads(r.roadmap) if isinstance(r.roadmap, str) else r.roadmap,
                "courses": json.loads(r.courses) if isinstance(r.courses, str) else r.courses,
                "certifications": json.loads(r.certifications) if isinstance(r.certifications, str) else r.certifications,
                "projects": json.loads(r.projects) if isinstance(r.projects, str) else r.projects,
                "salary": json.loads(r.salary) if isinstance(r.salary, str) else r.salary,
                "placements": json.loads(r.placements) if isinstance(r.placements, str) else r.placements,
                "learning_resources": json.loads(r.learning_resources) if isinstance(r.learning_resources, str) else r.learning_resources,
                "interview_prep": json.loads(r.interview_prep) if isinstance(r.interview_prep, str) else r.interview_prep
            })
        return result
    finally:
        db.close()


@app.get("/api/domains/{domain_key}")
@app.get("/api/v1/domains/{domain_key}")
def get_domain_detail(domain_key: str):
    db = SessionLocal()
    try:
        r = db.execute(text("""
            SELECT domain_id, domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
                   skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
            FROM domains
            WHERE domain_key = :key
        """), {"key": domain_key}).fetchone()
        
        if not r:
            raise HTTPException(status_code=404, detail="Domain not found")
            
        import json
        return {
            "id": r.domain_key,
            "domain_id": r.domain_id,
            "domain_key": r.domain_key,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "icon": r.icon,
            "difficulty": r.difficulty,
            "duration": r.duration,
            "avgSalary": r.avg_salary,
            "popular": r.popular,
            "skills": json.loads(r.skills) if isinstance(r.skills, str) else r.skills,
            "nodes": json.loads(r.roadmap) if isinstance(r.roadmap, str) else r.roadmap,
            "courses": json.loads(r.courses) if isinstance(r.courses, str) else r.courses,
            "certifications": json.loads(r.certifications) if isinstance(r.certifications, str) else r.certifications,
            "projects": json.loads(r.projects) if isinstance(r.projects, str) else r.projects,
            "salary": json.loads(r.salary) if isinstance(r.salary, str) else r.salary,
            "placements": json.loads(r.placements) if isinstance(r.placements, str) else r.placements,
            "learning_resources": json.loads(r.learning_resources) if isinstance(r.learning_resources, str) else r.learning_resources,
            "interview_prep": json.loads(r.interview_prep) if isinstance(r.interview_prep, str) else r.interview_prep
        }
    finally:
        db.close()


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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/gamification/badges")
def get_student_badges_api(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Student ID required")
            
        metrics = db.execute(text("""
            SELECT attendance, quiz_score, predicted_cgpa, xp_points, streak 
            FROM student_metrics WHERE student_id = :sid
        """), {"sid": student_id}).fetchone()
        
        assign_count = db.execute(text("""
            SELECT COUNT(*) FROM assignment_submissions 
            WHERE student_id = :sid AND status = 'Graded'
        """), {"sid": student_id}).scalar() or 0
        
        quizzes_passed = db.execute(text("""
            SELECT COUNT(*) FROM quiz_attempts 
            WHERE student_id = :sid AND passed = TRUE
        """), {"sid": student_id}).scalar() or 0
        
        domains_count = db.execute(text("""
            SELECT COUNT(DISTINCT domain_id) FROM quiz_attempts 
            WHERE student_id = :sid
        """), {"sid": student_id}).scalar() or 0
        
        unlocked_res = db.execute(text("""
            SELECT badge_id FROM student_badges WHERE student_id = :sid
        """), {"sid": student_id}).fetchall()
        unlocked_badge_ids = {r.badge_id for r in unlocked_res}
        
        xp_pts = metrics.xp_points if metrics else 0
        streak_val = metrics.streak if metrics else 0
        cgpa_val = float(metrics.predicted_cgpa) if metrics else 0.0
        attendance_val = float(metrics.attendance) if metrics else 0.0
        
        badges_list = [
          { "id": "b1", "name": "Academic Topper", "description": "Achieve the highest score in your department quiz.", "category": "Academic Excellence", "icon": "Trophy", "xpReward": 500, "unlockCondition": "Rank 1 in Department Quiz", "unlocked": "b1" in unlocked_badge_ids, "progress": { "current": 1 if "b1" in unlocked_badge_ids else 0, "target": 1 } },
          { "id": "b2", "name": "Dean's List", "description": "Maintain an academic CGPA of 9.0 or above.", "category": "Academic Excellence", "icon": "Award", "xpReward": 400, "unlockCondition": "CGPA >= 9.0", "unlocked": cgpa_val >= 9.0 or "b2" in unlocked_badge_ids, "progress": { "current": cgpa_val, "target": 9.0 } },
          { "id": "b3", "name": "Subject Master", "description": "Complete all quizzes in a single domain with >90% average.", "category": "Academic Excellence", "icon": "BookOpen", "xpReward": 300, "unlockCondition": "Average score > 90%", "unlocked": "b3" in unlocked_badge_ids, "progress": { "current": 90 if "b3" in unlocked_badge_ids else 89, "target": 90 } },
          { "id": "b4", "name": "Perfect Attendance", "description": "Maintain a high attendance rate of 95% or higher.", "category": "Attendance", "icon": "CalendarCheck", "xpReward": 250, "unlockCondition": "Attendance >= 95%", "unlocked": attendance_val >= 95.0 or "b4" in unlocked_badge_ids, "progress": { "current": attendance_val, "target": 95 } },
          { "id": "b5", "name": "Consistent Learner", "description": "Maintain a study streak of 15 consecutive days.", "category": "Attendance", "icon": "Flame", "xpReward": 200, "unlockCondition": "15 Day Streak", "unlocked": streak_val >= 15 or "b5" in unlocked_badge_ids, "progress": { "current": streak_val, "target": 15 } },
          { "id": "b6", "name": "Campus Regular", "description": "Check in on campus for 30 consecutive days.", "category": "Attendance", "icon": "MapPin", "xpReward": 150, "unlockCondition": "30 Days Check-in", "unlocked": "b6" in unlocked_badge_ids, "progress": { "current": 30 if "b6" in unlocked_badge_ids else 12, "target": 30 } },
          { "id": "b7", "name": "Assignment Warrior", "description": "Complete 10 course assignments successfully.", "category": "Assignments", "icon": "FileText", "xpReward": 300, "unlockCondition": "10 Assignments Completed", "unlocked": assign_count >= 10 or "b7" in unlocked_badge_ids, "progress": { "current": assign_count, "target": 10 } },
          { "id": "b8", "name": "Deadline Crusher", "description": "Submit 5 assignments 24 hours before the deadline.", "category": "Assignments", "icon": "Clock", "xpReward": 200, "unlockCondition": "5 Early Submissions", "unlocked": "b8" in unlocked_badge_ids, "progress": { "current": 5 if "b8" in unlocked_badge_ids else 3, "target": 5 } },
          { "id": "b9", "name": "Zero Backlog Shield", "description": "Keep your backlog list completely clear for the semester.", "category": "Assignments", "icon": "Shield", "xpReward": 250, "unlockCondition": "No Pending Assignments", "unlocked": "b9" in unlocked_badge_ids, "progress": { "current": 0, "target": 0 } },
          { "id": "b10", "name": "Quiz Master", "description": "Complete 5 quizzes with an average score of over 85%.", "category": "Learning & Skills", "icon": "CheckCircle", "xpReward": 300, "unlockCondition": "5 Quizzes with >85% Score", "unlocked": quizzes_passed >= 5 or "b10" in unlocked_badge_ids, "progress": { "current": quizzes_passed, "target": 5 } },
          { "id": "b11", "name": "Knowledge Explorer", "description": "Unlock and view 4 learning domains.", "category": "Learning & Skills", "icon": "Compass", "xpReward": 150, "unlockCondition": "4 Domains Visited", "unlocked": domains_count >= 4 or "b11" in unlocked_badge_ids, "progress": { "current": domains_count, "target": 4 } },
          { "id": "b12", "name": "AI Enthusiast", "description": "Earn a score of 100% on any AI/ML track quiz.", "category": "Learning & Skills", "icon": "Cpu", "xpReward": 200, "unlockCondition": "100% Score on AI Quiz", "unlocked": "b12" in unlocked_badge_ids, "progress": { "current": 1 if "b12" in unlocked_badge_ids else 0, "target": 1 } },
          { "id": "b13", "name": "Club Contributor", "description": "Participate in 3 campus club technical events.", "category": "Community & Events", "icon": "Users", "xpReward": 200, "unlockCondition": "Attend 3 Events", "unlocked": "b13" in unlocked_badge_ids, "progress": { "current": 3 if "b13" in unlocked_badge_ids else 1, "target": 3 } },
          { "id": "b14", "name": "Campus Ambassador", "description": "Refer 5 other students to join the NeuroLearn portal.", "category": "Community & Events", "icon": "Megaphone", "xpReward": 350, "unlockCondition": "5 Referrals Registered", "unlocked": "b14" in unlocked_badge_ids, "progress": { "current": 3 if "b14" in unlocked_badge_ids else 0, "target": 5 } },
          { "id": "b15", "name": "Legend Rank", "description": "Reach Level 10 and enter the elite Legend leaderboard.", "category": "Elite Achievements", "icon": "Crown", "xpReward": 1000, "unlockCondition": "Reach Level 10", "unlocked": xp_pts >= 10000 or "b15" in unlocked_badge_ids, "progress": { "current": min(10, int(xp_pts / 1000)), "target": 10 } }
        ]
        
        # Save newly unlocked badges automatically
        modified = False
        for b in badges_list:
            if b["unlocked"] and b["id"] not in unlocked_badge_ids:
                db.execute(text("""
                    INSERT INTO student_badges (student_id, badge_id)
                    VALUES (:sid, :bid) ON CONFLICT DO NOTHING
                """), {"sid": student_id, "bid": b["id"]})
                db.execute(text("""
                    UPDATE student_metrics SET xp_points = xp_points + :xp WHERE student_id = :sid
                """), {"xp": b["xpReward"], "sid": student_id})
                db.execute(text("""
                    INSERT INTO notifications (student_id, title, message, type, created_at)
                    VALUES (:sid, 'Badge Unlocked!', :msg, 'general', CURRENT_TIMESTAMP)
                """), {"sid": student_id, "msg": f"Prestige Unlock: You earned the '{b['name']}' badge and +{b['xpReward']} XP!"})
                modified = True
                
        if modified:
            db.commit()
            
        return badges_list
    finally:
        db.close()


@app.get("/api/gamification/leaderboard")
def get_gamification_leaderboard(
    type: str = "student", 
    filter: str = "institution",
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        inst_id = current_user.get("institution_id", 1)
        
        if type == "faculty":
            # Rank faculty by log count in faculty_activities
            query_str = """
                SELECT f.faculty_id as id, f.full_name as name, f.faculty_code as "facultyCode",
                       f.department as branch, f.designation, f.avatar_url as avatar,
                       COUNT(fa.activity_id) as xp,
                       COUNT(CASE WHEN fa.module = 'attendance' THEN 1 END) as streak
                FROM faculty f
                LEFT JOIN faculty_activities fa ON f.faculty_id = fa.faculty_id
                WHERE f.institution_id = :inst_id
                GROUP BY f.faculty_id, f.full_name, f.faculty_code, f.department, f.designation, f.avatar_url
                ORDER BY xp DESC
            """
            rows = db.execute(text(query_str), {"inst_id": inst_id}).fetchall()
            leaderboard = []
            for idx, r in enumerate(rows):
                leaderboard.append({
                    "id": f"FC-{r.id}",
                    "name": r.name,
                    "facultyCode": r.facultyCode,
                    "branch": r.branch,
                    "designation": r.designation,
                    "avatar": r.avatar or "👨‍🏫",
                    "xp": r.xp * 150 + 500, 
                    "streak": r.streak or 0,
                    "rank": idx + 1
                })
            return leaderboard
            
        else: # student or overall
            query_str = """
                SELECT s.student_id as id, s.full_name as name, s.roll_no as "rollNumber",
                       s.department as branch, s.semester, s.avatar_url as avatar,
                       COALESCE(sm.xp_points, 0) as xp, COALESCE(sm.streak, 0) as streak
                FROM students s
                LEFT JOIN student_metrics sm ON s.student_id = sm.student_id
                WHERE s.institution_id = :inst_id
            """
            params = {"inst_id": inst_id}
            
            if filter == "department" and current_user.get("role") == "student":
                user_dept = db.execute(text("SELECT department FROM students WHERE student_id = :sid"), {"sid": current_user["student_id"]}).scalar()
                if user_dept:
                    query_str += " AND s.department = :dept"
                    params["dept"] = user_dept
            elif filter == "semester" and current_user.get("role") == "student":
                user_sem = db.execute(text("SELECT semester FROM students WHERE student_id = :sid"), {"sid": current_user["student_id"]}).scalar()
                if user_sem:
                    query_str += " AND s.semester = :sem"
                    params["sem"] = user_sem
                    
            rows = db.execute(text(query_str), params).fetchall()
            leaderboard = []
            for r in rows:
                leaderboard.append({
                    "id": f"ST-{r.id}",
                    "name": r.name,
                    "rollNumber": r.rollNumber,
                    "branch": r.branch,
                    "year": f"Semester {r.semester}",
                    "avatar": r.avatar or "🚀",
                    "xp": r.xp,
                    "streak": r.streak,
                })
                
            if filter == "weekly":
                for item in leaderboard:
                    item["xp"] = int((item["xp"] * 0.15) + (item["streak"] * 12) + (item["id"].split("-")[1].encode()[0] * 5))
                    
            leaderboard.sort(key=lambda x: x["xp"], reverse=True)
            for idx, item in enumerate(leaderboard):
                item["rank"] = idx + 1
            return leaderboard
    finally:
        db.close()


@app.get("/api/gamification/stats")
def get_gamification_stats(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Gamification stats only available to students")
            
        metrics = db.execute(text("""
            SELECT COALESCE(xp_points, 0) as xp, COALESCE(streak, 0) as streak 
            FROM student_metrics WHERE student_id = :sid
        """), {"sid": student_id}).fetchone()
        
        xp = metrics.xp if metrics else 0
        streak = metrics.streak if metrics else 0
        
        level_map = [
          { "level": 1, "name": "Freshman", "minXp": 0, "maxXp": 199 },
          { "level": 2, "name": "Learner", "minXp": 200, "maxXp": 499 },
          { "level": 3, "name": "Explorer", "minXp": 500, "maxXp": 999 },
          { "level": 4, "name": "Scholar", "minXp": 1000, "maxXp": 1799 },
          { "level": 5, "name": "Achiever", "minXp": 1800, "maxXp": 2799 },
          { "level": 6, "name": "Innovator", "minXp": 2800, "maxXp": 3999 },
          { "level": 7, "name": "Expert", "minXp": 4000, "maxXp": 5499 },
          { "level": 8, "name": "Mentor", "minXp": 5500, "maxXp": 7499 },
          { "level": 9, "name": "Elite", "minXp": 7500, "maxXp": 9999 },
          { "level": 10, "name": "Legend", "minXp": 10000, "maxXp": 999999 }
        ]
        current_lvl = next((lvl for lvl in level_map if xp >= lvl["minXp"] and xp <= lvl["maxXp"]), level_map[-1])
        
        all_students = db.execute(text("""
            SELECT s.student_id, COALESCE(sm.xp_points, 0) as xp 
            FROM students s 
            LEFT JOIN student_metrics sm ON s.student_id = sm.student_id 
            WHERE s.institution_id = :iid
            ORDER BY xp DESC
        """), {"iid": current_user.get("institution_id", 1)}).fetchall()
        
        total_cohort = len(all_students)
        user_rank = 1
        for idx, r in enumerate(all_students):
            if r.student_id == student_id:
                user_rank = idx + 1
                break
                
        pct = (user_rank / total_cohort * 100) if total_cohort > 0 else 100
        percentile_str = "Top 1%" if pct <= 1 else f"Top {round(pct)}%"
        
        badges_unlocked = db.execute(text("""
            SELECT COUNT(*) FROM student_badges WHERE student_id = :sid
        """), {"sid": student_id}).scalar() or 0
        
        progress_range = (current_lvl["maxXp"] - current_lvl["minXp"] + 1)
        progress_percent = round(((xp - current_lvl["minXp"]) / progress_range) * 100) if current_lvl["maxXp"] != 999999 else 100
        
        return {
            "xp": xp,
            "streak": streak,
            "level": current_lvl["level"],
            "level_name": current_lvl["name"],
            "min_xp": current_lvl["minXp"],
            "max_xp": current_lvl["maxXp"],
            "progress_percent": progress_percent,
            "rank": user_rank,
            "total_cohort": total_cohort,
            "percentile": percentile_str,
            "badges_unlocked": badges_unlocked
        }
    finally:
        db.close()


@app.get("/api/gamification/analytics")
def get_gamification_analytics(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Only students have quiz analytics")
            
        attempts = db.execute(text("""
            SELECT score, total_questions, passed, created_at 
            FROM quiz_attempts 
            WHERE student_id = :sid 
            ORDER BY created_at ASC
        """), {"sid": student_id}).fetchall()
        
        if not attempts:
            return {
                "total_quizzes": 0,
                "passed_quizzes": 0,
                "avg_score": 0.0,
                "passing_rate": 0.0,
                "history": []
            }
            
        total = len(attempts)
        passed = sum(1 for a in attempts if a.passed)
        avg = sum((float(a.score) / float(a.total_questions) * 100) if a.total_questions > 0 else 0 for a in attempts) / total
        
        history = []
        for a in attempts:
            history.append({
                "score": a.score,
                "total_questions": a.total_questions,
                "passed": a.passed,
                "date": str(a.created_at.date()) if a.created_at else None
            })
            
        return {
            "total_quizzes": total,
            "passed_quizzes": passed,
            "avg_score": round(avg, 1),
            "passing_rate": round(passed / total * 100, 1),
            "history": history
        }
    finally:
        db.close()


# --- Academic Predictions Endpoints ---

class AcademicPredictInput(BaseModel):
    age: int
    studytime: int
    failures: int
    absences: int
    G1: float
    G2: float


@app.get("/api/v1/academic/student-stats")
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


@app.post("/api/v1/academic/predict")
def predict_academic_outcome(data: AcademicPredictInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can run academic projections")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # 1. Run grade prediction
        predicted_grade = 14.5 # Default fallback
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
        import json
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
    except Exception as e:
        db.rollback()
        print(f"Error in academic predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.get("/api/v1/academic/predictions/history")
def get_academic_predictions_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can view predictions history")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        import json
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

