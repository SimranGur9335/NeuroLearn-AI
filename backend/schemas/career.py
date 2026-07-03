from pydantic import BaseModel
from typing import Optional, List
class TargetCareerInput(BaseModel):
    target_career: str

class CareerProfileInput(BaseModel):
    resume_text: Optional[str] = None
    target_career: Optional[str] = None
    custom_skills: Optional[List[str]] = None

class InterviewAnswerInput(BaseModel):
    question: str
    answer: str
    topic: str