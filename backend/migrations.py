from sqlalchemy import text, inspect
from backend.database import SessionLocal, engine

def check_migrations_already_run() -> bool:
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        required_tables = ["wellness_statistics", "student_assessment_marks", "subject_assessments"]
        for table in required_tables:
            if table not in tables:
                return False
                
        remedial_cols = [c['name'] for c in inspector.get_columns('remedial_sessions')]
        if 'cancellation_reason' not in remedial_cols or 'completed_at' not in remedial_cols:
            return False
            
        mood_cols = [c['name'] for c in inspector.get_columns('wellness_mood_logs')]
        if 'sleep_hours' not in mood_cols or 'study_hours' not in mood_cols:
            return False
            
        return True
    except Exception:
        return False

def run_migrations():
    if check_migrations_already_run():
        print("Database schema is up-to-date. Skipping core migrations.")
        return
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
        print(f"Error running core migrations: {e}")
    finally:
        db.close()

def run_gradebook_migrations():
    if check_migrations_already_run():
        return
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
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('student_marks')]
        if 'is_published' not in columns:
            db.execute(text("ALTER TABLE student_marks ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;"))
            db.execute(text("UPDATE student_marks SET is_published = TRUE WHERE is_published IS NULL;"))
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during Gradebook ERP migration: {e}")
    finally:
        db.close()

def run_remedial_migrations():
    if check_migrations_already_run():
        return
    db = SessionLocal()
    try:
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns('remedial_sessions')]
        if 'cancellation_reason' not in columns:
            db.execute(text("ALTER TABLE remedial_sessions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;"))
        if 'completed_at' not in columns:
            db.execute(text("ALTER TABLE remedial_sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during Remedial migrations: {e}")
    finally:
        db.close()
