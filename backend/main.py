# main.py
import joblib
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from backend.database import SessionLocal
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    target_type: str  # 'Students' | 'Faculty' | 'CS' | 'IT' etc. | 'Entire Institution'

class AcademicTermInput(BaseModel):
    academic_year: str
    semester: int

class SystemSettingsInput(BaseModel):
    institution_name: str
    institution_logo: Optional[str] = ""
    academic_year: str
    contact_email: Optional[str] = ""
    contact_phone: Optional[int] = ""
    branding_color: Optional[str] = ""
    theme_preference: Optional[str] = ""


# --- Audit Logging Helper ---

def log_audit(db, action: str, entity_type: str, entity_id: Optional[int] = None, performed_by: str = "Admin"):
    try:
        db.execute(
            text("""
                INSERT INTO audit_logs (action, entity_type, entity_id, performed_by, created_at)
                VALUES (:action, :entity_type, :entity_id, :performed_by, NOW())
            """),
            {
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "performed_by": performed_by
            }
        )
        db.commit()
    except Exception as e:
        print(f"Error writing audit log: {e}")


# --- Public / Core Routes ---

@app.get("/")
def home():
    return {"message": "NeuroLearn AI Backend Running"}

@app.get("/model-status")
def model_status():
    return {"student_performance": "loaded" if student_model is not None else "failed"}

@app.get("/predict-test")
def predict_test():
    return {"predicted_grade": 14.8}

@app.post("/predict/student-performance")
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


# --- Teacher Telemetry Routes ---

