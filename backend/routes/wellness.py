import os
import re
import json
from datetime import datetime, date, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal
from backend.schemas.wellness import (
    WellnessMoodInput,
    DailyCheckInInput, DailyCheckInUpdate, WeeklyReflectionInput,
    FocusSessionStartInput, FocusSessionUpdateInput, WellnessPreferencesInput
)
from backend.services.wellness_service import recalculate_wellness_statistics, get_preferences
from backend.core.security import get_current_user
from backend.core.helpers import handle_exception_securely

router = APIRouter(
    tags=["Wellness"]
)

@router.post("/api/v1/wellness/mood")
def log_wellness_mood(data: WellnessMoodInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can log mood vectors.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        
        # Parse habits as JSON
        habits_json = json.dumps(data.learning_habits)
        
        # 1. Generate AI-driven Wellness/Remediation recommendations
        gemini_key = os.getenv("GEMINI_API_KEY")
        recommendations_list = []
        
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are a Learning Wellness AI Advisor at NeuroLearn-AI.
                Analyze the following student wellness parameters logged today:
                - Happiness/Mood level: {data.happiness}/100
                - Focus/Cognitive flow: {data.focus}/100
                - Frustration index: {data.frustration}/100
                - Stress index: {data.stress}/100
                - Sleep: {data.sleep_hours} hours
                - Study Hours: {data.study_hours} hours
                - Learning Habits used today: {", ".join(data.learning_habits)}
                
                Based on this, generate exactly 3 custom, highly-actionable recommendations for optimizing their study wellness and avoiding academic burnout.
                Respond with a valid JSON array of exactly 3 strings. Do not include markdown tags, code blocks, or explanations outside the JSON array.
                Example: ["Log off by 10 PM and aim for 8 hours of sleep", "Take a 5-minute break after each Pomodoro session", "Practice active recall on weak subjects"]
                """
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                if raw_text.startswith("```"):
                    raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                    raw_text = re.sub(r'\n```$', '', raw_text)
                
                recommendations_list = json.loads(raw_text.strip())
            except Exception as e:
                print(f"Gemini API error during wellness analysis: {e}")
                
        if not recommendations_list:
            # Rich rule-based backup recommender
            # Sleep recommendations
            if data.sleep_hours < 6.0:
                recommendations_list.append(f"Your sleep ({data.sleep_hours}h) is low. Prioritize getting 7.5+ hours tonight to support memory consolidation.")
            else:
                recommendations_list.append("Great sleep duration today! Keep maintaining a consistent bedtime for optimal learning performance.")
                
            # Stress/Frustration recommendations
            if data.stress > 60 or data.frustration > 60:
                recommendations_list.append("High cognitive strain detected. Refrain from studying heavy concepts tonight and practice deep breathing.")
            else:
                recommendations_list.append("Your cognitive stress levels are balanced. This is an excellent window for difficult roadmap challenges.")
                
            # Study duration recommendations
            if data.study_hours > 8.0:
                recommendations_list.append("Log off and relax! Excessive study hours block passive assimilation and cause burnout.")
            elif data.study_hours < 2.0 and data.focus > 70:
                recommendations_list.append("Your focus is sharp. Capitalize on it by attempting a quick quiz node in the Programming Hub.")
            else:
                recommendations_list.append("Integrate active recall techniques or space out your revision sessions rather than cramming.")
                
        recs_json = json.dumps(recommendations_list)
        
        # 2. Insert into PostgreSQL DB
        db.execute(
            text("""
                INSERT INTO wellness_mood_logs (
                    student_id, happiness, focus, frustration, stress, 
                    sleep_hours, study_hours, learning_habits, recommendations
                )
                VALUES (:sid, :hap, :foc, :fru, :str, :sleep, :study, :habits, :recs)
            """),
            {
                "sid": sid,
                "hap": data.happiness,
                "foc": data.focus,
                "fru": data.frustration,
                "str": data.stress,
                "sleep": data.sleep_hours,
                "study": data.study_hours,
                "habits": habits_json,
                "recs": recs_json
            }
        )
        db.commit()
        return {
            "success": True, 
            "message": "Wellness metrics logged successfully",
            "recommendations": recommendations_list
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/mood/history")
def get_wellness_mood_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can view mood history.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        result = db.execute(
            text("""
                SELECT happiness, focus, frustration, stress, sleep_hours, study_hours, 
                       learning_habits, recommendations, log_date 
                FROM wellness_mood_logs 
                WHERE student_id = :sid 
                ORDER BY created_at DESC 
                LIMIT 10
            """),
            {"sid": sid}
        ).fetchall()
        
        history_list = []
        for r in result:
            try:
                habs = json.loads(r.learning_habits) if r.learning_habits else []
            except Exception:
                habs = []
                
            try:
                recs = json.loads(r.recommendations) if r.recommendations else []
            except Exception:
                recs = []
                
            history_list.append({
                "day": r.log_date.strftime("%a") if r.log_date else "Today",
                "date": str(r.log_date) if r.log_date else None,
                "happy": int(r.happiness),
                "focused": int(r.focus),
                "frustrated": int(r.frustration),
                "stressed": int(r.stress),
                "sleep_hours": float(r.sleep_hours) if r.sleep_hours is not None else 8.0,
                "study_hours": float(r.study_hours) if r.study_hours is not None else 0.0,
                "learning_habits": habs,
                "recommendations": recs
            })
        
        # Reverse to show chronological order for trends chart
        history_list.reverse()
        
        # Baseline mock history if empty
        if not history_list:
            return [
                { "day": "Mon", "happy": 45, "focused": 30, "frustrated": 15, "stressed": 10, "sleep_hours": 7.0, "study_hours": 3.0, "learning_habits": ["Active Recall"], "recommendations": [] },
                { "day": "Tue", "happy": 48, "focused": 35, "frustrated": 10, "stressed": 7, "sleep_hours": 8.0, "study_hours": 4.0, "learning_habits": ["Spaced Repetition"], "recommendations": [] },
                { "day": "Wed", "happy": 35, "focused": 45, "frustrated": 12, "stressed": 8, "sleep_hours": 6.5, "study_hours": 5.0, "learning_habits": ["Feynman Technique"], "recommendations": [] },
                { "day": "Thu", "happy": 40, "focused": 25, "frustrated": 20, "stressed": 15, "sleep_hours": 5.5, "study_hours": 6.0, "learning_habits": ["Pomodoro Technique"], "recommendations": [] },
                { "day": "Fri", "happy": 42, "focused": 38, "frustrated": 12, "stressed": 8, "sleep_hours": 7.5, "study_hours": 4.5, "learning_habits": ["Mind Mapping"], "recommendations": [] },
                { "day": "Sat", "happy": 45, "focused": 40, "frustrated": 10, "stressed": 5, "sleep_hours": 8.5, "study_hours": 2.0, "learning_habits": ["Active Recall"], "recommendations": [] },
                { "day": "Today", "happy": 60, "focused": 70, "frustrated": 20, "stressed": 15, "sleep_hours": 7.5, "study_hours": 4.0, "learning_habits": ["Spaced Repetition", "Active Recall"], "recommendations": ["Aim for an honors grade", "Limit contiguous focus hours"] }
            ]
        
        if history_list:
            history_list[-1]["day"] = "Today"
            
        return history_list
    finally:
        db.close()


@router.post("/api/v1/wellness/focus")
def complete_legacy_focus_session(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can complete focus sessions.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        # 1. Log completed focus session
        db.execute(
            text("INSERT INTO wellness_focus_sessions (student_id) VALUES (:sid)"),
            {"sid": sid}
        )
        
        # 2. Add +50 XP to student_metrics
        db.execute(
            text("""
                UPDATE student_metrics
                SET xp_points = xp_points + 50, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """),
            {"sid": sid}
        )
        
        # Fetch updated XP
        updated_xp = db.execute(
            text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or 0
        
        db.commit()
        return {"success": True, "xp_points": updated_xp}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/focus/stats")
def get_focus_session_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can fetch focus stats.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        count = db.execute(
            text("SELECT COUNT(*) FROM wellness_focus_sessions WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or 0
        return {"completed_sessions": count}
    finally:
        db.close()


@router.post("/api/v1/wellness/checkin")
def create_or_update_daily_checkin(data: DailyCheckInInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can check in")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        today = date.today()
        # Check if already exists for today
        existing = db.execute(text("""
            SELECT log_id FROM learning_wellness_logs 
            WHERE student_id = :sid AND log_date = :today AND is_deleted = FALSE
        """), {"sid": student_id, "today": today}).fetchone()
        
        if existing:
            db.execute(text("""
                UPDATE learning_wellness_logs 
                SET mood = :mood, energy_level = :el, focus_level = :fl, stress_level = :sl,
                    sleep_hours = :sh, planned_study_hours = :psh, learning_goal = :goal,
                    updated_at = CURRENT_TIMESTAMP
                WHERE log_id = :lid
            """), {
                "mood": data.mood, "el": data.energy_level, "fl": data.focus_level, "sl": data.stress_level,
                "sh": data.sleep_hours, "psh": data.planned_study_hours, "goal": data.learning_goal,
                "lid": existing.log_id
            })
            db.commit()
            recalculate_wellness_statistics(db, student_id)
            return {"success": True, "message": "Daily check-in updated successfully", "log_id": existing.log_id}
        else:
            log_id = db.execute(text("""
                INSERT INTO learning_wellness_logs (
                    student_id, mood, energy_level, focus_level, stress_level,
                    sleep_hours, planned_study_hours, learning_goal, log_date, created_at, updated_at
                ) VALUES (
                    :sid, :mood, :el, :fl, :sl, :sh, :psh, :goal, :today, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ) RETURNING log_id
            """), {
                "sid": student_id, "mood": data.mood, "el": data.energy_level, "fl": data.focus_level, "sl": data.stress_level,
                "sh": data.sleep_hours, "psh": data.planned_study_hours, "goal": data.learning_goal, "today": today
            }).scalar()
            db.commit()
            recalculate_wellness_statistics(db, student_id)
            return {"success": True, "message": "Daily check-in created successfully", "log_id": log_id}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.put("/api/v1/wellness/checkin/{log_id}")
def update_daily_checkin(log_id: int, data: DailyCheckInUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can modify check-ins")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Check ownership
        log = db.execute(text("SELECT student_id FROM learning_wellness_logs WHERE log_id = :lid AND is_deleted = FALSE"), {"lid": log_id}).fetchone()
        if not log:
            raise HTTPException(status_code=404, detail="Check-in log not found")
        if log.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        update_fields = []
        params = {"lid": log_id}
        for k, v in data.dict(exclude_unset=True).items():
            update_fields.append(f"{k} = :{k}")
            params[k] = v
            
        if update_fields:
            query = f"UPDATE learning_wellness_logs SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE log_id = :lid"
            db.execute(text(query), params)
            db.commit()
            recalculate_wellness_statistics(db, student_id)
            
        return {"success": True, "message": "Check-in updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.delete("/api/v1/wellness/checkin/{log_id}")
def delete_daily_checkin(log_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can delete check-ins")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Check ownership
        log = db.execute(text("SELECT student_id FROM learning_wellness_logs WHERE log_id = :lid AND is_deleted = FALSE"), {"lid": log_id}).fetchone()
        if not log:
            raise HTTPException(status_code=404, detail="Check-in log not found")
        if log.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.execute(text("UPDATE learning_wellness_logs SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE log_id = :lid"), {"lid": log_id})
        db.commit()
        recalculate_wellness_statistics(db, student_id)
        return {"success": True, "message": "Check-in log deleted successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/checkin/history")
def get_daily_checkin_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can view check-in history")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT log_id, mood, energy_level, focus_level, stress_level, sleep_hours, planned_study_hours, learning_goal, log_date, created_at, updated_at
            FROM learning_wellness_logs
            WHERE student_id = :sid AND is_deleted = FALSE
            ORDER BY log_date DESC, created_at DESC
        """), {"sid": student_id}).fetchall()
        
        return [
            {
                "log_id": r.log_id,
                "mood": r.mood,
                "energy_level": r.energy_level,
                "focus_level": r.focus_level,
                "stress_level": r.stress_level,
                "sleep_hours": float(r.sleep_hours),
                "planned_study_hours": float(r.planned_study_hours),
                "learning_goal": r.learning_goal,
                "log_date": str(r.log_date),
                "created_at": str(r.created_at),
                "updated_at": str(r.updated_at)
            } for r in rows
        ]
    finally:
        db.close()


