from pydantic import BaseModel
from typing import Optional, Dict

class FacultyMappingInput(BaseModel):
    faculty_id: int
    subject_id: int
    class_id: int
    academic_year: str



class FacultyInput(BaseModel):
    faculty_code: str
    full_name: str
    email: str
    department: str
    designation: str

class CreateFacultyInput(BaseModel):
    full_name: str
    faculty_id: str
    department: str
    phone: str
    designation: Optional[str] = "Faculty Member"

class StudentInterventionUpdateInput(BaseModel):
    faculty_notes: Optional[str] = None
    intervention_status: Optional[str] = None
    faculty_id: int