# migrate_and_seed.py
import sys
import os
from datetime import datetime, timedelta
import random

# Ensure we can import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import SessionLocal, engine
from sqlalchemy import text

def run_migrations():
    db = SessionLocal()
    print("Running migrations...")
    try:
        # 1. Alter attendance_records
        db.execute(text("""
            ALTER TABLE attendance_records 
            ADD COLUMN IF NOT EXISTS subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE;
        """))
        db.execute(text("""
            ALTER TABLE attendance_records 
            ADD COLUMN IF NOT EXISTS faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE;
        """))
        db.commit()
        print("OK: attendance_records columns (subject_id, faculty_id) verified/added.")
        
        # 2. Create student_marks table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_marks (
                mark_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                term_id INTEGER REFERENCES academic_terms(term_id) ON DELETE SET NULL,
                assignment_marks NUMERIC(5, 2) DEFAULT 0.00,
                quiz_marks NUMERIC(5, 2) DEFAULT 0.00,
                internal_marks NUMERIC(5, 2) DEFAULT 0.00,
                practical_marks NUMERIC(5, 2) DEFAULT 0.00,
                total_marks NUMERIC(5, 2) DEFAULT 0.00,
                grade VARCHAR(5) DEFAULT 'F',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """))
        db.commit()
        print("OK: student_marks table verified/created.")
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

def run_seeding():
    db = SessionLocal()
    print("Seeding database (only inserting missing records)...")
    try:
        # 1. Verify or create faculty Alok Verma (teacher@neurolearn.ai)
        faculty_email = "teacher@neurolearn.ai"
        faculty = db.execute(
            text("SELECT faculty_id FROM faculty WHERE email = :email"),
            {"email": faculty_email}
        ).fetchone()
        
        if not faculty:
            print("Seeding faculty member...")
            faculty_id = db.execute(
                text("""
                    INSERT INTO faculty (faculty_code, full_name, email, department, designation, created_at)
                    VALUES ('FAC100', 'Dr. Alok Verma', :email, 'Computer Engineering', 'Professor & Head', NOW())
                    RETURNING faculty_id
                """),
                {"email": faculty_email}
            ).scalar()
            db.commit()
        else:
            faculty_id = faculty.faculty_id
            print(f"Faculty member already exists (ID: {faculty_id}).")

        # 2. Make sure academic terms exist
        term = db.execute(text("SELECT term_id FROM academic_terms LIMIT 1")).fetchone()
        if not term:
            print("Seeding academic term...")
            term_id = db.execute(text("""
                INSERT INTO academic_terms (academic_year, semester, created_at)
                VALUES ('2026-2027', 5, NOW())
                RETURNING term_id
            """)).scalar()
            db.commit()
        else:
            term_id = term.term_id

        # 3. Seed students if students table has very few records (like <= 2)
        student_count = db.execute(text("SELECT COUNT(*) FROM students")).scalar()
        if student_count <= 2:
            print(f"Only {student_count} student(s) found. Seeding mock student cohort...")
            # We seed 15 students
            students_to_seed = [
                ("2023CS8094", "Aarav Singh", "CS", "A"),
                ("2023CS8095", "Rohit Deshmukh", "CS", "A"),
                ("2023CS8096", "Siddharth Jain", "CS", "A"),
                ("2023CS8097", "Divya Das", "CS", "A"),
                ("2023CS8098", "Nikhil Kumar", "CS", "A"),
                ("2023CS8099", "Ananya Rao", "CS", "B"),
                ("2023CS8100", "Ishaan Patel", "CS", "B"),
                ("2023CS8101", "Meera Kulkarni", "CS", "B"),
                ("2023CS8102", "Kabir Sen", "CS", "B"),
                ("2023AI5001", "Rohan Mehta", "AI & DS", "A"),
                ("2023AI5002", "Neha Sharma", "AI & DS", "A"),
                ("2023AI5003", "Aditya Gupta", "AI & DS", "A"),
                ("2023AI5004", "Simran Gill", "AI & DS", "A"),
                ("2023AI5005", "Tanmay Joshi", "AI & DS", "A")
            ]
            
            for roll, name, dept, div in students_to_seed:
                email = f"{name.lower().replace(' ', '')}@neurolearn.ai"
                # Check if exists
                existing = db.execute(text("SELECT student_id FROM students WHERE roll_no = :roll"), {"roll": roll}).fetchone()
                if not existing:
                    student_id = db.execute(text("""
                        INSERT INTO students (roll_no, full_name, email, department, semester, division, created_at)
                        VALUES (:roll, :name, :email, :dept, 5, :div, NOW())
                        RETURNING student_id
                    """), {"roll": roll, "name": name, "email": email, "dept": dept, "div": div}).scalar()
                    
                    # Enroll in corresponding class based on class_id (Class A vs B etc)
                    # Class IDs from inspect_meta:
                    # 1: TE Computer A (Div A, Dept Computer Engineering)
                    # 2: TE Computer B (Div B, Dept Computer Engineering)
                    # 3: TE AI A (Div A, Dept AI & DS)
                    class_id = 1
                    if dept == "CS":
                        if div == "A":
                            class_id = 1
                        else:
                            class_id = 2
                    else:
                        class_id = 3
                        
                    db.execute(text("""
                        INSERT INTO enrollments (student_id, class_id, created_at)
                        VALUES (:student_id, :class_id, NOW())
                    """), {"student_id": student_id, "class_id": class_id})
                    
                    # Insert metrics
                    attendance_pct = random.uniform(65, 96)
                    quiz_score = random.uniform(55, 94)
                    risk_level = "Low"
                    if attendance_pct < 75:
                        risk_level = "High"
                    elif attendance_pct < 85 or quiz_score < 70:
                        risk_level = "Medium"
                        
                    db.execute(text("""
                        INSERT INTO student_metrics (student_id, attendance, quiz_score, risk_level, predicted_cgpa, xp_points, updated_at)
                        VALUES (:student_id, :attendance, :quiz, :risk, :cgpa, :xp, NOW())
                    """), {
                        "student_id": student_id,
                        "attendance": attendance_pct,
                        "quiz": quiz_score,
                        "risk": risk_level,
                        "cgpa": random.uniform(6.5, 9.5),
                        "xp": random.randint(100, 1500)
                    })
            db.commit()
            print("OK: Mock students, enrollments, and student_metrics seeded.")
        else:
            print("Students already exist in the database.")

        # 4. Map teacher Alok Verma to classes if not already mapped
        # Check faculty assignments
        existing_assignments = db.execute(
            text("SELECT COUNT(*) FROM faculty_assignments WHERE faculty_id = :fid"),
            {"fid": faculty_id}
        ).scalar()
        
        if existing_assignments == 0:
            print("Seeding faculty assignments for Dr. Alok Verma...")
            # We map:
            # - Class 1 (TE Computer A) -> Subject 1 (DBMS)
            # - Class 2 (TE Computer B) -> Subject 2 (Machine Learning)
            # - Class 3 (TE AI A) -> Subject 3 (Mini Project)
            assignments = [
                (1, 1, "Theory", "2026-2027"),
                (2, 2, "Theory", "2026-2027"),
                (3, 3, "Project Guide", "2026-2027")
            ]
            for class_id, subject_id, role, year in assignments:
                db.execute(text("""
                    INSERT INTO faculty_assignments (faculty_id, class_id, subject_id, role, academic_year, created_at)
                    VALUES (:fid, :class_id, :subject_id, :role, :year, NOW())
                """), {
                    "fid": faculty_id,
                    "class_id": class_id,
                    "subject_id": subject_id,
                    "role": role,
                    "year": year
                })
            db.commit()
            print("OK: Faculty assignments seeded for Dr. Alok Verma.")
        else:
            print(f"Faculty assignments already exist ({existing_assignments} mappings).")

        # 5. Seed baseline assignments
        assignment_count = db.execute(text("SELECT COUNT(*) FROM assignments")).scalar()
        if assignment_count == 0:
            print("Seeding baseline assignments...")
            db.execute(text("""
                INSERT INTO assignments (subject_id, class_id, title, description, due_date, total_marks, created_at)
                VALUES 
                (1, 1, 'DBMS Assignment 1: SQL Schema Design', 'Design an entity-relationship schema and create tables for an e-commerce platform.', :due1, 50, NOW()),
                (1, 1, 'DBMS Assignment 2: Normalization Exercises', 'Apply BCNF and 3NF decomposition steps to the given relation schemas.', :due2, 50, NOW()),
                (2, 2, 'ML Assignment 1: Linear Regression implementation', 'Implement gradient descent from scratch in Python for linear regression.', :due1, 100, NOW())
            """), {
                "due1": datetime.now().date() + timedelta(days=7),
                "due2": datetime.now().date() + timedelta(days=14)
            })
            db.commit()
            
            # Seed submissions for DBMS Assignment 1
            new_assignment_id = db.execute(text("SELECT assignment_id FROM assignments WHERE subject_id = 1 AND class_id = 1 LIMIT 1")).scalar()
            if new_assignment_id:
                # Select students in Class 1
                students = db.execute(text("""
                    SELECT s.student_id FROM students s
                    JOIN enrollments e ON s.student_id = e.student_id
                    WHERE e.class_id = 1
                """)).fetchall()
                
                print(f"Seeding submissions for {len(students)} students in Class 1...")
                for s in students:
                    status = random.choice(["Submitted", "Pending", "Late"])
                    marks = None
                    submitted_at = None
                    url = None
                    if status != "Pending":
                        marks = random.randint(35, 50)
                        submitted_at = datetime.now() - timedelta(days=1)
                        url = f"https://supabase.co/storage/v1/object/public/submissions/submission_{s.student_id}.pdf"
                    
                    db.execute(text("""
                        INSERT INTO assignment_submissions (assignment_id, student_id, submission_url, marks_obtained, status, submitted_at)
                        VALUES (:assign_id, :student_id, :url, :marks, :status, :submitted_at)
                    """), {
                        "assign_id": new_assignment_id,
                        "student_id": s.student_id,
                        "url": url,
                        "marks": marks,
                        "status": status,
                        "submitted_at": submitted_at
                    })
                db.commit()
            print("OK: Baseline assignments and submissions seeded.")
        else:
            print(f"Assignments already exist ({assignment_count} records).")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations()
    run_seeding()
