from typing import Optional
from pydantic import BaseModel

class SubjectInput(BaseModel):
    subject_code: str
    subject_name: str
    credits: int
    department: str
    semester: int



class DepartmentInput(BaseModel):
    department_name: str
    department_code: str



class ClassInput(BaseModel):
    class_name: str
    division: str
    department: str
    semester: int
    term_id: Optional[int] = None

class EnrollmentInput(BaseModel):
    student_id: int
    class_id: int

class CourseInput(BaseModel):
    course_code: str
    course_title: str
    department: str
    category: str
    duration: str

class CourseSubjectMappingInput(BaseModel):
    course_id: int
    subject_id: int
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    priority: Optional[str] = "Normal"
    attachment_url: Optional[str] = None
    attachment_name: Optional[str] = None

class AcademicTermInput(BaseModel):
    academic_year: str
    semester: int

