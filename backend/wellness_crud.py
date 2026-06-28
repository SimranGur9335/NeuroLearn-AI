# backend/wellness_crud.py
from sqlalchemy import text
from datetime import datetime, timedelta, date
import json

def recalculate_wellness_statistics(db, student_id: int):
    """
    Recalculates all wellness statistics for a given student and stores them in wellness_statistics.
    No AI, pure backend calculations.
    """
    try:
        # 1. Average Sleep & Average Focus (from check-ins)
        checkins = db.execute(text("""
            SELECT sleep_hours, focus_level, log_date 
            FROM learning_wellness_logs 
            WHERE student_id = :sid AND is_deleted = FALSE
            ORDER BY log_date DESC
        """), {"sid": student_id}).fetchall()
        
        avg_sleep = 0.0
        avg_focus = 0.0
        if checkins:
            avg_sleep = float(sum(float(c.sleep_hours) for c in checkins) / len(checkins))
            avg_focus = float(sum(int(c.focus_level) for c in checkins) / len(checkins))
            
        # 2. Focus Session Metrics
        sessions = db.execute(text("""
            SELECT duration_minutes, status, started_at 
            FROM focus_sessions 
            WHERE student_id = :sid AND is_deleted = FALSE
        """), {"sid": student_id}).fetchall()
        
        completed_sessions = sum(1 for s in sessions if s.status == 'completed')
        interrupted_sessions = sum(1 for s in sessions if s.status == 'interrupted')
        focus_sessions_count = len(sessions)
        
        avg_session_duration = 0.0
        if sessions:
            avg_session_duration = float(sum(s.duration_minutes for s in sessions) / len(sessions))
            
        # Total Study Hours (sum of completed session hours)
        total_study_hours = float(sum(s.duration_minutes for s in sessions if s.status == 'completed') / 60.0)
        
        # 3. Weekly Study Hours (sum of completed focus sessions in last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        weekly_study_hours = float(db.execute(text("""
            SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 
            FROM focus_sessions 
            WHERE student_id = :sid AND status = 'completed' AND started_at >= :date_limit AND is_deleted = FALSE
        """), {"sid": student_id, "date_limit": seven_days_ago}).scalar() or 0.0)

        # 4. Streak Calculation (Check-ins or completed focus sessions)
        # Fetch all active days (check-in dates or completed focus session dates)
        active_dates = db.execute(text("""
            SELECT DISTINCT log_date AS adate FROM learning_wellness_logs WHERE student_id = :sid AND is_deleted = FALSE
            UNION
            SELECT DISTINCT DATE(started_at) AS adate FROM focus_sessions WHERE student_id = :sid AND status = 'completed' AND is_deleted = FALSE
            ORDER BY adate DESC
        """), {"sid": student_id}).fetchall()
        
        active_dates_set = {r.adate for r in active_dates}
        
        # Calculate Current Streak
        current_streak = 0
        today_date = date.today()
        yesterday_date = today_date - timedelta(days=1)
        
        check_date = today_date
        if check_date not in active_dates_set:
            check_date = yesterday_date
            
        while check_date in active_dates_set:
            current_streak += 1
            check_date -= timedelta(days=1)
            
        # Calculate Longest Streak
        longest_streak = 0
        if active_dates:
            sorted_dates = sorted(list(active_dates_set))
            temp_streak = 1
            longest_streak = 1
            for i in range(1, len(sorted_dates)):
                if sorted_dates[i] - sorted_dates[i-1] == timedelta(days=1):
                    temp_streak += 1
                else:
                    longest_streak = max(longest_streak, temp_streak)
                    temp_streak = 1
            longest_streak = max(longest_streak, temp_streak)
            
        # 5. Academic Integrations
        # Attendance rate
        attendance_rate = db.execute(text("""
            SELECT COUNT(CASE WHEN status = 'Present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)
            FROM attendance_records WHERE student_id = :sid
        """), {"sid": student_id}).scalar()
        
        if attendance_rate is None:
            # Fall back to student_metrics seed
            attendance_rate = db.execute(text("""
                SELECT attendance FROM student_metrics WHERE student_id = :sid
            """), {"sid": student_id}).scalar() or 0.0
        attendance_rate = float(attendance_rate)

        # Assignment completion rate
        assignment_completion_rate = db.execute(text("""
            SELECT COUNT(DISTINCT s.assignment_id) * 100.0 / NULLIF(COUNT(DISTINCT a.assignment_id), 0)
            FROM enrollments e
            JOIN assignments a ON e.class_id = a.class_id
            LEFT JOIN assignment_submissions s ON a.assignment_id = s.assignment_id AND s.student_id = e.student_id
            WHERE e.student_id = :sid
        """), {"sid": student_id}).scalar()
        
        if assignment_completion_rate is None:
            assignment_completion_rate = 0.0
        assignment_completion_rate = float(assignment_completion_rate)

        # Quiz Performance Rate
        quiz_performance_rate = db.execute(text("""
            SELECT AVG(score * 100.0 / total_marks)
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.quiz_id
            WHERE qr.student_id = :sid
        """), {"sid": student_id}).scalar()
        
        if quiz_performance_rate is None:
            # Check quiz_attempts
            quiz_performance_rate = db.execute(text("""
                SELECT AVG(score * 100.0 / total_questions) 
                FROM quiz_attempts 
                WHERE student_id = :sid
            """), {"sid": student_id}).scalar()
            
        if quiz_performance_rate is None:
            # Fall back to student_metrics seed
            quiz_performance_rate = db.execute(text("""
                SELECT quiz_score FROM student_metrics WHERE student_id = :sid
            """), {"sid": student_id}).scalar() or 0.0
        quiz_performance_rate = float(quiz_performance_rate)

        # 6. Learning Consistency (% of active days in last 14 days)
        last_14_days = [date.today() - timedelta(days=i) for i in range(14)]
        active_days_count = sum(1 for d in last_14_days if d in active_dates_set)
        learning_consistency = (active_days_count / 14.0) * 100.0

        # Calculate Focus Score (weighted: 40% focus level from logs, 40% focus session completion, 20% consistency)
        avg_focus_pct = avg_focus * 10.0 # scale 1-10 to 100
        session_completion_pct = (completed_sessions / max(completed_sessions + interrupted_sessions, 1)) * 100.0
        focus_score = (avg_focus_pct * 0.4) + (session_completion_pct * 0.4) + (learning_consistency * 0.2)

        # 7. Upsert into wellness_statistics
        db.execute(text("""
            INSERT INTO wellness_statistics (
                student_id, focus_score, weekly_study_hours, focus_sessions_count,
                current_streak, longest_streak, average_sleep, average_focus,
                average_study_hours, completed_sessions, interrupted_sessions,
                avg_session_duration, attendance_rate, assignment_completion_rate,
                quiz_performance_rate, learning_consistency, last_calculated_at, updated_at
            ) VALUES (
                :sid, :fs, :wsh, :fsc, :cs, :ls, :as, :af, :ash, :comps, :intps, :asd, :ar, :acr, :qpr, :lc, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) ON CONFLICT (student_id) DO UPDATE SET
                focus_score = EXCLUDED.focus_score,
                weekly_study_hours = EXCLUDED.weekly_study_hours,
                focus_sessions_count = EXCLUDED.focus_sessions_count,
                current_streak = EXCLUDED.current_streak,
                longest_streak = EXCLUDED.longest_streak,
                average_sleep = EXCLUDED.average_sleep,
                average_focus = EXCLUDED.average_focus,
                average_study_hours = EXCLUDED.average_study_hours,
                completed_sessions = EXCLUDED.completed_sessions,
                interrupted_sessions = EXCLUDED.interrupted_sessions,
                avg_session_duration = EXCLUDED.avg_session_duration,
                attendance_rate = EXCLUDED.attendance_rate,
                assignment_completion_rate = EXCLUDED.assignment_completion_rate,
                quiz_performance_rate = EXCLUDED.quiz_performance_rate,
                learning_consistency = EXCLUDED.learning_consistency,
                last_calculated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
        """), {
            "sid": student_id,
            "fs": focus_score,
            "wsh": weekly_study_hours,
            "fsc": focus_sessions_count,
            "cs": current_streak,
            "ls": longest_streak,
            "as": avg_sleep,
            "af": avg_focus,
            "ash": total_study_hours / max(len(checkins), 1),
            "comps": completed_sessions,
            "intps": interrupted_sessions,
            "asd": avg_session_duration,
            "ar": attendance_rate,
            "acr": assignment_completion_rate,
            "qpr": quiz_performance_rate,
            "lc": learning_consistency
        })
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error recalculating wellness statistics: {e}")

def get_preferences(db, student_id: int):
    pref = db.execute(text("""
        SELECT preference_id, student_id, pomodoro_preset, daily_study_goal, daily_sleep_goal, created_at, updated_at
        FROM wellness_preferences
        WHERE student_id = :sid AND is_deleted = FALSE
    """), {"sid": student_id}).fetchone()
    
    if not pref:
        # Create default preferences
        db.execute(text("""
            INSERT INTO wellness_preferences (student_id, pomodoro_preset, daily_study_goal, daily_sleep_goal)
            VALUES (:sid, 25, 4.00, 8.00)
            ON CONFLICT (student_id) DO NOTHING
        """), {"sid": student_id})
        db.commit()
        
        pref = db.execute(text("""
            SELECT preference_id, student_id, pomodoro_preset, daily_study_goal, daily_sleep_goal, created_at, updated_at
            FROM wellness_preferences
            WHERE student_id = :sid AND is_deleted = FALSE
        """), {"sid": student_id}).fetchone()
        
    return pref
