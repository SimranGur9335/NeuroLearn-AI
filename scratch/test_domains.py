# scratch/test_domains.py
import time
import json
from sqlalchemy import text
from backend.database import SessionLocal

db = SessionLocal()
try:
    start_time = time.time()
    rows = db.execute(text("""
        SELECT domain_id, domain_key, category, title, description, icon, difficulty, duration, avg_salary, popular,
               skills, roadmap, courses, certifications, projects, salary, placements, learning_resources, interview_prep
        FROM domains
        ORDER BY domain_id ASC
    """)).fetchall()
    duration = time.time() - start_time
    print(f"Query returned {len(rows)} domains in {duration:.4f} seconds.")
    
    start_time_parse = time.time()
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
    duration_parse = time.time() - start_time_parse
    print(f"JSON parsing took {duration_parse:.4f} seconds.")
    
    # Calculate response payload size in MB
    payload_str = json.dumps(result)
    size_mb = len(payload_str.encode('utf-8')) / (1024 * 1024)
    print(f"Total response payload size: {size_mb:.4f} MB")
except Exception as e:
    print(f"Error querying domains: {e}")
finally:
    db.close()
