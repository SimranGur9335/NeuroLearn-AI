from pydantic import BaseModel

class AnnouncementInput(BaseModel):
    title: str
    description: str

