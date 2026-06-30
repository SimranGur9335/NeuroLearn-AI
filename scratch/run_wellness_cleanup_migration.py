import sys
import os
from sqlalchemy import text

sys.path.append(r"c:\Users\Samar\NeuroLearn-AI")
from backend.database import SessionLocal

db = SessionLocal()
try:
    print("Starting Wellness database migration and cleanup...")
    
    # 1. Add missing columns to learning_wellness_logs if they don't exist
    db.execute(text("ALTER TABLE learning_wellness_logs ADD COLUMN IF NOT EXISTS learning_habits TEXT DEFAULT '[]';"))
    db.execute(text("ALTER TABLE learning_wellness_logs ADD COLUMN IF NOT EXISTS recommendations TEXT DEFAULT '[]';"))
    db.commit()
    print("OK: learning_wellness_logs table columns checked and added.")
    
    # 2. Check if wellness_mood_logs exists and migrate records
    exists = db.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'wellness_mood_logs'
        )
    """)).scalar()
    
    if exists:
        print("Legacy wellness_mood_logs table found. Migrating data...")
        rows = db.execute(text("SELECT * FROM wellness_mood_logs")).fetchall()
        migrated_count = 0
        
        for r in rows:
            row = dict(r._mapping)
            # Map values
            focus_val = int(row.get('focus') or 50)
            stress_val = int(row.get('stress') or 50)
            happy_val = int(row.get('happiness') or 50)
            
            focus_level = max(1, min(10, focus_val // 10))
            stress_level = max(1, min(10, stress_val // 10))
            energy_level = max(1, min(10, happy_val // 10))
            
            if happy_val > 60:
                mood = 'happy'
            elif stress_val > 60:
                mood = 'stressed'
            else:
                mood = 'focused'
                
            sleep_hours = float(row.get('sleep_hours') or 8.0)
            study_hours = float(row.get('study_hours') or 0.0)
            learning_habits = row.get('learning_habits') or '[]'
            recommendations = row.get('recommendations') or '[]'
            log_date = row.get('log_date')
            created_at = row.get('created_at')
            student_id = row.get('student_id')
            
            # Check if this student already has a log on this date in learning_wellness_logs
            dup = db.execute(text("""
                SELECT log_id FROM learning_wellness_logs 
                WHERE student_id = :sid AND log_date = :ldate AND is_deleted = FALSE
            """), {"sid": student_id, "ldate": log_date}).fetchone()
            
            if not dup:
                db.execute(text("""
                    INSERT INTO learning_wellness_logs (
                        student_id, mood, energy_level, focus_level, stress_level,
                        sleep_hours, planned_study_hours, learning_goal, log_date,
                        created_at, updated_at, is_deleted, learning_habits, recommendations
                    ) VALUES (
                        :sid, :mood, :el, :fl, :sl, :sleep, :study, :goal, :ldate, :cat, :cat, FALSE, :habits, :recs
                    )
                """), {
                    "sid": student_id,
                    "mood": mood,
                    "el": energy_level,
                    "fl": focus_level,
                    "sl": stress_level,
                    "sleep": sleep_hours,
                    "study": study_hours,
                    "goal": "Migrated from legacy wellness_mood_logs",
                    "ldate": log_date,
                    "cat": created_at,
                    "habits": learning_habits,
                    "recs": recommendations
                })
                migrated_count += 1
                
        db.commit()
        print(f"OK: Data migration complete. Migrated {migrated_count} records.")
        
        # 3. Drop legacy wellness_mood_logs table
        db.execute(text("DROP TABLE IF EXISTS wellness_mood_logs CASCADE;"))
        db.commit()
        print("OK: Legacy table wellness_mood_logs dropped.")
        
    else:
        print("No legacy wellness_mood_logs table found.")
        
    # 4. Drop legacy wellness_focus_sessions table
    db.execute(text("DROP TABLE IF EXISTS wellness_focus_sessions CASCADE;"))
    db.commit()
    print("OK: Legacy table wellness_focus_sessions dropped.")
    
    print("Wellness database cleanup complete successfully!")
except Exception as e:
    db.rollback()
    print(f"Error during migration execution: {e}")
finally:
    db.close()
