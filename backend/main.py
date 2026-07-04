# main.py
import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from backend.middleware import PathRewriteMiddleware

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("neurolearn_api")

# Import routes
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
app.add_middleware(PathRewriteMiddleware)

# --- Public / Core Routes ---

@app.get("/")
def home():
    return {"message": "NeuroLearn AI Backend Running"}

# --- Authentication Endpoints ---
failed_logins_tracker = {}

@app.on_event("startup")
def startup_migrations():
    from backend.migrations import run_migrations, run_gradebook_migrations, run_remedial_migrations
    run_migrations()
    run_gradebook_migrations()
    run_remedial_migrations()
