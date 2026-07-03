from typing import Optional, Dict ,List
from pydantic import BaseModel
class StudentInput(BaseModel):
    roll_no: str
    full_name: str
    email: str
    department: str
    semester: int
    division: str


class CreateStudentInput(BaseModel):
    full_name: str
    roll_no: str
    department: str
    semester: int
    division: str
    phone: str

class StudentSubmissionInput(BaseModel):
    student_id: int
    submission_url: Optional[str] = None
    submission_file_name: Optional[str] = None
    submission_file_size: Optional[int] = None
    external_url: Optional[str] = None

class StudentMarkEntry(BaseModel):
    student_id: int
    assignment_marks: float
    quiz_marks: float
    internal_marks: float
    practical_marks: float

class StudentAssessmentMarkEntry(BaseModel):
    student_id: int
    marks: Dict[str, float] 

class StudentPerformanceInput(BaseModel):
    age: int
    studytime: int
    failures: int
    absences: int
    G1: int
    G2: int

class BulkMarksInput(BaseModel):
    class_id: int
    subject_id: int
    faculty_id: int
    marks_list: Optional[List[StudentMarkEntry]] = None
    custom_marks_list: Optional[List[StudentAssessmentMarkEntry]] = None
    is_publish: Optional[bool] = False