@app.get("/teacher/{faculty_id}/classes")
def get_teacher_classes(faculty_id: int):
    db = SessionLocal()
    query = text("""
        SELECT c.class_id, c.class_name, s.subject_name, fa.role
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
            "subject_name": row.subject_name,
            "role": row.role
        })
    db.close()
    return classes

@app.get("/class/{class_id}/students")
def get_class_students(class_id: int):
    db = SessionLocal()
    query = text("""
        SELECT s.student_id, s.roll_no, s.full_name, s.email, s.department, s.semester, s.division
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        WHERE e.class_id = :class_id
        ORDER BY s.roll_no
    """)
    result = db.execute(query, {"class_id": class_id})
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
    db.close()
    return students

@app.get("/class/{class_id}/student-metrics")
def get_class_student_metrics(class_id: int):
    db = SessionLocal()
    query = text("""
        SELECT s.student_id, s.roll_no, s.full_name, s.department, s.semester, s.division,
               sm.attendance, sm.quiz_score, sm.risk_level, sm.predicted_cgpa, sm.xp_points
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        JOIN student_metrics sm ON s.student_id = sm.student_id
        WHERE e.class_id = :class_id
        ORDER BY s.roll_no
    """)
    result = db.execute(query, {"class_id": class_id})
    students = []
    for row in result:
        students.append({
            "student_id": row.student_id,
            "roll_no": row.roll_no,
            "full_name": row.full_name,
            "department": row.department,
            "semester": row.semester,
            "division": row.division,
            "attendance": float(row.attendance) if row.attendance else 0.0,
            "quiz_score": float(row.quiz_score) if row.quiz_score else 0.0,
            "risk_level": row.risk_level,
            "predicted_cgpa": float(row.predicted_cgpa) if row.predicted_cgpa else 0.0,
            "xp_points": row.xp_points or 0
        })
    db.close()
    return students

@app.get("/class/{class_id}/dashboard-summary")
def get_dashboard_summary(class_id: int):
    db = SessionLocal()
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
def get_class_attendance(class_id: int):
    db = SessionLocal()
    query = text("""
        SELECT s.student_id, s.roll_no, s.full_name, ar.status, ar.attendance_date
        FROM attendance_records ar
        JOIN students s ON ar.student_id = s.student_id
        WHERE ar.class_id = :class_id
        ORDER BY s.roll_no
    """)
    result = db.execute(query, {"class_id": class_id})
    attendance = []
    for row in result:
        attendance.append({
            "student_id": row.student_id,
            "roll_no": row.roll_no,
            "full_name": row.full_name,
            "status": row.status,
            "attendance_date": str(row.attendance_date)
        })
    db.close()
    return attendance

@app.get("/class/{class_id}/attendance-summary")
def get_attendance_summary(class_id: int):
    db = SessionLocal()
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
def get_student_attendance_history(student_id: int):
    db = SessionLocal()
    query = text("""
        SELECT attendance_date, status
        FROM attendance_records
        WHERE student_id = :student_id
        ORDER BY attendance_date DESC
    """)
    result = db.execute(query, {"student_id": student_id})
    history = [{"attendance_date": str(row.attendance_date), "status": row.status} for row in result]
    db.close()
    return history

@app.post("/attendance/mark")
def mark_attendance(data: AttendanceInput):
    db = SessionLocal()
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
        db.close()
        return {"message": "Attendance updated successfully"}

    db.execute(
        text("""
            INSERT INTO attendance_records (student_id, class_id, attendance_date, status, created_at)
            VALUES (:student_id, :class_id, :attendance_date, :status, NOW())
        """),
        {"student_id": data.student_id, "class_id": data.class_id, "attendance_date": data.attendance_date, "status": data.status}
    )
    db.commit()
    db.close()
    return {"message": "Attendance marked successfully"}

@app.get("/class/{class_id}/attendance-registry")
def get_attendance_registry(class_id: int):
    db = SessionLocal()
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
    db.close()
    return students

@app.get("/class/{class_id}/today-attendance")
def get_today_attendance(class_id: int):
    db = SessionLocal()
    today = datetime.now().date()
    result = db.execute(
        text("SELECT student_id, status FROM attendance_records WHERE class_id = :class_id AND attendance_date = :date"),
        {"class_id": class_id, "date": today}
    )
    attendance_map = {row.student_id: row.status for row in result}
    db.close()
    return attendance_map


# --- Student CRUD (API-driven) ---

@app.get("/students")
def get_students():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM students ORDER BY student_id DESC"))
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
    db.close()
    return students

@app.get("/students/{student_id}")
def get_student_profile(student_id: int):
    db = SessionLocal()
    student = db.execute(
        text("SELECT * FROM students WHERE student_id = :id"),
        {"id": student_id}
    ).fetchone()
    if not student:
        db.close()
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

    # Match assigned courses by student department
    assigned_course = db.execute(
        text("SELECT * FROM courses WHERE department = :dept ORDER BY course_id LIMIT 1"),
        {"dept": student.department}
    ).fetchone()

    db.close()
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

@app.post("/students")
def create_student(data: StudentInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO students (roll_no, full_name, email, department, semester, division, created_at)
            VALUES (:roll_no, :full_name, :email, :department, :semester, :division, NOW())
            RETURNING student_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Student", new_id)
    db.close()
    return {"message": "Student created successfully", "student_id": new_id}

@app.put("/students/{student_id}")
def update_student(student_id: int, data: StudentInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "Student", student_id)
    db.close()
    return {"message": "Student updated successfully"}

@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM enrollments WHERE student_id = :id"), {"id": student_id})
    db.execute(text("DELETE FROM students WHERE student_id = :id"), {"id": student_id})
    db.commit()
    log_audit(db, "DELETE", "Student", student_id)
    db.close()
    return {"message": "Student deleted successfully"}


# --- Faculty CRUD ---

@app.get("/faculty")
def get_faculty():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM faculty ORDER BY full_name"))
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
    db.close()
    return faculty

@app.get("/faculty/{faculty_id}")
def get_faculty_profile(faculty_id: int):
    db = SessionLocal()
    faculty = db.execute(
        text("SELECT * FROM faculty WHERE faculty_id = :id"),
        {"id": faculty_id}
    ).fetchone()
    if not faculty:
        db.close()
        raise HTTPException(status_code=404, detail="Faculty not found")

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

    db.close()
    return {
        "faculty_id": faculty.faculty_id,
        "faculty_code": faculty.faculty_code,
        "full_name": faculty.full_name,
        "email": faculty.email,
        "department": faculty.department,
        "designation": faculty.designation,
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

@app.post("/faculty")
def create_faculty(data: FacultyInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO faculty (faculty_code, full_name, email, department, designation, created_at)
            VALUES (:faculty_code, :full_name, :email, :department, :designation, NOW())
            RETURNING faculty_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Faculty", new_id)
    db.close()
    return {"message": "Faculty created successfully", "faculty_id": new_id}

@app.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: int, data: FacultyInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "Faculty", faculty_id)
    db.close()
    return {"message": "Faculty updated successfully"}

@app.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM faculty_assignments WHERE faculty_id = :id"), {"id": faculty_id})
    db.execute(text("DELETE FROM faculty WHERE faculty_id = :id"), {"id": faculty_id})
    db.commit()
    log_audit(db, "DELETE", "Faculty", faculty_id)
    db.close()
    return {"message": "Faculty deleted successfully"}


# --- Faculty Mapping CRUD ---

@app.get("/faculty-mapping")
def get_mappings():
    db = SessionLocal()
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
    db.close()
    return mappings

@app.post("/faculty-mapping")
def create_mapping(data: FacultyMappingInput):
    db = SessionLocal()
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
    log_audit(db, "CREATE", "FacultyAssignment", new_id)
    db.close()
    return {"message": "Faculty assigned successfully", "mapping_id": new_id}

@app.put("/faculty-mapping/{mapping_id}")
def update_mapping(mapping_id: int, data: FacultyMappingInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "FacultyAssignment", mapping_id)
    db.close()
    return {"message": "Mapping updated successfully"}

@app.delete("/faculty-mapping/{mapping_id}")
def delete_mapping(mapping_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM faculty_assignments WHERE assignment_id = :id"), {"id": mapping_id})
    db.commit()
    log_audit(db, "DELETE", "FacultyAssignment", mapping_id)
    db.close()
    return {"message": "Mapping deleted successfully"}


# --- Course CRUD ---

@app.get("/courses")
def get_courses():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM courses ORDER BY course_id DESC"))
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
    db.close()
    return courses

@app.post("/courses")
def create_course(data: CourseInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO courses (course_code, course_title, department, category, duration, enrollment_count, created_at)
            VALUES (:course_code, :course_title, :department, :category, :duration, 0, NOW())
            RETURNING course_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Course", new_id)
    db.close()
    return {"message": "Course created successfully", "course_id": new_id}

@app.put("/courses/{course_id}")
def update_course(course_id: int, data: CourseInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "Course", course_id)
    db.close()
    return {"message": "Course updated successfully"}

@app.delete("/courses/{course_id}")
def delete_course(course_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM course_subject_mapping WHERE course_id = :id"), {"id": course_id})
    db.execute(text("DELETE FROM courses WHERE course_id = :id"), {"id": course_id})
    db.commit()
    log_audit(db, "DELETE", "Course", course_id)
    db.close()
    return {"message": "Course deleted successfully"}


# --- Subject CRUD ---

@app.get("/subjects")
def get_subjects():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM subjects ORDER BY subject_id DESC"))
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
    db.close()
    return subjects

@app.post("/subjects")
def create_subject(data: SubjectInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO subjects (subject_code, subject_name, credits, department, semester, created_at)
            VALUES (:subject_code, :subject_name, :credits, :department, :semester, NOW())
            RETURNING subject_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Subject", new_id)
    db.close()
    return {"message": "Subject created successfully", "subject_id": new_id}

@app.put("/subjects/{subject_id}")
def update_subject(subject_id: int, data: SubjectInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "Subject", subject_id)
    db.close()
    return {"message": "Subject updated successfully"}

@app.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM course_subject_mapping WHERE subject_id = :id"), {"id": subject_id})
    db.execute(text("DELETE FROM faculty_assignments WHERE subject_id = :id"), {"id": subject_id})
    db.execute(text("DELETE FROM subjects WHERE subject_id = :id"), {"id": subject_id})
    db.commit()
    log_audit(db, "DELETE", "Subject", subject_id)
    db.close()
    return {"message": "Subject deleted successfully"}


# --- Class CRUD ---

@app.get("/classes")
def get_classes():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM classes ORDER BY class_name"))
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
    db.close()
    return classes

@app.post("/classes")
def create_class(data: ClassInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO classes (class_name, division, department, semester, term_id, created_at)
            VALUES (:class_name, :division, :department, :semester, :term_id, NOW())
            RETURNING class_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Class", new_id)
    db.close()
    return {"message": "Class created successfully", "class_id": new_id}

@app.put("/classes/{class_id}")
def update_class(class_id: int, data: ClassInput):
    db = SessionLocal()
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
    log_audit(db, "UPDATE", "Class", class_id)
    db.close()
    return {"message": "Class updated successfully"}

@app.delete("/classes/{class_id}")
def delete_class(class_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM enrollments WHERE class_id = :id"), {"id": class_id})
    db.execute(text("DELETE FROM faculty_assignments WHERE class_id = :id"), {"id": class_id})
    db.execute(text("DELETE FROM classes WHERE class_id = :id"), {"id": class_id})
    db.commit()
    log_audit(db, "DELETE", "Class", class_id)
    db.close()
    return {"message": "Class deleted successfully"}


# --- Phase B: Department CRUD & Stats ---

@app.get("/departments")
def get_departments():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM departments ORDER BY department_name"))
    departments = []
    for row in result:
        departments.append({
            "department_id": row.department_id,
            "department_name": row.department_name,
            "department_code": row.department_code
        })
    db.close()
    return departments

@app.post("/departments")
def create_department(data: DepartmentInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO departments (department_name, department_code)
            VALUES (:department_name, :department_code)
            RETURNING department_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Department", new_id)
    db.close()
    return {"message": "Department created successfully", "department_id": new_id}

@app.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentInput):
    db = SessionLocal()
    db.execute(
        text("""
            UPDATE departments
            SET department_name = :department_name, department_code = :department_code
            WHERE department_id = :dept_id
        """),
        {**data.dict(), "dept_id": dept_id}
    )
    db.commit()
    log_audit(db, "UPDATE", "Department", dept_id)
    db.close()
    return {"message": "Department updated successfully"}

@app.delete("/departments/{dept_id}")
def delete_department(dept_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM departments WHERE department_id = :id"), {"id": dept_id})
    db.commit()
    log_audit(db, "DELETE", "Department", dept_id)
    db.close()
    return {"message": "Department deleted successfully"}

@app.get("/departments/stats")
def get_department_stats():
    db = SessionLocal()
    # Simple aggregates joining courses, students, and faculty on department names/codes
    result = db.execute(text("""
        SELECT d.department_id, d.department_name, d.department_code,
               (SELECT COUNT(*) FROM students s WHERE s.department = d.department_code) AS student_count,
               (SELECT COUNT(*) FROM faculty f WHERE f.department = d.department_code) AS faculty_count,
               (SELECT COUNT(*) FROM courses c WHERE c.department = d.department_code OR c.department = d.department_name) AS course_count
        FROM departments d
        ORDER BY d.department_name
    """)).fetchall()
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
    db.close()
    return stats


# --- Phase C: Enrollment Management & History ---

@app.get("/enrollments")
def get_enrollments():
    db = SessionLocal()
    result = db.execute(text("""
        SELECT e.enrollment_id, e.student_id, e.class_id,
               s.full_name AS student_name, s.roll_no, s.department,
               c.class_name, c.semester, c.division
        FROM enrollments e
        JOIN students s ON e.student_id = s.student_id
        JOIN classes c ON e.class_id = c.class_id
        ORDER BY e.enrollment_id DESC
    """))
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

@app.post("/enrollments")
def create_enrollment(data: EnrollmentInput):
    db = SessionLocal()
    # Check if student is already enrolled in this class
    existing = db.execute(
        text("SELECT enrollment_id FROM enrollments WHERE student_id = :sid AND class_id = :cid"),
        {"sid": data.student_id, "cid": data.class_id}
    ).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Student is already enrolled in this class")

    new_id = db.execute(
        text("INSERT INTO enrollments (student_id, class_id, created_at) VALUES (:sid, :cid, NOW()) RETURNING enrollment_id"),
        {"sid": data.student_id, "cid": data.class_id}
    ).scalar()
    db.commit()
    log_audit(db, "ENROLL", "Student", data.student_id)
    db.close()
    return {"message": "Student enrolled successfully", "enrollment_id": new_id}

@app.put("/enrollments/{enrollment_id}")
def transfer_enrollment(enrollment_id: int, data: EnrollmentInput):
    db = SessionLocal()
    # Check current student details
    enrollment = db.execute(
        text("SELECT student_id, class_id FROM enrollments WHERE enrollment_id = :id"),
        {"id": enrollment_id}
    ).fetchone()
    if not enrollment:
        db.close()
        raise HTTPException(status_code=404, detail="Enrollment record not found")

    db.execute(
        text("UPDATE enrollments SET class_id = :cid WHERE enrollment_id = :id"),
        {"cid": data.class_id, "id": enrollment_id}
    )
    db.commit()
    log_audit(db, "TRANSFER", "Student", enrollment.student_id)
    db.close()
    return {"message": "Enrollment transferred successfully"}

@app.delete("/enrollments/{enrollment_id}")
def delete_enrollment(enrollment_id: int):
    db = SessionLocal()
    enrollment = db.execute(
        text("SELECT student_id FROM enrollments WHERE enrollment_id = :id"),
        {"id": enrollment_id}
    ).fetchone()
    if not enrollment:
        db.close()
        raise HTTPException(status_code=404, detail="Enrollment record not found")

    db.execute(text("DELETE FROM enrollments WHERE enrollment_id = :id"), {"id": enrollment_id})
    db.commit()
    log_audit(db, "UNENROLL", "Student", enrollment.student_id)
    db.close()
    return {"message": "Enrollment removed successfully"}

@app.get("/enrollments/history/{student_id}")
def get_enrollment_history(student_id: int):
    db = SessionLocal()
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
    db.close()
    return history


# --- Phase D: Course-Subject Mapping ---

@app.get("/course-subject-mappings")
def get_course_subject_mappings():
    db = SessionLocal()
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
    db.close()
    return mappings

@app.post("/course-subject-mappings")
def create_course_subject_mapping(data: CourseSubjectMappingInput):
    db = SessionLocal()
    existing = db.execute(
        text("SELECT mapping_id FROM course_subject_mapping WHERE course_id = :cid AND subject_id = :sid"),
        {"cid": data.course_id, "sid": data.subject_id}
    ).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Subject is already mapped to this course")

    new_id = db.execute(
        text("INSERT INTO course_subject_mapping (course_id, subject_id, created_at) VALUES (:cid, :sid, NOW()) RETURNING mapping_id"),
        {"cid": data.course_id, "sid": data.subject_id}
    ).scalar()
    db.commit()
    log_audit(db, "MAP_COURSE_SUBJECT", "Course", data.course_id)
    db.close()
    return {"message": "Subject mapped successfully", "mapping_id": new_id}

@app.delete("/course-subject-mappings/{mapping_id}")
def delete_course_subject_mapping(mapping_id: int):
    db = SessionLocal()
    mapping = db.execute(
        text("SELECT course_id FROM course_subject_mapping WHERE mapping_id = :id"),
        {"id": mapping_id}
    ).fetchone()
    if not mapping:
        db.close()
        raise HTTPException(status_code=404, detail="Mapping record not found")

    db.execute(text("DELETE FROM course_subject_mapping WHERE mapping_id = :id"), {"id": mapping_id})
    db.commit()
    log_audit(db, "UNMAP_COURSE_SUBJECT", "Course", mapping.course_id)
    db.close()
    return {"message": "Mapping removed successfully"}


# --- Phase E: Announcement Center ---

@app.get("/announcements")
def get_announcements(target_type: Optional[str] = None):
    db = SessionLocal()
    if target_type:
        query = text("SELECT * FROM announcements WHERE target_type = :target_type ORDER BY announcement_id DESC")
        result = db.execute(query, {"target_type": target_type})
    else:
        query = text("SELECT * FROM announcements ORDER BY announcement_id DESC")
        result = db.execute(query)

    announcements = []
    for r in result:
        announcements.append({
            "announcement_id": r.announcement_id,
            "title": r.title,
            "description": r.description,
            "target_type": r.target_type,
            "created_at": str(r.created_at)
        })
    db.close()
    return announcements

@app.post("/announcements")
def create_announcement(data: AnnouncementInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO announcements (title, description, target_type, created_at)
            VALUES (:title, :description, :target_type, NOW())
            RETURNING announcement_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "Announcement", new_id)
    db.close()
    return {"message": "Announcement created successfully", "announcement_id": new_id}

@app.put("/announcements/{announcement_id}")
def update_announcement(announcement_id: int, data: AnnouncementInput):
    db = SessionLocal()
    db.execute(
        text("""
            UPDATE announcements
            SET title = :title, description = :description, target_type = :target_type
            WHERE announcement_id = :announcement_id
        """),
        {**data.dict(), "announcement_id": announcement_id}
    )
    db.commit()
    log_audit(db, "UPDATE", "Announcement", announcement_id)
    db.close()
    return {"message": "Announcement updated successfully"}

@app.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM announcements WHERE announcement_id = :id"), {"id": announcement_id})
    db.commit()
    log_audit(db, "DELETE", "Announcement", announcement_id)
    db.close()
    return {"message": "Announcement deleted successfully"}


# --- Phase F: Faculty Workload & Audit Logs & Dashboard Stats ---

@app.get("/faculty/{faculty_id}/workload")
def get_faculty_workload(faculty_id: int):
    db = SessionLocal()
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

    db.close()
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

@app.get("/audit-logs")
def get_audit_logs():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM audit_logs ORDER BY log_id DESC LIMIT 100"))
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
    db.close()
    return logs

@app.get("/admin/dashboard-stats")
def get_admin_dashboard_stats():
    db = SessionLocal()
    
    # Counts
    student_count = db.execute(text("SELECT COUNT(*) FROM students")).scalar() or 0
    faculty_count = db.execute(text("SELECT COUNT(*) FROM faculty")).scalar() or 0
    course_count = db.execute(text("SELECT COUNT(*) FROM courses")).scalar() or 0
    subject_count = db.execute(text("SELECT COUNT(*) FROM subjects")).scalar() or 0
    class_count = db.execute(text("SELECT COUNT(*) FROM classes")).scalar() or 0
    
    # Recent Activities from Audit Logs
    activities_result = db.execute(text("""
        SELECT action, entity_type, entity_id, performed_by, created_at 
        FROM audit_logs 
        ORDER BY log_id DESC LIMIT 8
    """)).fetchall()
    
    activities = []
    for act in activities_result:
        # Convert timestamp to user-friendly label
        time_str = act.created_at.strftime("%H:%M:%S") if act.created_at else ""
        activities.append({
            "action": act.action,
            "entity_type": act.entity_type,
            "entity_id": act.entity_id,
            "performed_by": act.performed_by,
            "timestamp": time_str,
            "text": f"{act.performed_by} performed {act.action} on {act.entity_type} (ID: {act.entity_id})"
        })
        
    # Department distribution for charts
    dept_result = db.execute(text("""
        SELECT s.department, COUNT(*) as count 
        FROM students s 
        GROUP BY s.department
    """)).fetchall()
    dept_distribution = [{"branch": r.department or "Unknown", "score": r.count} for r in dept_result]

    db.close()
    return {
        "total_students": student_count,
        "total_faculty": faculty_count,
        "total_courses": course_count,
        "total_subjects": subject_count,
        "total_classes": class_count,
        "recent_activities": activities,
        "department_distribution": dept_distribution
    }


# --- Academic Terms CRUD ---

@app.get("/academic-terms")
def get_academic_terms():
    db = SessionLocal()
    result = db.execute(text("SELECT * FROM academic_terms ORDER BY academic_year DESC, semester ASC"))
    terms = []
    for r in result:
        terms.append({
            "term_id": r.term_id,
            "academic_year": r.academic_year,
            "semester": r.semester
        })
    db.close()
    return terms

@app.post("/academic-terms")
def create_academic_term(data: AcademicTermInput):
    db = SessionLocal()
    new_id = db.execute(
        text("""
            INSERT INTO academic_terms (academic_year, semester, created_at)
            VALUES (:academic_year, :semester, NOW())
            RETURNING term_id
        """),
        data.dict()
    ).scalar()
    db.commit()
    log_audit(db, "CREATE", "AcademicTerm", new_id)
    db.close()
    return {"message": "Academic term created successfully", "term_id": new_id}

@app.put("/academic-terms/{term_id}")
def update_academic_term(term_id: int, data: AcademicTermInput):
    db = SessionLocal()
    db.execute(
        text("""
            UPDATE academic_terms
            SET academic_year = :academic_year, semester = :semester
            WHERE term_id = :term_id
        """),
        {**data.dict(), "term_id": term_id}
    )
    db.commit()
    log_audit(db, "UPDATE", "AcademicTerm", term_id)
    db.close()
    return {"message": "Academic term updated successfully"}

@app.delete("/academic-terms/{term_id}")
def delete_academic_term(term_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM academic_terms WHERE term_id = :id"), {"id": term_id})
    db.commit()
    log_audit(db, "DELETE", "AcademicTerm", term_id)
    db.close()
    return {"message": "Academic term deleted successfully"}


# --- System Settings (Admin Settings Center) ---

@app.get("/admin/settings")
def get_admin_settings():
    db = SessionLocal()
    result = db.execute(text("SELECT setting_key, setting_value FROM system_settings")).fetchall()
    
    settings = {
        "institution_name": "Apex Educational Academy",
        "institution_logo": "",
        "academic_year": "2023-2024",
        "contact_email": "admin@apex.edu",
        "contact_phone": "+1-123-456-7890",
        "branding_color": "emerald",
        "theme_preference": "dark"
    }
    
    # Override defaults with DB settings if present
    for row in result:
        if row.setting_key in settings:
            settings[row.setting_key] = row.setting_value
            
    db.close()
    return settings

@app.post("/admin/settings")
def update_admin_settings(data: SystemSettingsInput):
    db = SessionLocal()
    settings_dict = data.dict()
    
    for key, val in settings_dict.items():
        # Check if setting exists
        val_str = str(val) if val is not None else ""
        existing = db.execute(
            text("SELECT setting_id FROM system_settings WHERE setting_key = :key"),
            {"key": key}
        ).fetchone()
        
        if existing:
            db.execute(
                text("UPDATE system_settings SET setting_value = :val, updated_at = NOW() WHERE setting_key = :key"),
                {"val": val_str, "key": key}
            )
        else:
            db.execute(
                text("INSERT INTO system_settings (setting_key, setting_value, updated_at) VALUES (:key, :val, NOW())"),
                {"key": key, "val": val_str}
            )
            
    db.commit()
    log_audit(db, "UPDATE_SETTINGS", "SystemSettings", None)
    db.close()
    return {"message": "System settings updated successfully"}
