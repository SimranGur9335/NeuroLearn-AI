from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.attendance import *

from backend.core.security import (
    require_role,
    get_current_user,
)

from backend.core.access import (
    verify_faculty_access,
    verify_student_access,
)

from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    log_faculty_activity,
    create_notification,
)

router = APIRouter(
    tags=["Attendance"]
)


@router.get("/api/class/{class_id}/attendance")
@router.get("/class/{class_id}/attendance")
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

@router.get("/api/class/{class_id}/attendance-summary")
@router.get("/class/{class_id}/attendance-summary")
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

@router.get("/api/student/{student_id}/attendance-history")
@router.get("/student/{student_id}/attendance-history")
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

@router.post("/api/attendance/mark")
@router.post("/attendance/mark")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/class/{class_id}/attendance-registry")
@router.get("/class/{class_id}/attendance-registry")
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

@router.get("/api/class/{class_id}/today-attendance")
@router.get("/class/{class_id}/today-attendance")
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

@router.get("/api/attendance/records")
@router.get("/attendance/records")
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

@router.post("/api/attendance/save")
@router.post("/attendance/save")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/attendance/history")
@router.get("/attendance/history")
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

@router.get("/api/attendance/monthly-report")
@router.get("/attendance/monthly-report")
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