@router.post("/api/v1/wellness/reflection")
def create_weekly_reflection(data: WeeklyReflectionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can log reflections")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        reflection_id = db.execute(text("""
            INSERT INTO weekly_reflections (student_id, reflection_text, ref_date, created_at, updated_at)
            VALUES (:sid, :text, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING reflection_id
        """), {"sid": student_id, "text": data.reflection_text}).scalar()
        db.commit()
        return {"success": True, "message": "Reflection logged successfully", "reflection_id": reflection_id}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.put("/api/v1/wellness/reflection/{reflection_id}")
def update_weekly_reflection(reflection_id: int, data: WeeklyReflectionInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can modify reflections")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        ref = db.execute(text("SELECT student_id FROM weekly_reflections WHERE reflection_id = :rid AND is_deleted = FALSE"), {"rid": reflection_id}).fetchone()
        if not ref:
            raise HTTPException(status_code=404, detail="Reflection not found")
        if ref.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.execute(text("""
            UPDATE weekly_reflections SET reflection_text = :text, updated_at = CURRENT_TIMESTAMP
            WHERE reflection_id = :rid
        """), {"text": data.reflection_text, "rid": reflection_id})
        db.commit()
        return {"success": True, "message": "Reflection updated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.delete("/api/v1/wellness/reflection/{reflection_id}")
def delete_weekly_reflection(reflection_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can delete reflections")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        ref = db.execute(text("SELECT student_id FROM weekly_reflections WHERE reflection_id = :rid AND is_deleted = FALSE"), {"rid": reflection_id}).fetchone()
        if not ref:
            raise HTTPException(status_code=404, detail="Reflection not found")
        if ref.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.execute(text("UPDATE weekly_reflections SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE reflection_id = :rid"), {"rid": reflection_id})
        db.commit()
        return {"success": True, "message": "Reflection deleted successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/reflection/history")
def get_weekly_reflection_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can view reflection history")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT reflection_id, reflection_text, ref_date, created_at, updated_at
            FROM weekly_reflections
            WHERE student_id = :sid AND is_deleted = FALSE
            ORDER BY ref_date DESC, created_at DESC
        """), {"sid": student_id}).fetchall()
        
        return [
            {
                "reflection_id": r.reflection_id,
                "reflection_text": r.reflection_text,
                "ref_date": str(r.ref_date),
                "created_at": str(r.created_at),
                "updated_at": str(r.updated_at)
            } for r in rows
        ]
    finally:
        db.close()


