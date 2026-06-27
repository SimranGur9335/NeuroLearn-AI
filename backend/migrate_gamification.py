# migrate_gamification.py
import sys
import os
from sqlalchemy import text

# Ensure we can import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import SessionLocal

def run_migrations():
    db = SessionLocal()
    print("Running Gamification database migrations...")
    try:
        # 1. Alter student_metrics table if needed (add streak, last_active_date)
        print("Checking/altering student_metrics...")
        db.execute(text("ALTER TABLE student_metrics ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;"))
        db.execute(text("ALTER TABLE student_metrics ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT NULL;"))
        db.commit()
        print("OK: student_metrics columns verified.")

        # 2. Create student_badges table
        print("Creating student_badges...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS student_badges (
                student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
                badge_id VARCHAR(100) NOT NULL,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (student_id, badge_id)
            );
        """))
        db.commit()
        print("OK: student_badges table verified.")

        # 3. Create quiz_attempts table
        print("Creating quiz_attempts...")
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
        db.commit()
        print("OK: quiz_attempts table verified.")

        # 4. Seed some initial quiz attempts and badges if empty
        attempts_count = db.execute(text("SELECT COUNT(*) FROM quiz_attempts")).scalar()
        if attempts_count == 0:
            print("Seeding initial mock quiz attempts for leaderboards...")
            # Fetch some students
            students = db.execute(text("SELECT student_id FROM students")).fetchall()
            for s in students:
                sid = s.student_id
                # Seed a couple attempts
                db.execute(text("""
                    INSERT INTO quiz_attempts (student_id, node_id, domain_id, score, total_questions, xp_earned, passed)
                    VALUES 
                    (:sid, 'fs-1', 'software-development', 2, 2, 100, TRUE),
                    (:sid, 'aiml-1', 'artificial-intelligence', 1, 1, 100, TRUE)
                """), {"sid": sid})
                
                # Seed some badges
                db.execute(text("""
                    INSERT INTO student_badges (student_id, badge_id)
                    VALUES 
                    (:sid, 'b6'), -- Campus Regular
                    (:sid, 'b8'), -- Deadline Crusher
                    (:sid, 'b9'), -- Zero Backlog Shield
                    (:sid, 'b11'), -- Knowledge Explorer
                    (:sid, 'b13')  -- Club Contributor
                """), {"sid": sid})
            db.commit()
            print("OK: Seeding completed.")

        print("Migrations and seeding executed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error executing gamification migrations: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations()
