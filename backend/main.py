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

    sender_type: str
    sender_id: int

    target_type: str
    target_id: Optional[int] = None

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

    "sender_type": r.sender_type,
    "sender_id": r.sender_id,

    "target_type": r.target_type,
    "target_id": r.target_id,

    "created_at": str(r.created_at)
        })
    db.close()
    return announcements

@app.post("/announcements")
def create_announcement(data: AnnouncementInput):

    db = SessionLocal()

    new_id = db.execute(
        text("""
            INSERT INTO announcements
            (
                title,
                description,

                sender_type,
                sender_id,

                target_type,
                target_id,

                created_at
            )
            VALUES
            (
                :title,
                :description,

                :sender_type,
                :sender_id,

                :target_type,
                :target_id,

                NOW()
            )
            RETURNING announcement_id
        """),
        data.dict()
    ).scalar()

    db.commit()

    log_audit(
        db,
        "CREATE",
        "Announcement",
        new_id
    )

    db.close()

    return {
        "message": "Announcement created successfully",
        "announcement_id": new_id
    }

@app.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    data: AnnouncementInput
):

    db = SessionLocal()

    db.execute(
        text("""
            UPDATE announcements
            SET
                title = :title,
                description = :description,

                sender_type = :sender_type,
                sender_id = :sender_id,

                target_type = :target_type,
                target_id = :target_id

            WHERE announcement_id = :announcement_id
        """),
        {
            **data.dict(),
            "announcement_id": announcement_id
        }
    )

    db.commit()

    log_audit(
        db,
        "UPDATE",
        "Announcement",
        announcement_id
    )

    db.close()

    return {
        "message": "Announcement updated successfully"
    }

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


# --- Pydantic Schemas for V1 Teacher Portal ---
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

class GradeSubmissionInput(BaseModel):
    marks_obtained: int
    status: str
    faculty_id: int

class StudentSubmissionInput(BaseModel):
    student_id: int
    submission_url: str

class StudentMarkEntry(BaseModel):
    student_id: int
    assignment_marks: float
    quiz_marks: float
    internal_marks: float
    practical_marks: float

class BulkMarksInput(BaseModel):
    class_id: int
    subject_id: int
    faculty_id: int
    marks_list: List[StudentMarkEntry]

class RunRiskEngineInput(BaseModel):
    class_id: int
    faculty_id: int


# --- Teacher Portal V1 Endpoints ---

