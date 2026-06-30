# backend/wellness_schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class DailyCheckInInput(BaseModel):
    mood: str
    energy_level: int
    focus_level: int
    stress_level: int
    sleep_hours: float
    planned_study_hours: float
    learning_goal: Optional[str] = None

class DailyCheckInUpdate(BaseModel):
    mood: Optional[str] = None
    energy_level: Optional[int] = None
    focus_level: Optional[int] = None
    stress_level: Optional[int] = None
    sleep_hours: Optional[float] = None
    planned_study_hours: Optional[float] = None
    learning_goal: Optional[str] = None

class DailyCheckInResponse(BaseModel):
    log_id: int
    student_id: int
    mood: str
    energy_level: int
    focus_level: int
    stress_level: int
    sleep_hours: float
    planned_study_hours: float
    learning_goal: Optional[str]
    log_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WeeklyReflectionInput(BaseModel):
    reflection_text: str

class WeeklyReflectionUpdate(BaseModel):
    reflection_text: str

class WeeklyReflectionResponse(BaseModel):
    reflection_id: int
    student_id: int
    reflection_text: str
    ref_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FocusSessionStartInput(BaseModel):
    preset_minutes: int

class FocusSessionUpdateInput(BaseModel):
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    interruptions_count: Optional[int] = None

class FocusSessionResponse(BaseModel):
    session_id: int
    student_id: int
    preset_minutes: int
    duration_minutes: int
    status: str
    interruptions_count: int
    started_at: datetime
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WellnessPreferencesInput(BaseModel):
    pomodoro_preset: Optional[int] = 25
    preferred_focus_duration: Optional[int] = 25
    daily_study_goal: Optional[float] = 4.0
    daily_sleep_goal: Optional[float] = 8.0
    reminder_time: Optional[str] = "09:00"
    notification_preference: Optional[bool] = True

class WellnessPreferencesResponse(BaseModel):
    preference_id: int
    student_id: int
    pomodoro_preset: int
    preferred_focus_duration: int
    daily_study_goal: float
    daily_sleep_goal: float
    reminder_time: str
    notification_preference: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WellnessStatisticsResponse(BaseModel):
    focus_score: float
    weekly_study_hours: float
    monthly_study_hours: float
    focus_sessions_count: int
    current_streak: int
    longest_streak: int
    average_sleep: float
    average_focus: float
    average_stress: float
    average_study_hours: float
    completed_sessions: int
    interrupted_sessions: int
    avg_session_duration: float
    attendance_rate: float
    assignment_completion_rate: float
    quiz_performance_rate: float
    learning_consistency: float
    last_calculated_at: datetime

    class Config:
        from_attributes = True
