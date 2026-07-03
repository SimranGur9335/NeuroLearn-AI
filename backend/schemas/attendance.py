from pydantic import BaseModel
from typing import Optional, List, Dict

class AttendanceInput(BaseModel):
    student_id: int
    class_id: int
    attendance_date: str
    status: str

class AttendanceRecordInput(BaseModel):
    student_id: int
    status: str

class AttendanceSaveInput(BaseModel):
    class_id: int
    subject_id: int
    faculty_id: int
    date: str
    records: List[AttendanceRecordInput]