@app.get("/faculty/by-email/{email}")
def get_faculty_by_email(email: str):
    db = SessionLocal()
    try:
        faculty = db.execute(
            text("SELECT * FROM faculty WHERE email = :email"),
            {"email": email}
        ).fetchone()
        
        if not faculty:
            # If default demo account or specific domain, auto-create to ensure login flows
            if email == "teacher@neurolearn.ai":
                new_id = db.execute(
                    text("""
                        INSERT INTO faculty (faculty_code, full_name, email, department, designation, created_at)
                        VALUES ('FAC100', 'Dr. Alok Verma', 'teacher@neurolearn.ai', 'Computer Engineering', 'Professor & Head', NOW())
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
def get_mapping_audit():
    db = SessionLocal()
    try:
        # 1. Detect broken mappings (assignments pointing to deleted / missing records)
        broken = db.execute(text("""
            SELECT fa.assignment_id, fa.faculty_id, fa.class_id, fa.subject_id
            FROM faculty_assignments fa
            LEFT JOIN faculty f ON fa.faculty_id = f.faculty_id
            LEFT JOIN classes c ON fa.class_id = c.class_id
            LEFT JOIN subjects s ON fa.subject_id = s.subject_id
            WHERE f.faculty_id IS NULL OR c.class_id IS NULL OR s.subject_id IS NULL
        """)).fetchall()
        
        # 2. Detect duplicate mappings
        duplicates = db.execute(text("""
            SELECT faculty_id, class_id, subject_id, academic_year, COUNT(*)
            FROM faculty_assignments
            GROUP BY faculty_id, class_id, subject_id, academic_year
            HAVING COUNT(*) > 1
        """)).fetchall()
        
        # 3. Detect orphan records in tables referencing deleted faculty
        orphans = db.execute(text("""
            SELECT a.assignment_id, a.title, a.class_id, a.subject_id
            FROM assignments a
            LEFT JOIN classes c ON a.class_id = c.class_id
            LEFT JOIN subjects s ON a.subject_id = s.subject_id
            WHERE c.class_id IS NULL OR s.subject_id IS NULL
        """)).fetchall()

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
def get_attendance_records(class_id: int, subject_id: int, date: str):
    db = SessionLocal()
    try:
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
def save_attendance(data: AttendanceSaveInput):
    db = SessionLocal()
    try:
        # Ownership Verification: Check if this faculty is assigned to this class and subject
        mapping = db.execute(text("""
            SELECT assignment_id, academic_year FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": data.faculty_id, "cid": data.class_id, "sid": data.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="Access Denied: You are not assigned to this class/subject.")
            
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
                    VALUES (:student_id, :class_id, :subject_id, :faculty_id, :attendance_date, :status, NOW())
                """), {
                    "student_id": rec.student_id,
                    "class_id": data.class_id,
                    "subject_id": data.subject_id,
                    "faculty_id": data.faculty_id,
                    "attendance_date": data.date,
                    "status": rec.status
                })
        
        db.commit()
        log_audit(db, "MARK_ATTENDANCE", "Class", data.class_id, f"Faculty {data.faculty_id}")
        return {"message": "Attendance records saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/attendance/history")
def get_attendance_history(class_id: int, subject_id: int):
    db = SessionLocal()
    try:
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
def get_monthly_attendance_report(class_id: int, subject_id: int, month: int, year: int):
    db = SessionLocal()
    try:
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

@app.get("/teacher/{faculty_id}/students")
def get_teacher_students(faculty_id: int):
    db = SessionLocal()
    try:
        # Get all classes assigned to teacher
        classes = db.execute(text("""
            SELECT class_id FROM faculty_assignments WHERE faculty_id = :fid
        """), {"fid": faculty_id}).fetchall()
        
        class_ids = [c.class_id for c in classes]
        if not class_ids:
            return []
            
        # Get students in these classes
        students = db.execute(text("""
            SELECT DISTINCT s.student_id, s.roll_no, s.full_name, s.department, s.semester, s.division,
                   sm.attendance, sm.quiz_score, sm.risk_level, sm.predicted_cgpa, sm.xp_points
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
                "xp_points": row.xp_points or 0
            } for row in students
        ]
    finally:
        db.close()

