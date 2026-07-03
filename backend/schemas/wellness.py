
from pydantic import BaseModel
from typing import List

class WellnessMoodInput(BaseModel):
    happiness: int
    focus: int
    frustration: int
    stress: int
    sleep_hours: float
    study_hours: float
    learning_habits: List[str]