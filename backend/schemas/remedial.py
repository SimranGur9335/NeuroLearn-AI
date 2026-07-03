from pydantic import BaseModel
from typing import Optional, List

class RemedialSessionCreateInput(BaseModel):
    class_id: int
    subject_id: int
    topic: str
    description: Optional[str] = None
    session_date: str
    session_time: str
    location: str
    student_ids: List[int]
    faculty_id: int


class InvitationStatusUpdate(BaseModel):
    status: str


class CancelRemedialSessionInput(BaseModel):
    faculty_id: int
    cancellation_reason: Optional[str] = None


class StartRemedialSessionInput(BaseModel):
    faculty_id: int


class CompleteRemedialSessionInput(BaseModel):
    faculty_id: int
    outcome: str
    remarks: str
    recommendation: str


class RemedialSessionUpdateInput(BaseModel):
    class_id: int
    subject_id: int
    topic: str
    description: Optional[str] = None
    session_date: str
    session_time: str
    location: str
    student_ids: List[int]
    faculty_id: int

class UpdateInvitationStatusInput(BaseModel):
    status: str
    faculty_id: int
