from typing import Optional
from pydantic import BaseModel
class InstitutionApplication(BaseModel):
    institution_name: str
    institution_code: str
    contact_person: str
    email: str
    phone: str
    website: Optional[str] = None
    address: str

class InstitutionConfigurationInput(BaseModel):
    institution_name: str
    logo_url: Optional[str] = ""
    academic_year: str
    theme: Optional[str] = ""
    contact_email: Optional[str] = ""
    contact_phone: Optional[str] = ""