@app.get("/student/{student_id}/profile")
def get_student_profile_v1(student_id: int):
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
        marks = db.execute(text("""
            SELECT m.*, s.subject_name
            FROM student_marks m
            JOIN subjects s ON m.subject_id = s.subject_id
            WHERE m.student_id = :id
        """), {"id": student_id}).fetchall()
        
        # Risk predictions history
        risk_hist = db.execute(text("""
            SELECT risk_level, prediction_reason, created_at FROM risk_predictions
            WHERE student_id = :id ORDER BY created_at DESC LIMIT 5
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
                "xp_points": metrics.xp_points if metrics else 0
            },
            "assignment_stats": {
                "submitted": sub_stats.get("Submitted", 0),
                "pending": sub_stats.get("Pending", 0),
                "late": sub_stats.get("Late", 0)
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
            ]
        }
    finally:
        db.close()

@app.get("/assignments")
def get_assignments(class_id: int, subject_id: int):
    db = SessionLocal()
    try:
        assignments = db.execute(text("""
            SELECT * FROM assignments WHERE class_id = :cid AND subject_id = :sid ORDER BY created_at DESC
        """), {"cid": class_id, "sid": subject_id}).fetchall()
        
        return [
            {
                "assignment_id": a.assignment_id,
                "subject_id": a.subject_id,
                "class_id": a.class_id,
                "title": a.title,
                "description": a.description,
                "due_date": str(a.due_date),
                "total_marks": a.total_marks,
                "created_at": str(a.created_at)
            } for a in assignments
        ]
    finally:
        db.close()

@app.post("/assignments")
def create_assignment(data: AssignmentCreateInput):
    db = SessionLocal()
    try:
        # Check ownership
        mapping = db.execute(text("""
            SELECT assignment_id FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": data.faculty_id, "cid": data.class_id, "sid": data.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="You are not authorized to create assignments for this class.")
            
        new_id = db.execute(text("""
            INSERT INTO assignments (subject_id, class_id, title, description, due_date, total_marks, created_at)
            VALUES (:sid, :cid, :title, :desc, :due, :marks, NOW())
            RETURNING assignment_id
        """), {
            "sid": data.subject_id,
            "cid": data.class_id,
            "title": data.title,
            "desc": data.description,
            "due": data.due_date,
            "marks": data.total_marks
        }).scalar()
        
        # Seed default pending submissions for all students in this class
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
            
        db.commit()
        log_audit(db, "CREATE_ASSIGNMENT", "Assignment", new_id, f"Faculty {data.faculty_id}")
        return {"message": "Assignment created successfully", "assignment_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: int, data: AssignmentCreateInput):
    db = SessionLocal()
    try:
        # Check assignment exists
        assign = db.execute(text("SELECT class_id, subject_id FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        # Check ownership
        mapping = db.execute(text("""
            SELECT assignment_id FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": data.faculty_id, "cid": assign.class_id, "sid": assign.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="You do not own this class and cannot edit this assignment.")
            
        db.execute(text("""
            UPDATE assignments
            SET title = :title, description = :desc, due_date = :due, total_marks = :marks
            WHERE assignment_id = :id
        """), {
            "title": data.title,
            "desc": data.description,
            "due": data.due_date,
            "marks": data.total_marks,
            "id": assignment_id
        })
        db.commit()
        log_audit(db, "UPDATE_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {data.faculty_id}")
        return {"message": "Assignment updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: int, faculty_id: int):
    db = SessionLocal()
    try:
        assign = db.execute(text("SELECT class_id, subject_id FROM assignments WHERE assignment_id = :id"), {"id": assignment_id}).fetchone()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        # Check ownership
        mapping = db.execute(text("""
            SELECT assignment_id FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": faculty_id, "cid": assign.class_id, "sid": assign.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="You do not own this class and cannot delete this assignment.")
            
        db.execute(text("DELETE FROM assignment_submissions WHERE assignment_id = :id"), {"id": assignment_id})
        db.execute(text("DELETE FROM assignments WHERE assignment_id = :id"), {"id": assignment_id})
        db.commit()
        log_audit(db, "DELETE_ASSIGNMENT", "Assignment", assignment_id, f"Faculty {faculty_id}")
        return {"message": "Assignment deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/assignments/{assignment_id}/submissions")
def get_assignment_submissions(assignment_id: int):
    db = SessionLocal()
    try:
        submissions = db.execute(text("""
            SELECT asub.submission_id, asub.assignment_id, asub.student_id, asub.submission_url,
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
def grade_submission(submission_id: int, data: GradeSubmissionInput):
    db = SessionLocal()
    try:
        sub = db.execute(text("""
            SELECT a.class_id, a.subject_id, asub.student_id FROM assignment_submissions asub
            JOIN assignments a ON asub.assignment_id = a.assignment_id
            WHERE asub.submission_id = :sid
        """), {"sid": submission_id}).fetchone()
        
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        # Check ownership
        mapping = db.execute(text("""
            SELECT assignment_id FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": data.faculty_id, "cid": sub.class_id, "sid": sub.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="You do not own this class and cannot grade this submission.")
            
        db.execute(text("""
            UPDATE assignment_submissions
            SET marks_obtained = :marks, status = :status
            WHERE submission_id = :sid
        """), {"marks": data.marks_obtained, "status": data.status, "sid": submission_id})
        
        # Automatically update marks in student_marks table
        class_info = db.execute(text("SELECT term_id FROM classes WHERE class_id = :id"), {"id": sub.class_id}).fetchone()
        term_id = class_info.term_id if class_info else None
        
        existing_mark = db.execute(text("""
            SELECT mark_id FROM student_marks
            WHERE student_id = :sid AND class_id = :cid AND subject_id = :sub_id
        """), {"sid": sub.student_id, "cid": sub.class_id, "sub_id": sub.subject_id}).fetchone()
        
        if existing_mark:
            db.execute(text("""
                UPDATE student_marks
                SET assignment_marks = :marks, updated_at = NOW()
                WHERE mark_id = :mid
            """), {"marks": data.marks_obtained, "mid": existing_mark.mark_id})
        else:
            db.execute(text("""
                INSERT INTO student_marks (student_id, class_id, subject_id, term_id, assignment_marks, quiz_marks, internal_marks, practical_marks, total_marks, grade, created_at, updated_at)
                VALUES (:sid, :cid, :sub_id, :tid, :marks, 0.0, 0.0, 0.0, :marks, 'F', NOW(), NOW())
            """), {"sid": sub.student_id, "cid": sub.class_id, "sub_id": sub.subject_id, "tid": term_id, "marks": data.marks_obtained})
            
        db.commit()
        log_audit(db, "GRADE_SUBMISSION", "Submission", submission_id, f"Faculty {data.faculty_id}")
        return {"message": "Submission graded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/assignments/{assignment_id}/submit")
def submit_assignment(assignment_id: int, data: StudentSubmissionInput):
    db = SessionLocal()
    try:
        # Locate submission row for student/assignment
        row = db.execute(text("""
            SELECT submission_id FROM assignment_submissions
            WHERE assignment_id = :aid AND student_id = :sid
        """), {"aid": assignment_id, "sid": data.student_id}).fetchone()
        
        # Determine status (Submitted / Late) based on due date
        due_date = db.execute(text("SELECT due_date FROM assignments WHERE assignment_id = :aid"), {"aid": assignment_id}).scalar()
        status = "Submitted"
        if due_date and datetime.now().date() > due_date:
            status = "Late"
            
        if row:
            db.execute(text("""
                UPDATE assignment_submissions
                SET submission_url = :url, status = :status, submitted_at = NOW()
                WHERE submission_id = :sid
            """), {"url": data.submission_url, "status": status, "sid": row.submission_id})
        else:
            db.execute(text("""
                INSERT INTO assignment_submissions (assignment_id, student_id, submission_url, status, submitted_at)
                VALUES (:aid, :sid, :url, :status, NOW())
            """), {"aid": assignment_id, "sid": data.student_id, "url": data.submission_url, "status": status})
        db.commit()
        return {"message": "Assignment work uploaded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/marks")
def get_student_marks(class_id: int, subject_id: int):
    db = SessionLocal()
    try:
        students = db.execute(text("""
            SELECT s.student_id, s.roll_no, s.full_name
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            WHERE e.class_id = :cid
            ORDER BY s.roll_no
        """), {"cid": class_id}).fetchall()
        
        marks = db.execute(text("""
            SELECT * FROM student_marks WHERE class_id = :cid AND subject_id = :sid
        """), {"cid": class_id, "sid": subject_id}).fetchall()
        
        marks_map = {m.student_id: m for m in marks}
        
        records = []
        for s in students:
            m = marks_map.get(s.student_id)
            records.append({
                "student_id": s.student_id,
                "roll_no": s.roll_no,
                "full_name": s.full_name,
                "assignment_marks": float(m.assignment_marks) if m else 0.0,
                "quiz_marks": float(m.quiz_marks) if m else 0.0,
                "internal_marks": float(m.internal_marks) if m else 0.0,
                "practical_marks": float(m.practical_marks) if m else 0.0,
                "total_marks": float(m.total_marks) if m else 0.0,
                "grade": m.grade if m else "F"
            })
            
        return records
    finally:
        db.close()

@app.post("/marks/bulk-entry")
def save_student_marks_bulk(data: BulkMarksInput):
    db = SessionLocal()
    try:
        # Check ownership
        mapping = db.execute(text("""
            SELECT assignment_id FROM faculty_assignments
            WHERE faculty_id = :fid AND class_id = :cid AND subject_id = :sid
        """), {"fid": data.faculty_id, "cid": data.class_id, "sid": data.subject_id}).fetchone()
        
        if not mapping:
            raise HTTPException(status_code=403, detail="You do not own this class and cannot enter marks.")
            
        class_info = db.execute(text("SELECT term_id FROM classes WHERE class_id = :id"), {"id": data.class_id}).fetchone()
        term_id = class_info.term_id if class_info else None
        
        for entry in data.marks_list:
            total = entry.assignment_marks + entry.quiz_marks + entry.internal_marks + entry.practical_marks
            
            # Grade Calculation Rule:
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
                        total_marks = :total, grade = :grade, updated_at = NOW()
                    WHERE mark_id = :mid
                """), {
                    "a": entry.assignment_marks,
                    "q": entry.quiz_marks,
                    "i": entry.internal_marks,
                    "p": entry.practical_marks,
                    "total": total,
                    "grade": grade,
                    "mid": existing.mark_id
                })
            else:
                db.execute(text("""
                    INSERT INTO student_marks (student_id, class_id, subject_id, term_id, assignment_marks, quiz_marks, internal_marks, practical_marks, total_marks, grade, created_at, updated_at)
                    VALUES (:sid, :cid, :sub_id, :tid, :a, :q, :i, :p, :total, :grade, NOW(), NOW())
                """), {
                    "sid": entry.student_id,
                    "cid": data.class_id,
                    "sub_id": data.subject_id,
                    "tid": term_id,
                    "a": entry.assignment_marks,
                    "q": entry.quiz_marks,
                    "i": entry.internal_marks,
                    "p": entry.practical_marks,
                    "total": total,
                    "grade": grade
                })
                
        db.commit()
        log_audit(db, "SAVE_MARKS", "Class", data.class_id, f"Faculty {data.faculty_id}")
        return {"message": "Marks entered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/teacher/run-risk-engine")
def run_risk_engine(data: RunRiskEngineInput):
    db = SessionLocal()
    try:
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
            
            # 3. Get low marks (average marks in student_marks < 50)
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
                VALUES (:sid, :cid, :score, :level, :att_score, :q_score, :reason, 'Rule-Based V1.0', NOW())
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
                SET attendance = :att, quiz_score = :quiz, risk_level = :level, updated_at = NOW()
                WHERE student_id = :sid
            """), {
                "att": att_rate,
                "quiz": avg_marks,
                "level": risk_level,
                "sid": s.student_id
            })
            
            risk_count += 1
            
        db.commit()
        log_audit(db, "RUN_RISK_ENGINE", "Class", data.class_id, f"Faculty {data.faculty_id}")
        return {"message": f"Risk engine successfully analyzed {risk_count} students."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/teacher/{faculty_id}/analytics")
def get_teacher_analytics(faculty_id: int):
    db = SessionLocal()
    try:
        # Load classes assigned to teacher
        classes = db.execute(text("""
            SELECT fa.class_id, fa.subject_id, c.class_name, s.subject_name
            FROM faculty_assignments fa
            JOIN classes c ON fa.class_id = c.class_id
            JOIN subjects s ON fa.subject_id = s.subject_id
            WHERE fa.faculty_id = :fid
        """), {"fid": faculty_id}).fetchall()
        
        class_ids = [c.class_id for c in classes]
        if not class_ids:
            return {
                "attendance_trend": [],
                "performance_trend": [],
                "top_students": [],
                "weak_students": [],
                "subject_averages": []
            }
            
        # 1. Attendance Trend
        att_trend = db.execute(text("""
            SELECT attendance_date,
                   ROUND(AVG(CASE WHEN status = 'Present' THEN 100.0 ELSE 0.0 END), 2) as attendance_rate
            FROM attendance_records
            WHERE class_id IN :cids
            GROUP BY attendance_date
            ORDER BY attendance_date DESC
            LIMIT 10
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
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
            SELECT s.full_name, sm.quiz_score as score, s.roll_no, s.department
            FROM students s
            JOIN enrollments e ON s.student_id = e.student_id
            JOIN student_metrics sm ON s.student_id = sm.student_id
            WHERE e.class_id IN :cids
            ORDER BY sm.quiz_score DESC
            LIMIT 5
        """).bindparams(cids=tuple(class_ids))).fetchall()
        
        # 4. Weak students
        weak_students = db.execute(text("""
            SELECT s.full_name, sm.quiz_score as score, s.roll_no, s.department, sm.risk_level
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

        return {
            "attendance_trend": [
                {"date": str(a.attendance_date), "rate": float(a.attendance_rate)}
                for a in reversed(att_trend)
            ],
            "performance_trend": [
                {"branch": p.branch, "attendance": float(p.attendance), "average": float(p.average)}
                for p in perf_trend
            ],
            "top_students": [
                {"name": t.full_name, "score": float(t.score) if t.score else 0.0, "roll": t.roll_no, "branch": t.department}
                for t in top_students
            ],
            "weak_students": [
                {"name": w.full_name, "score": float(w.score) if w.score else 0.0, "roll": w.roll_no, "branch": w.department, "risk": w.risk_level}
                for w in weak_students
            ],
            "subject_averages": subj_perf
        }
    finally:
        db.close()

