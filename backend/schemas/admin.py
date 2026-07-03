from pydantic import BaseModel
from typing import Optional,List
class SystemSettingsInput(BaseModel):
    institution_name: str
    institution_logo: Optional[str] = ""
    academic_year: str
    contact_email: Optional[str] = ""
    contact_phone: Optional[str] = ""
    branding_color: Optional[str] = ""
    theme_preference: Optional[str] = ""

class AdminAssessmentComponentInput(BaseModel):
    name: str
    category: str
    max_marks: float
    weightage: float
    display_order: int
    is_mandatory: bool
    visible_to_students: bool
    editable_by_faculty: bool


class SubjectAssessmentsSaveInput(BaseModel):
    academic_year: str
    components: List[AdminAssessmentComponentInput]