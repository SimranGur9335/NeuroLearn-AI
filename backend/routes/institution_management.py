# backend/routes/institution_management.py
from datetime import datetime
from typing import Optional, List, Dict, Union
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import text

from backend.database import SessionLocal
from backend.core.security import get_current_user, require_role
from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
    get_current_academic_year,
)
from backend.core.access import (
    verify_faculty_access,
    verify_student_access,
)

# Import all needed schemas
from backend.schemas.institution import *
from backend.schemas.academic import *
from backend.schemas.faculty import *

router = APIRouter(
    tags=["Institution Management"]
)


@router.get("/api/faculty-mapping")
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

@router.post("/api/faculty-mapping")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/faculty-mapping/{mapping_id}")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/faculty-mapping/{mapping_id}")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/courses")
def get_courses(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT c.*, 
                       COALESCE((
                           SELECT COUNT(DISTINCT e.student_id)
                           FROM enrollments e
                           JOIN faculty_assignments fa ON e.class_id = fa.class_id
                           JOIN course_subject_mapping csm ON fa.subject_id = csm.subject_id
                           WHERE csm.course_id = c.course_id
                       ), 0) AS dynamic_enrollment_count
                FROM courses c
                WHERE c.institution_id = :iid
                ORDER BY c.course_id DESC
            """),
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
                "enrollment_count": row.dynamic_enrollment_count
            })
        return courses
    finally:
        db.close()

@router.post("/api/courses")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/courses/{course_id}")
def update_course(course_id: int, data: CourseInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        course = db.execute(
            text("SELECT institution_id FROM courses WHERE course_id = :id"),
            {"id": course_id}
        ).fetchone()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found.")
        if course.institution_id != current_user["institution_id"]:
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/courses/{course_id}")
def delete_course(course_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        course = db.execute(
            text("SELECT institution_id FROM courses WHERE course_id = :id"),
            {"id": course_id}
        ).fetchone()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found.")
        if course.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Course belongs to another institution.")

        db.execute(text("DELETE FROM course_subject_mapping WHERE course_id = :id"), {"id": course_id})
        db.execute(text("DELETE FROM courses WHERE course_id = :id"), {"id": course_id})
        db.commit()
        log_audit(db, "DELETE", "Course", course_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Course deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/subjects")
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

@router.post("/api/subjects")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/subjects/{subject_id}")
def update_subject(subject_id: int, data: SubjectInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        sub = db.execute(
            text("SELECT institution_id FROM subjects WHERE subject_id = :id"),
            {"id": subject_id}
        ).fetchone()
        if not sub:
            raise HTTPException(status_code=404, detail="Subject not found.")
        if sub.institution_id != current_user["institution_id"]:
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/subjects/{subject_id}")
def delete_subject(subject_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        sub = db.execute(
            text("SELECT institution_id FROM subjects WHERE subject_id = :id"),
            {"id": subject_id}
        ).fetchone()
        if not sub:
            raise HTTPException(status_code=404, detail="Subject not found.")
        if sub.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Subject belongs to another institution.")

        db.execute(text("DELETE FROM course_subject_mapping WHERE subject_id = :id"), {"id": subject_id})
        db.execute(text("DELETE FROM faculty_assignments WHERE subject_id = :id"), {"id": subject_id})
        db.execute(text("DELETE FROM subjects WHERE subject_id = :id"), {"id": subject_id})
        db.commit()
        log_audit(db, "DELETE", "Subject", subject_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Subject deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/classes")
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

@router.post("/api/classes")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/classes/{class_id}")
def update_class(class_id: int, data: ClassInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        c = db.execute(
            text("SELECT institution_id FROM classes WHERE class_id = :id"),
            {"id": class_id}
        ).fetchone()
        if not c:
            raise HTTPException(status_code=404, detail="Class not found.")
        if c.institution_id != current_user["institution_id"]:
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/classes/{class_id}")
def delete_class(class_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        c = db.execute(
            text("SELECT institution_id FROM classes WHERE class_id = :id"),
            {"id": class_id}
        ).fetchone()
        if not c:
            raise HTTPException(status_code=404, detail="Class not found.")
        if c.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Class belongs to another institution.")

        db.execute(text("DELETE FROM enrollments WHERE class_id = :id"), {"id": class_id})
        db.execute(text("DELETE FROM faculty_assignments WHERE class_id = :id"), {"id": class_id})
        db.execute(text("DELETE FROM classes WHERE class_id = :id"), {"id": class_id})
        db.commit()
        log_audit(db, "DELETE", "Class", class_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Class deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/departments")
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

@router.post("/api/departments")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentInput, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        dept = db.execute(
            text("SELECT institution_id FROM departments WHERE department_id = :id"),
            {"id": dept_id}
        ).fetchone()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found.")
        if dept.institution_id != current_user["institution_id"]:
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/departments/{dept_id}")
def delete_department(dept_id: int, current_user: dict = Depends(require_role(["admin"]))):
    db = SessionLocal()
    try:
        dept = db.execute(
            text("SELECT institution_id FROM departments WHERE department_id = :id"),
            {"id": dept_id}
        ).fetchone()
        if not dept:
            raise HTTPException(status_code=404, detail="Department not found.")
        if dept.institution_id != current_user["institution_id"]:
            raise HTTPException(status_code=403, detail="Access denied: Department belongs to another institution.")

        db.execute(text("DELETE FROM departments WHERE department_id = :id"), {"id": dept_id})
        db.commit()
        log_audit(db, "DELETE", "Department", dept_id, performed_by=f"Admin {current_user['user_id']}")
        return {"message": "Department deleted successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/departments/stats")
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

@router.get("/api/enrollments")
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

@router.post("/api/enrollments")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.put("/api/enrollments/{enrollment_id}")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/enrollments/{enrollment_id}")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/enrollments/history/{student_id}")
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

@router.get("/api/course-subject-mappings")
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

@router.post("/api/course-subject-mappings")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.delete("/api/course-subject-mappings/{mapping_id}")
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
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/academic-terms")
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

@router.post("/api/academic-terms")
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

@router.put("/api/academic-terms/{term_id}")
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

@router.delete("/api/academic-terms/{term_id}")
def delete_academic_term(term_id: int, current_user: dict = Depends(require_role(["admin", "super_admin"]))):
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM academic_terms WHERE term_id = :id  AND institution_id = :iid"), {"id": term_id, "iid": current_user["institution_id"]})
        db.commit()
        log_audit(db, "DELETE", "AcademicTerm", term_id)
        return {"message": "Academic term deleted successfully"}
    finally:
        db.close()

