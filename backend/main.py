from datetime import datetime
from fastapi import FastAPI
import joblib
from pathlib import Path
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from backend.database import SessionLocal
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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent

student_model = joblib.load(
    BASE_DIR /
    "models" /
    "academic" /
    "student_performance_rf.pkl"
)

@app.get("/")
def home():
    return {
        "message": "NeuroLearn AI Backend Running"
    }

@app.get("/model-status")
def model_status():
    return {
        "student_performance": "loaded"
    }

@app.get("/predict-test")
def predict_test():
    return {
        "predicted_grade": 14.8
    }

@app.post("/predict/student-performance")
def predict_student_performance(data: StudentPerformanceInput):

    prediction = student_model.predict([
        [
            0,  # school
            0,  # sex
            data.age,
            0,  # address
            0,  # famsize
            0,  # Pstatus
            2,  # Medu
            2,  # Fedu
            0,  # Mjob
            0,  # Fjob
            0,  # reason
            0,  # guardian
            1,  # traveltime
            data.studytime,
            data.failures,
            0, 0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 1, 1, 3,
            data.absences,
            data.G1,
            data.G2,
            0   # course_type
        ]
    ])

    return {
        "predicted_grade": round(float(prediction[0]), 2)
    }

@app.get("/teacher/{faculty_id}/classes")
def get_teacher_classes(faculty_id: int):

    db = SessionLocal()

    query = text("""
        SELECT
            c.class_id,
            c.class_name,
            s.subject_name,
            fa.role
        FROM faculty_assignments fa
        JOIN classes c
            ON fa.class_id = c.class_id
        JOIN subjects s
            ON fa.subject_id = s.subject_id
        WHERE fa.faculty_id = :faculty_id
    """)

    result = db.execute(
        query,
        {"faculty_id": faculty_id}
    )

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
        SELECT
            s.student_id,
            s.roll_no,
            s.full_name,
            s.email,
            s.department,
            s.semester,
            s.division
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

    db.close()

    return students

