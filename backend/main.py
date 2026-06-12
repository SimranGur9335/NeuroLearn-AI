from fastapi import FastAPI
import joblib
from pathlib import Path
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class StudentPerformanceInput(BaseModel):
    age: int
    studytime: int
    failures: int
    absences: int
    G1: int
    G2: int

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent

student_model = joblib.load(
    BASE_DIR /
    "models" /
    "academic" /
    "student_performance_rf.pkl"
)

@app.get("/")
def home():
    return {
        "message": "NeuroLearn AI Backend Running"
    }

@app.get("/model-status")
def model_status():
    return {
        "student_performance": "loaded"
    }

@app.get("/predict-test")
def predict_test():
    return {
        "predicted_grade": 14.8
    }

@app.post("/predict/student-performance")
def predict_student_performance(data: StudentPerformanceInput):

    prediction = student_model.predict([
        [
            0,  # school
            0,  # sex
            data.age,
            0,  # address
            0,  # famsize
            0,  # Pstatus
            2,  # Medu
            2,  # Fedu
            0,  # Mjob
            0,  # Fjob
            0,  # reason
            0,  # guardian
            1,  # traveltime
            data.studytime,
            data.failures,
            0, 0, 0, 0, 0, 0, 0, 0,
            3, 3, 3, 1, 1, 3,
            data.absences,
            data.G1,
            data.G2,
            0   # course_type
        ]
    ])

    return {
        "predicted_grade": round(float(prediction[0]), 2)
    }