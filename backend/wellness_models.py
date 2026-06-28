# backend/wellness_models.py
from sqlalchemy import Column, Integer, String, Numeric, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class LearningWellnessLog(Base):
    __tablename__ = "learning_wellness_logs"
    
    log_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    mood = Column(String(50), nullable=False)
    energy_level = Column(Integer, nullable=False)
    focus_level = Column(Integer, nullable=False)
    stress_level = Column(Integer, nullable=False)
    sleep_hours = Column(Numeric(5, 2), nullable=False)
    planned_study_hours = Column(Numeric(5, 2), nullable=False)
    learning_goal = Column(Text, nullable=True)
    log_date = Column(Date, nullable=False, default=datetime.utcnow().date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

class FocusSession(Base):
    __tablename__ = "focus_sessions"
    
    session_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    preset_minutes = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, default=0)
    status = Column(String(50), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

class WeeklyReflection(Base):
    __tablename__ = "weekly_reflections"
    
    reflection_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    reflection_text = Column(Text, nullable=False)
    ref_date = Column(Date, nullable=False, default=datetime.utcnow().date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

class WellnessPreference(Base):
    __tablename__ = "wellness_preferences"
    
    preference_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), unique=True, nullable=False)
    pomodoro_preset = Column(Integer, default=25)
    daily_study_goal = Column(Numeric(5, 2), default=4.00)
    daily_sleep_goal = Column(Numeric(5, 2), default=8.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

class WellnessStatistic(Base):
    __tablename__ = "wellness_statistics"
    
    stat_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), unique=True, nullable=False)
    focus_score = Column(Numeric(5, 2), default=0.00)
    weekly_study_hours = Column(Numeric(5, 2), default=0.00)
    focus_sessions_count = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    average_sleep = Column(Numeric(5, 2), default=0.00)
    average_focus = Column(Numeric(5, 2), default=0.00)
    average_study_hours = Column(Numeric(5, 2), default=0.00)
    completed_sessions = Column(Integer, default=0)
    interrupted_sessions = Column(Integer, default=0)
    avg_session_duration = Column(Numeric(5, 2), default=0.00)
    attendance_rate = Column(Numeric(5, 2), default=0.00)
    assignment_completion_rate = Column(Numeric(5, 2), default=0.00)
    quiz_performance_rate = Column(Numeric(5, 2), default=0.00)
    learning_consistency = Column(Numeric(5, 2), default=0.00)
    last_calculated_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