@router.post("/api/v1/wellness/focus/start")
def start_focus_session(data: FocusSessionStartInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can perform focus sessions")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        session_id = db.execute(text("""
            INSERT INTO focus_sessions (student_id, preset_minutes, duration_minutes, status, started_at, created_at, updated_at)
            VALUES (:sid, :preset, 0, 'running', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING session_id
        """), {"sid": student_id, "preset": data.preset_minutes}).scalar()
        db.commit()
        return {"success": True, "session_id": session_id, "preset_minutes": data.preset_minutes}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/wellness/focus/{session_id}/pause")
def pause_focus_session(session_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can perform focus sessions")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        sess = db.execute(text("SELECT student_id, status FROM focus_sessions WHERE session_id = :sid AND is_deleted = FALSE"), {"sid": session_id}).fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Focus session not found")
        if sess.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.execute(text("""
            UPDATE focus_sessions SET status = 'paused', updated_at = CURRENT_TIMESTAMP
            WHERE session_id = :sid
        """), {"sid": session_id})
        db.commit()
        return {"success": True, "message": "Session paused"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/wellness/focus/{session_id}/resume")
def resume_focus_session(session_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can perform focus sessions")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        sess = db.execute(text("SELECT student_id, status FROM focus_sessions WHERE session_id = :sid AND is_deleted = FALSE"), {"sid": session_id}).fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Focus session not found")
        if sess.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        db.execute(text("""
            UPDATE focus_sessions SET status = 'running', updated_at = CURRENT_TIMESTAMP
            WHERE session_id = :sid
        """), {"sid": session_id})
        db.commit()
        return {"success": True, "message": "Session resumed"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/wellness/focus/{session_id}/complete")
def complete_focus_session(session_id: int, data: FocusSessionUpdateInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can perform focus sessions")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        sess = db.execute(text("SELECT student_id, status FROM focus_sessions WHERE session_id = :sid AND is_deleted = FALSE"), {"sid": session_id}).fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Focus session not found")
        if sess.student_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        duration = data.duration_minutes or 0
        status = data.status or 'completed'
        
        db.execute(text("""
            UPDATE focus_sessions 
            SET status = :status, duration_minutes = :dur, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = :sid
        """), {"status": status, "dur": duration, "sid": session_id})
        db.commit()
        
        # Award XP for completed sessions
        xp_earned = 0
        if status == 'completed':
            xp_earned = 50
            # Add to student_metrics XP
            metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
            if metrics_row:
                db.execute(text("UPDATE student_metrics SET xp_points = xp_points + 50, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid"), {"sid": student_id})
            else:
                db.execute(text("INSERT INTO student_metrics (student_id, xp_points) VALUES (:sid, 50)"), {"sid": student_id})
            db.commit()
            
        recalculate_wellness_statistics(db, student_id)
        
        return {"success": True, "message": "Session finalized", "xp_earned": xp_earned}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/focus/history")
def get_focus_session_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can view focus history")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT session_id, preset_minutes, duration_minutes, status, started_at, completed_at, created_at
            FROM focus_sessions
            WHERE student_id = :sid AND is_deleted = FALSE
            ORDER BY started_at DESC
        """), {"sid": student_id}).fetchall()
        
        return [
            {
                "session_id": r.session_id,
                "preset_minutes": r.preset_minutes,
                "duration_minutes": r.duration_minutes,
                "status": r.status,
                "started_at": str(r.started_at),
                "completed_at": str(r.completed_at) if r.completed_at else None,
                "created_at": str(r.created_at)
            } for r in rows
        ]
    finally:
        db.close()


