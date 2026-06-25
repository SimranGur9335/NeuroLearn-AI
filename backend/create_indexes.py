# backend/create_indexes.py
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from backend.database import engine

def create_database_indexes():
    indexes = [
        # 1. Enrollments indexes (class_id and student_id)
        "CREATE INDEX IF NOT EXISTS idx_enrollments_class_student ON enrollments(class_id, student_id);",
        
        # 2. Student metrics indexes
        "CREATE INDEX IF NOT EXISTS idx_student_metrics_student_id ON student_metrics(student_id);",
        "CREATE INDEX IF NOT EXISTS idx_student_metrics_risk_level ON student_metrics(risk_level);",
        
        # 3. Attendance records indexes (class, subject, date queries)
        "CREATE INDEX IF NOT EXISTS idx_attendance_records_query ON attendance_records(class_id, subject_id, attendance_date);",
        
        # 4. Assignments indexes
        "CREATE INDEX IF NOT EXISTS idx_assignments_query ON assignments(class_id, subject_id, due_date);",
        
        # 5. Assignment submissions indexes
        "CREATE INDEX IF NOT EXISTS idx_assignment_submissions_lookup ON assignment_submissions(assignment_id, status);",
        
        # 6. Remedial sessions indexes
        "CREATE INDEX IF NOT EXISTS idx_remedial_sessions_query ON remedial_sessions(class_id, subject_id, session_date);",
        
        # 7. Faculty assignments indexes
        "CREATE INDEX IF NOT EXISTS idx_faculty_assignments_lookup ON faculty_assignments(faculty_id, class_id, subject_id);",
        
        # 8. Notifications indexes
        "CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(faculty_id, is_read);",
        
        # 9. Announcements indexes
        "CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_type);"
    ]
    
    print("Connecting to Supabase PostgreSQL...")
    with engine.connect() as conn:
        transaction = conn.begin()
        try:
            for idx_sql in indexes:
                print(f"Executing: {idx_sql}")
                conn.execute(text(idx_sql))
            transaction.commit()
            print("Successfully created all database indexes!")
        except Exception as e:
            transaction.rollback()
            print(f"Error creating indexes: {e}")
            raise e

if __name__ == "__main__":
    create_database_indexes()
