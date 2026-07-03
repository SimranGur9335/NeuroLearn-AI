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