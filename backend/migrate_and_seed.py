# migrate_and_seed.py
import sys
import os
from datetime import datetime, timedelta
import random
import bcrypt

# Ensure we can import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import SessionLocal, engine
from sqlalchemy import text

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def run_migrations():
    db = SessionLocal()
    print("Running migrations...")
    try:
        # 1. academic_terms
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS academic_terms (
                term_id SERIAL PRIMARY KEY,
                academic_year VARCHAR(50) NOT NULL,
                semester INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 2. students
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS students (
                student_id SERIAL PRIMARY KEY,
                roll_no VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                semester INTEGER NOT NULL,
                division VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 3. faculty
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS faculty (
                faculty_id SERIAL PRIMARY KEY,
                faculty_code VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                designation VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 4. classes
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS classes (
                class_id SERIAL PRIMARY KEY,
                class_name VARCHAR(100) NOT NULL,
                division VARCHAR(10) NOT NULL,
                department VARCHAR(100) NOT NULL,
                semester INTEGER NOT NULL,
                term_id INTEGER REFERENCES academic_terms(term_id) ON DELETE SET NULL NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 5. subjects
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS subjects (
                subject_id SERIAL PRIMARY KEY,
                subject_code VARCHAR(50) UNIQUE NOT NULL,
                subject_name VARCHAR(255) NOT NULL,
                credits INTEGER NOT NULL,
                department VARCHAR(100) NOT NULL,
                semester INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 6. enrollments
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS enrollments (
                enrollment_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 7. faculty_assignments
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS faculty_assignments (
                assignment_id SERIAL PRIMARY KEY,
                faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                role VARCHAR(100) NOT NULL,
                academic_year VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(faculty_id, class_id, subject_id, academic_year)
            );
        """))
        db.commit()

        # 8. courses
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS courses (
                course_id SERIAL PRIMARY KEY,
                course_code VARCHAR(50) UNIQUE NOT NULL,
                course_title VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                duration VARCHAR(50) NOT NULL,
                enrollment_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 9. course_subject_mapping
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS course_subject_mapping (
                mapping_id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(course_id) ON DELETE CASCADE,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_id, subject_id)
            );
        """))
        db.commit()

        # 10. announcements
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS announcements (
                announcement_id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                sender_type VARCHAR(50) NOT NULL,
                sender_id INTEGER NOT NULL,
                target_type VARCHAR(50) NOT NULL,
                target_id INTEGER NULL,
                priority VARCHAR(50) DEFAULT 'Normal',
                attachment_url TEXT NULL,
                attachment_name VARCHAR(255) NULL,
                is_edited INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 11. student_metrics
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_metrics (
                student_id INTEGER PRIMARY KEY REFERENCES students(student_id) ON DELETE CASCADE,
                attendance NUMERIC(5, 2) DEFAULT 0.00,
                quiz_score NUMERIC(5, 2) DEFAULT 0.00,
                risk_level VARCHAR(50) DEFAULT 'Low',
                predicted_cgpa NUMERIC(4, 2) DEFAULT 0.00,
                xp_points INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 12. risk_predictions
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS risk_predictions (
                prediction_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                risk_score NUMERIC(5, 2) DEFAULT 0.00,
                risk_level VARCHAR(50) DEFAULT 'Low',
                attendance_score NUMERIC(5, 2) DEFAULT 0.00,
                quiz_score NUMERIC(5, 2) DEFAULT 0.00,
                prediction_reason TEXT NULL,
                model_version VARCHAR(50) DEFAULT 'Rule-Based V1.0',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 13. audit_logs
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id SERIAL PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id INTEGER NULL,
                performed_by VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 14. system_settings
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_id SERIAL PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 15. assignments
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                due_date DATE NOT NULL,
                total_marks INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 16. assignment_submissions
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS assignment_submissions (
                submission_id SERIAL PRIMARY KEY,
                assignment_id INTEGER REFERENCES assignments(assignment_id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                submission_url VARCHAR(255) NULL,
                marks_obtained NUMERIC(5, 2) NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                submitted_at TIMESTAMP NULL
            );
        """))
        db.commit()

        # 17. attendance_records
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS attendance_records (
                attendance_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
                attendance_date DATE NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()

        # 18. departments
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS departments (
                department_id SERIAL PRIMARY KEY,
                department_name VARCHAR(255) NOT NULL,
                department_code VARCHAR(50) UNIQUE NOT NULL
            );
        """))
        db.commit()

        # 19. quizzes
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS quizzes (
                quiz_id SERIAL PRIMARY KEY,
                quiz_title VARCHAR(255) NOT NULL,
                total_marks INTEGER NOT NULL
            );
        """))
        db.commit()

        # 20. quiz_results
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS quiz_results (
                result_id SERIAL PRIMARY KEY,
                quiz_id INTEGER REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                score NUMERIC(5, 2) NOT NULL
            );
        """))
        db.commit()

        # 21. Alter attendance_records columns
        from sqlalchemy import inspect
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('attendance_records')]
        if 'subject_id' not in columns:
            db.execute(text("ALTER TABLE attendance_records ADD COLUMN subject_id INTEGER REFERENCES subjects(subject_id) ON DELETE CASCADE;"))
        if 'faculty_id' not in columns:
            db.execute(text("ALTER TABLE attendance_records ADD COLUMN faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE;"))
        
        # Add avatar_url columns if missing
        student_cols = [c['name'] for c in inspector.get_columns('students')]
        if 'avatar_url' not in student_cols:
            db.execute(text("ALTER TABLE students ADD COLUMN avatar_url VARCHAR(255) DEFAULT '🚀';"))
            
        faculty_cols = [c['name'] for c in inspector.get_columns('faculty')]
        if 'avatar_url' not in faculty_cols:
            db.execute(text("ALTER TABLE faculty ADD COLUMN avatar_url VARCHAR(255) DEFAULT '👨‍🏫';"))
            
        db.commit()
        print("OK: attendance_records columns and avatar_url columns verified/added.")
        
        # 22. Create student_marks table
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: student_marks table verified/created.")

        # 23. Create users table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE NULL,
                faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"))
        db.commit()
        print("OK: users table verified/created.")

        # 24. Create security_events table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS security_events (
                event_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL NULL,
                email VARCHAR(255) NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45) NULL,
                details TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: security_events table verified/created.")

        # 25. Create announcement_reads table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS announcement_reads (
                read_id SERIAL PRIMARY KEY,
                announcement_id INTEGER REFERENCES announcements(announcement_id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(announcement_id, user_id)
            );
        """))
        db.commit()
        print("OK: announcement_reads table verified/created.")

        # 26. Create institutions table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS institutions (
                institution_id SERIAL PRIMARY KEY,
                institution_name VARCHAR(255) NOT NULL,
                short_name VARCHAR(50) NOT NULL UNIQUE,
                domain_name VARCHAR(255) NOT NULL UNIQUE,
                logo_url VARCHAR(255) NOT NULL,
                theme_color VARCHAR(50) NOT NULL,
                website VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'active',
                contact_email VARCHAR(255) NULL,
                contact_phone VARCHAR(50) NULL,
                academic_year VARCHAR(50) DEFAULT '2026-2027',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: institutions table verified/created.")

        # 27. Create mentor_messages table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS mentor_messages (
                message_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                sender VARCHAR(50) NOT NULL,
                message_text TEXT NOT NULL,
                code_text TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: mentor_messages table verified/created.")

        # 28. Create wellness_mood_logs table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS wellness_mood_logs (
                log_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                happiness INTEGER NOT NULL,
                focus INTEGER NOT NULL,
                frustration INTEGER NOT NULL,
                stress INTEGER NOT NULL,
                log_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: wellness_mood_logs table verified/created.")

        # 29. Create wellness_focus_sessions table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS wellness_focus_sessions (
                session_id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: wellness_focus_sessions table verified/created.")

        # 30. Create notifications table
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id SERIAL PRIMARY KEY,
                faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE,
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'general',
                related_id INTEGER NULL,
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        db.commit()
        print("OK: notifications table verified/created.")

        # Add institution_id column to existing tables if missing
        tables_to_alter = ['users', 'students', 'faculty', 'classes', 'subjects', 'courses', 'announcements', 'departments']
        for t in tables_to_alter:
            cols = [c['name'] for c in inspector.get_columns(t)]
            if 'institution_id' not in cols:
                db.execute(text(f"ALTER TABLE {t} ADD COLUMN institution_id INTEGER REFERENCES institutions(institution_id) ON DELETE SET NULL;"))
                print(f"Altered table {t} to add institution_id column.")
        
        # Add target_career column to student_metrics if missing
        metrics_cols = [c['name'] for c in inspector.get_columns('student_metrics')]
        if 'target_career' not in metrics_cols:
            db.execute(text("ALTER TABLE student_metrics ADD COLUMN target_career VARCHAR(100) DEFAULT 'ai-engineer';"))
            print("Altered table student_metrics to add target_career column.")

        if 'faculty_notes' not in metrics_cols:
            db.execute(text("ALTER TABLE student_metrics ADD COLUMN faculty_notes TEXT NULL;"))
            print("Altered table student_metrics to add faculty_notes column.")

        if 'intervention_status' not in metrics_cols:
            db.execute(text("ALTER TABLE student_metrics ADD COLUMN intervention_status VARCHAR(100) DEFAULT 'Not Contacted';"))
            print("Altered table student_metrics to add intervention_status column.")
            
        # Add new columns to announcements if missing
        ann_cols = [c['name'] for c in inspector.get_columns('announcements')]
        if 'priority' not in ann_cols:
            db.execute(text("ALTER TABLE announcements ADD COLUMN priority VARCHAR(50) DEFAULT 'Normal';"))
            print("Altered table announcements to add priority column.")
        if 'attachment_url' not in ann_cols:
            db.execute(text("ALTER TABLE announcements ADD COLUMN attachment_url TEXT;"))
            print("Altered table announcements to add attachment_url column.")
        if 'attachment_name' not in ann_cols:
            db.execute(text("ALTER TABLE announcements ADD COLUMN attachment_name VARCHAR(255);"))
            print("Altered table announcements to add attachment_name column.")
        if 'is_edited' not in ann_cols:
            db.execute(text("ALTER TABLE announcements ADD COLUMN is_edited INTEGER DEFAULT 0;"))
            print("Altered table announcements to add is_edited column.")
        
        # 31. Create domains table
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
        db.commit()
        print("OK: domains table verified/created.")


    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

def run_seeding():
    db = SessionLocal()
    print("Seeding database (only inserting missing records)...")
    try:
        # Seed institutions first
        institutions_to_seed = [
            {
                "institution_id": 1,
                "institution_name": "COEP Technological University",
                "short_name": "COEP",
                "domain_name": "coeptech.ac.in",
                "logo_url": "/assets/logo.png",
                "theme_color": "violet",
                "website": "https://www.coeptech.ac.in",
                "address": "Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005",
                "status": "active",
                "contact_email": "admin@coeptech.ac.in",
                "contact_phone": "+91 20 2550 7000",
                "academic_year": "2026-2027"
            },
            {
                "institution_id": 2,
                "institution_name": "MIT World Peace University",
                "short_name": "MIT-WPU",
                "domain_name": "mitwpu.edu.in",
                "logo_url": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop",
                "theme_color": "rose",
                "website": "https://mitwpu.edu.in",
                "address": "Paud Rd, Kothrud, Pune, Maharashtra 411038",
                "status": "active",
                "contact_email": "admissions@mitwpu.edu.in",
                "contact_phone": "+91 20 3027 3400",
                "academic_year": "2026-2027"
            },
            {
                "institution_id": 3,
                "institution_name": "Vishwakarma Institute of Technology",
                "short_name": "VIT",
                "domain_name": "vit.ac.in",
                "logo_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=128&h=128&fit=crop",
                "theme_color": "amber",
                "website": "https://vit.ac.in",
                "address": "666, Upper Indiranagar, Bibwewadi, Pune, Maharashtra 411037",
                "status": "active",
                "contact_email": "director@vit.edu",
                "contact_phone": "+91 20 2420 2180",
                "academic_year": "2026-2027"
            },
            {
                "institution_id": 4,
                "institution_name": "Pune Institute of Computer Technology",
                "short_name": "PICT",
                "domain_name": "pict.edu",
                "logo_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&h=128&fit=crop",
                "theme_color": "indigo",
                "website": "https://pict.edu",
                "address": "Survey No. 27, Near Trimurti Chowk, Dhankawadi, Pune, Maharashtra 411043",
                "status": "active",
                "contact_email": "principal@pict.edu",
                "contact_phone": "+91 20 2437 1101",
                "academic_year": "2026-2027"
            }
        ]

        for inst in institutions_to_seed:
            existing = db.execute(text("SELECT institution_id FROM institutions WHERE short_name = :short_name OR institution_id = :institution_id"), {"short_name": inst["short_name"], "institution_id": inst["institution_id"]}).fetchone()
            if not existing:
                db.execute(text("""
                    INSERT INTO institutions (institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year)
                    VALUES (:institution_id, :institution_name, :short_name, :domain_name, :logo_url, :theme_color, :website, :address, :status, :contact_email, :contact_phone, :academic_year)
                """), inst)
                print(f"Seeded institution {inst['short_name']}")
        db.commit()

        # Update any null institution_id across tables
        for table in ['users', 'students', 'faculty', 'classes', 'subjects', 'courses', 'announcements', 'departments']:
            db.execute(text(f"UPDATE {table} SET institution_id = 1 WHERE institution_id IS NULL;"))
        db.commit()

        # 0. Seed default admin user if not present
        admin_email = "admin@neurolearn.ai"
        existing_admin = db.execute(text("SELECT user_id FROM users WHERE email = :email"), {"email": admin_email}).fetchone()
        if not existing_admin:
            db.execute(text("""
                INSERT INTO users (email, password_hash, role)
                VALUES (:email, :hash, 'admin')
            """), {"email": admin_email, "hash": hash_password("Password123")})
            db.commit()
            print("Seeded user credential for admin.")

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
                    VALUES ('FAC100', 'Dr. Alok Verma', :email, 'Computer Engineering', 'Professor & Head', CURRENT_TIMESTAMP)
                    RETURNING faculty_id
                """),
                {"email": faculty_email}
            ).scalar()
            db.commit()
        else:
            faculty_id = faculty.faculty_id
            print(f"Faculty member already exists (ID: {faculty_id}).")

        # Seed user credential for faculty member
        existing_user = db.execute(text("SELECT user_id FROM users WHERE email = :email"), {"email": faculty_email}).fetchone()
        if not existing_user:
            db.execute(text("""
                INSERT INTO users (email, password_hash, role, faculty_id)
                VALUES (:email, :hash, 'teacher', :fid)
            """), {"email": faculty_email, "hash": hash_password("Password123"), "fid": faculty_id})
            db.commit()
            print("Seeded user credential for faculty member.")

        # 2. Make sure academic terms exist
        term = db.execute(text("SELECT term_id FROM academic_terms LIMIT 1")).fetchone()
        if not term:
            print("Seeding academic term...")
            term_id = db.execute(text("""
                INSERT INTO academic_terms (academic_year, semester, created_at)
                VALUES ('2026-2027', 5, CURRENT_TIMESTAMP)
                RETURNING term_id
            """)).scalar()
            db.commit()
        else:
            term_id = term.term_id

        # Make sure classes 1, 2, 3 exist
        for cid, name, div, dept, sem in [
            (1, 'TE Computer A', 'A', 'Computer Engineering', 5),
            (2, 'TE Computer B', 'B', 'Computer Engineering', 5),
            (3, 'TE AI A', 'A', 'AI & DS', 5)
        ]:
            existing_class = db.execute(text("SELECT class_id FROM classes WHERE class_id = :cid"), {"cid": cid}).fetchone()
            if not existing_class:
                db.execute(text("""
                    INSERT INTO classes (class_id, class_name, division, department, semester, term_id, institution_id)
                    VALUES (:cid, :name, :div, :dept, :sem, :tid, 1)
                """), {"cid": cid, "name": name, "div": div, "dept": dept, "sem": sem, "tid": term_id})
        db.commit()

        # Make sure subjects 1, 2, 3 exist
        for sid, code, name, credits, dept, sem in [
            (1, 'CS501', 'DBMS', 4, 'Computer Engineering', 5),
            (2, 'CS502', 'Machine Learning', 4, 'Computer Engineering', 5),
            (3, 'CS503', 'Mini Project', 2, 'Computer Engineering', 5)
        ]:
            existing_subject = db.execute(text("SELECT subject_id FROM subjects WHERE subject_id = :sid"), {"sid": sid}).fetchone()
            if not existing_subject:
                db.execute(text("""
                    INSERT INTO subjects (subject_id, subject_code, subject_name, credits, department, semester, institution_id)
                    VALUES (:sid, :code, :name, :credits, :dept, :sem, 1)
                """), {"sid": sid, "code": code, "name": name, "credits": credits, "dept": dept, "sem": sem})
        db.commit()


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
                email = "student@neurolearn.ai" if name == "Aarav Singh" else f"{name.lower().replace(' ', '')}@neurolearn.ai"
                # Check if exists
                existing = db.execute(text("SELECT student_id FROM students WHERE roll_no = :roll"), {"roll": roll}).fetchone()
                if not existing:
                    student_id = db.execute(text("""
                        INSERT INTO students (roll_no, full_name, email, department, semester, division, created_at)
                        VALUES (:roll, :name, :email, :dept, 5, :div, CURRENT_TIMESTAMP)
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
                        VALUES (:student_id, :class_id, CURRENT_TIMESTAMP)
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
                        VALUES (:student_id, :attendance, :quiz, :risk, :cgpa, :xp, CURRENT_TIMESTAMP)
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

        # Ensure all existing students have a matching user account
        all_students = db.execute(text("SELECT student_id, email FROM students")).fetchall()
        for s in all_students:
            student_email = s.email
            existing_u = db.execute(text("SELECT user_id FROM users WHERE student_id = :sid OR email = :email"), {"sid": s.student_id, "email": student_email}).fetchone()
            if not existing_u:
                db.execute(text("""
                    INSERT INTO users (email, password_hash, role, student_id)
                    VALUES (:email, :hash, 'student', :sid)
                """), {"email": student_email, "hash": hash_password("Password123"), "sid": s.student_id})
        db.commit()
        print("OK: Student user credentials checked and seeded.")

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
                    VALUES (:fid, :class_id, :subject_id, :role, :year, CURRENT_TIMESTAMP)
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
                (1, 1, 'DBMS Assignment 1: SQL Schema Design', 'Design an entity-relationship schema and create tables for an e-commerce platform.', :due1, 50, CURRENT_TIMESTAMP),
                (1, 1, 'DBMS Assignment 2: Normalization Exercises', 'Apply BCNF and 3NF decomposition steps to the given relation schemas.', :due2, 50, CURRENT_TIMESTAMP),
                (2, 2, 'ML Assignment 1: Linear Regression implementation', 'Implement gradient descent from scratch in Python for linear regression.', :due1, 100, CURRENT_TIMESTAMP)
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

        # Seed domains table from seed_domains_helper
        try:
            from backend.seed_domains_helper import seed_domains_data
            seed_domains_data()
        except Exception as seed_err:
            print(f"Error seeding domains helper: {seed_err}")

        # Double check/ensure all tables have default institution_id = 1 assigned
        for table in ['users', 'students', 'faculty', 'classes', 'subjects', 'courses', 'announcements', 'departments']:
            db.execute(text(f"UPDATE {table} SET institution_id = 1 WHERE institution_id IS NULL;"))
        db.commit()


    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations()
    run_seeding()
