from pydantic import BaseModel
from typing import Optional, Dict
class AssignmentCreateInput(BaseModel):
    subject_id: int
    class_id: int
    title: str
    description: str
    due_date: str
    total_marks: int
    faculty_id: int
    due_time: Optional[str] = "23:59"
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None
    attachment_type: Optional[str] = None
    attachment_size: Optional[int] = None
    instructions: Optional[str] = None
    status: Optional[str] = "Published"

class GradeSubmissionInput(BaseModel):
    marks_obtained: int
    status: str
    faculty_id: int
    feedback: Optional[str] = None

class CloseAssignmentInput(BaseModel):
    faculty_id: int

class QuizSubmitInput(BaseModel):
    node_id: str
    domain_id: str
    score: float
    total_questions: int
    xp_earned: int