@app.get("/class/{class_id}/student-metrics")
def get_class_student_metrics(class_id: int):

    db = SessionLocal()

    query = text("""
        SELECT
            s.student_id,
            s.roll_no,
            s.full_name,
            s.department,
            s.semester,
            s.division,

            sm.attendance,
            sm.quiz_score,
            sm.risk_level,
            sm.predicted_cgpa,
            sm.xp_points

        FROM students s

        JOIN enrollments e
            ON s.student_id = e.student_id

        JOIN student_metrics sm
            ON s.student_id = sm.student_id

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

            "attendance": float(row.attendance),
            "quiz_score": float(row.quiz_score),
            "risk_level": row.risk_level,
            "predicted_cgpa": float(row.predicted_cgpa),
            "xp_points": row.xp_points
        })
        

    db.close()
    

    return students

@app.get("/class/{class_id}/dashboard-summary")
def get_dashboard_summary(class_id: int):

    db = SessionLocal()

    query = text("""
        SELECT

            COUNT(*) AS total_students,

            ROUND(AVG(sm.attendance), 2) AS average_attendance,

            ROUND(AVG(sm.quiz_score), 2) AS average_quiz_score,

            SUM(
                CASE
                    WHEN sm.risk_level = 'High'
                    THEN 1
                    ELSE 0
                END
            ) AS high_risk_students,

            SUM(
                CASE
                    WHEN sm.risk_level = 'Medium'
                    THEN 1
                    ELSE 0
                END
            ) AS medium_risk_students,

            SUM(
                CASE
                    WHEN sm.risk_level = 'Low'
                    THEN 1
                    ELSE 0
                END
            ) AS low_risk_students

        FROM enrollments e

        JOIN student_metrics sm
            ON e.student_id = sm.student_id

        WHERE e.class_id = :class_id
    """)

    result = db.execute(
        query,
        {"class_id": class_id}
    ).fetchone()

    db.close()

    return {
        "total_students": result.total_students,
        "average_attendance": float(result.average_attendance or 0),
        "average_quiz_score": float(result.average_quiz_score or 0),
        "high_risk_students": result.high_risk_students,
        "medium_risk_students": result.medium_risk_students,
        "low_risk_students": result.low_risk_students,
        "students_at_risk":
            (result.high_risk_students or 0)
            +
            (result.medium_risk_students or 0)
    }
@app.get("/class/{class_id}/attendance")
def get_class_attendance(class_id: int):

    db = SessionLocal()

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

    db.close()

    return attendance
    
@app.get("/class/{class_id}/attendance-summary")
def get_attendance_summary(class_id: int):

    db = SessionLocal()

    query = text("""
        SELECT

            COUNT(*) AS total_records,

            SUM(
                CASE
                    WHEN status = 'Present'
                    THEN 1
                    ELSE 0
                END
            ) AS present_count,

            SUM(
                CASE
                    WHEN status = 'Absent'
                    THEN 1
                    ELSE 0
                END
            ) AS absent_count,

            SUM(
                CASE
                    WHEN status = 'Late'
                    THEN 1
                    ELSE 0
                END
            ) AS late_count

        FROM attendance_records

        WHERE class_id = :class_id
    """)

    result = db.execute(
        query,
        {"class_id": class_id}
    ).fetchone()

    db.close()

    total = result.total_records or 0
    present = result.present_count or 0

    attendance_rate = 0

    if total > 0:
        attendance_rate = round(
            (present / total) * 100,
            2
        )

    return {
        "total_records": total,
        "present_count": present,
        "absent_count": result.absent_count or 0,
        "late_count": result.late_count or 0,
        "attendance_rate": attendance_rate
    }    
@app.get("/student/{student_id}/attendance-history")
def get_student_attendance_history(student_id: int):

    db = SessionLocal()

    query = text("""
        SELECT
            attendance_date,
            status
        FROM attendance_records
        WHERE student_id = :student_id
        ORDER BY attendance_date DESC
    """)

    result = db.execute(
        query,
        {"student_id": student_id}
    )

    history = []

    for row in result:
        history.append({
            "attendance_date": str(row.attendance_date),
            "status": row.status
        })

    db.close()

    return history

@app.post("/attendance/mark")
def mark_attendance(data: AttendanceInput):

    db = SessionLocal()

    existing = db.execute(
        text("""
            SELECT attendance_id
            FROM attendance_records
            WHERE student_id = :student_id
            AND class_id = :class_id
            AND attendance_date = :attendance_date
        """),
        {
            "student_id": data.student_id,
            "class_id": data.class_id,
            "attendance_date": data.attendance_date
        }
    ).fetchone()

    if existing:

        db.execute(
            text("""
                UPDATE attendance_records
                SET status = :status
                WHERE attendance_id = :attendance_id
            """),
            {
                "status": data.status,
                "attendance_id": existing.attendance_id
            }
        )

        db.commit()
        db.close()

        return {
            "message": "Attendance updated successfully"
        }

    db.execute(
        text("""
            INSERT INTO attendance_records
            (
                student_id,
                class_id,
                attendance_date,
                status
            )
            VALUES
            (
                :student_id,
                :class_id,
                :attendance_date,
                :status
            )
        """),
        {
            "student_id": data.student_id,
            "class_id": data.class_id,
            "attendance_date": data.attendance_date,
            "status": data.status
        }
    )

    db.commit()
    db.close()

    return {
        "message": "Attendance marked successfully"
    }

@app.get("/class/{class_id}/attendance-registry")
def get_attendance_registry(class_id: int):

    db = SessionLocal()

    query = text("""
        SELECT

            s.student_id,
            s.roll_no,
            s.full_name,

            COUNT(
                CASE
                    WHEN ar.status = 'Present'
                    THEN 1
                END
            ) AS present_count,

            COUNT(
                CASE
                    WHEN ar.status = 'Absent'
                    THEN 1
                END
            ) AS absent_count,

            COUNT(
                CASE
                    WHEN ar.status = 'Late'
                    THEN 1
                END
            ) AS late_count,

            ROUND(
                (
                    COUNT(
                        CASE
                            WHEN ar.status = 'Present'
                            THEN 1
                        END
                    )::numeric
                    /
                    COUNT(*)::numeric
                ) * 100,
                2
            ) AS attendance_percentage

        FROM attendance_records ar

        JOIN students s
            ON ar.student_id = s.student_id

        WHERE ar.class_id = :class_id

        GROUP BY
            s.student_id,
            s.roll_no,
            s.full_name

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
            "present_count": row.present_count,
            "absent_count": row.absent_count,
            "late_count": row.late_count,
            "attendance_percentage": float(row.attendance_percentage)
        })

    db.close()

    return students

@app.get("/class/{class_id}/today-attendance")
def get_today_attendance(class_id: int):
    db = SessionLocal()

    today = datetime.now().date()

    query = text("""
        SELECT 
            student_id,
            status
        FROM attendance_records
        WHERE class_id = :class_id
        AND attendance_date = :attendance_date
    """)

    result = db.execute(
        query,
        {
            "class_id": class_id,
            "attendance_date": today
        }
    )

    attendance_map = {}

    for row in result:
        attendance_map[row.student_id] = row.status

    db.close()

    return attendance_map