@router.get("/api/v1/wellness/preferences")
def get_wellness_preferences(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students have preferences")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        pref = get_preferences(db, student_id)
        return {
            "preference_id": pref.preference_id,
            "student_id": pref.student_id,
            "pomodoro_preset": pref.pomodoro_preset,
            "daily_study_goal": float(pref.daily_study_goal),
            "daily_sleep_goal": float(pref.daily_sleep_goal),
            "created_at": str(pref.created_at),
            "updated_at": str(pref.updated_at)
        }
    finally:
        db.close()


@router.put("/api/v1/wellness/preferences")
def update_wellness_preferences(data: WellnessPreferencesInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students have preferences")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Enforce that preference exists first
        get_preferences(db, student_id)
        
        update_fields = []
        params = {"sid": student_id}
        for k, v in data.dict(exclude_unset=True).items():
            update_fields.append(f"{k} = :{k}")
            params[k] = v
            
        if update_fields:
            query = f"UPDATE wellness_preferences SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid AND is_deleted = FALSE"
            db.execute(text(query), params)
            db.commit()
            
        # Re-fetch preference to return
        pref = get_preferences(db, student_id)
        return {
            "preference_id": pref.preference_id,
            "student_id": pref.student_id,
            "pomodoro_preset": pref.pomodoro_preset,
            "daily_study_goal": float(pref.daily_study_goal),
            "daily_sleep_goal": float(pref.daily_sleep_goal),
            "created_at": str(pref.created_at),
            "updated_at": str(pref.updated_at)
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/wellness/statistics")
def get_wellness_statistics(
    range: str = "weekly", # daily, weekly, monthly, custom
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students have wellness statistics")
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Recalculate first to ensure fresh data
        recalculate_wellness_statistics(db, student_id)
        
        # Load calculated statistics
        stats = db.execute(text("""
            SELECT focus_score, weekly_study_hours, focus_sessions_count, current_streak, longest_streak,
                   average_sleep, average_focus, average_study_hours, completed_sessions, interrupted_sessions,
                   avg_session_duration, attendance_rate, assignment_completion_rate, quiz_performance_rate,
                   learning_consistency, last_calculated_at
            FROM wellness_statistics
            WHERE student_id = :sid AND is_deleted = FALSE
        """), {"sid": student_id}).fetchone()
        
        # Determine date filters
        today = date.today()
        if range == "daily":
            start = today
            end = today
        elif range == "weekly":
            start = today - timedelta(days=7)
            end = today
        elif range == "monthly":
            start = today - timedelta(days=30)
            end = today
        else: # custom
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else today - timedelta(days=7)
                end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else today
            except Exception:
                start = today - timedelta(days=7)
                end = today
                
        # Fetch chart data: checkins and study time in that date range
        chart_rows = db.execute(text("""
            SELECT l.log_date, l.mood, l.focus_level, l.sleep_hours,
                   COALESCE((
                       SELECT SUM(duration_minutes) / 60.0
                       FROM focus_sessions f
                       WHERE f.student_id = :sid AND f.status = 'completed' AND DATE(f.started_at) = l.log_date AND f.is_deleted = FALSE
                   ), 0.0) AS study_hours,
                   COALESCE((
                       SELECT COUNT(*)
                       FROM focus_sessions f
                       WHERE f.student_id = :sid AND DATE(f.started_at) = l.log_date AND f.is_deleted = FALSE
                   ), 0) AS sessions_count
            FROM learning_wellness_logs l
            WHERE l.student_id = :sid AND l.log_date >= :start AND l.log_date <= :end AND l.is_deleted = FALSE
            ORDER BY l.log_date ASC
        """), {"sid": student_id, "start": start, "end": end}).fetchall()
        
        # Generate chart lists
        chart_data = []
        for r in chart_rows:
            chart_data.append({
                "date": str(r.log_date),
                "day": r.log_date.strftime("%a"),
                "mood": r.mood,
                "focus": int(r.focus_level),
                "sleep": float(r.sleep_hours),
                "study": float(r.study_hours),
                "sessions": int(r.sessions_count)
            })
            
        if not stats:
            # Return dummy structure but with empty fields
            return {
                "focus_score": 0.0,
                "weekly_study_hours": 0.0,
                "focus_sessions_count": 0,
                "current_streak": 0,
                "longest_streak": 0,
                "average_sleep": 0.0,
                "average_focus": 0.0,
                "average_study_hours": 0.0,
                "completed_sessions": 0,
                "interrupted_sessions": 0,
                "avg_session_duration": 0.0,
                "attendance_rate": 100.0,
                "assignment_completion_rate": 0.0,
                "quiz_performance_rate": 0.0,
                "learning_consistency": 0.0,
                "last_calculated_at": str(datetime.utcnow()),
                "chart_data": []
            }
            
        return {
            "focus_score": float(stats.focus_score),
            "weekly_study_hours": float(stats.weekly_study_hours),
            "focus_sessions_count": int(stats.focus_sessions_count),
            "current_streak": int(stats.current_streak),
            "longest_streak": int(stats.longest_streak),
            "average_sleep": float(stats.average_sleep),
            "average_focus": float(stats.average_focus),
            "average_study_hours": float(stats.average_study_hours),
            "completed_sessions": int(stats.completed_sessions),
            "interrupted_sessions": int(stats.interrupted_sessions),
            "avg_session_duration": float(stats.avg_session_duration),
            "attendance_rate": float(stats.attendance_rate),
            "assignment_completion_rate": float(stats.assignment_completion_rate),
            "quiz_performance_rate": float(stats.quiz_performance_rate),
            "learning_consistency": float(stats.learning_consistency),
            "last_calculated_at": str(stats.last_calculated_at),
            "chart_data": chart_data
        }
    finally:
        db.close()