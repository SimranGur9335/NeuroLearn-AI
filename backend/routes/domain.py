import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.core.security import (
    get_current_user,
)

from backend.core.helpers import (
    handle_exception_securely,
)

router = APIRouter(
    tags=["Domains"]
)


# --- Dynamic Domains Module Endpoints ---

@router.get("/api/v1/domains")
def get_domains():
    db = SessionLocal()
    try:
        rows = db.execute(text("""
            SELECT domain_id, domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
                   skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
            FROM domains
            ORDER BY domain_id ASC
        """)).fetchall()
        
        result = []
        for r in rows:
            result.append({
                "id": r.domain_key,
                "domain_id": r.domain_id,
                "domain_key": r.domain_key,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "icon": r.icon,
                "difficulty": r.difficulty,
                "duration": r.duration,
                "avgSalary": r.avg_salary,
                "popular": r.popular,
                "skills": json.loads(r.skills) if isinstance(r.skills, str) else r.skills,
                "nodes": json.loads(r.roadmap) if isinstance(r.roadmap, str) else r.roadmap,
                "courses": json.loads(r.courses) if isinstance(r.courses, str) else r.courses,
                "certifications": json.loads(r.certifications) if isinstance(r.certifications, str) else r.certifications,
                "projects": json.loads(r.projects) if isinstance(r.projects, str) else r.projects,
                "salary": json.loads(r.salary) if isinstance(r.salary, str) else r.salary,
                "placements": json.loads(r.placements) if isinstance(r.placements, str) else r.placements,
                "learning_resources": json.loads(r.learning_resources) if isinstance(r.learning_resources, str) else r.learning_resources,
                "interview_prep": json.loads(r.interview_prep) if isinstance(r.interview_prep, str) else r.interview_prep
            })
        return result
    finally:
        db.close()


@router.get("/api/v1/domains/{domain_key}")
def get_domain_detail(domain_key: str):
    db = SessionLocal()
    try:
        r = db.execute(text("""
            SELECT domain_id, domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
                   skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
            FROM domains
            WHERE domain_key = :key
        """), {"key": domain_key}).fetchone()
        
        if not r:
            raise HTTPException(status_code=404, detail="Domain not found")
            
        return {
            "id": r.domain_key,
            "domain_id": r.domain_id,
            "domain_key": r.domain_key,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "icon": r.icon,
            "difficulty": r.difficulty,
            "duration": r.duration,
            "avgSalary": r.avg_salary,
            "popular": r.popular,
            "skills": json.loads(r.skills) if isinstance(r.skills, str) else r.skills,
            "nodes": json.loads(r.roadmap) if isinstance(r.roadmap, str) else r.roadmap,
            "courses": json.loads(r.courses) if isinstance(r.courses, str) else r.courses,
            "certifications": json.loads(r.certifications) if isinstance(r.certifications, str) else r.certifications,
            "projects": json.loads(r.projects) if isinstance(r.projects, str) else r.projects,
            "salary": json.loads(r.salary) if isinstance(r.salary, str) else r.salary,
            "placements": json.loads(r.placements) if isinstance(r.placements, str) else r.placements,
            "learning_resources": json.loads(r.learning_resources) if isinstance(r.learning_resources, str) else r.learning_resources,
            "interview_prep": json.loads(r.interview_prep) if isinstance(r.interview_prep, str) else r.interview_prep
        }
    finally:
        db.close()