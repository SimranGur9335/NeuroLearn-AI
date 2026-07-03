from pydantic import BaseModel
class AcademicPredictInput(BaseModel):
    age: int
    studytime: int
    failures: int
    absences: int
    G1: float
    G2: float

class RunRiskEngineInput(BaseModel):
    class_id: int
    faculty_id: int