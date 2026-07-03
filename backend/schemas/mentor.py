from pydantic import BaseModel
from typing import Optional
class MentorChatInput(BaseModel):
    message: str
    session_id: Optional[int] = None

class RenameChatInput(BaseModel):
    title: str

class AiChatInput(BaseModel):
    prompt: str