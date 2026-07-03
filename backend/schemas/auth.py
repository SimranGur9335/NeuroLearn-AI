from typing import Optional
from pydantic import BaseModel
class LoginInput(BaseModel):
    email: str
    password: str
    role: str
    institution_id: Optional[int] = 1


class RefreshInput(BaseModel):
    refresh_token: Optional[str] = None

class RegisterInput(BaseModel):
    email: str
    password: str
    name: str
    role: str
    institution_id: Optional[int] = 1
    roll_no: Optional[str] = None
    department: Optional[str] = None
    division: Optional[str] = None
    semester: Optional[int] = None
    faculty_code: Optional[str] = None
    designation: Optional[str] = None

class ForgotPasswordInput(BaseModel):
    email: str

class ChangePasswordInput(BaseModel):
    old_password: str
    new_password: str

class PasswordChangeInput(BaseModel):
    old_password: str
    new_password: str

class AvatarUpdateInput(BaseModel):
    avatar_url: str