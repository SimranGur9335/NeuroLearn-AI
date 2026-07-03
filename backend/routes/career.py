import os
import re
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal
from backend.schemas.career import TargetCareerInput, CareerProfileInput, InterviewAnswerInput
from backend.core.security import get_current_user
from backend.core.helpers import handle_exception_securely

router = APIRouter(
    tags=["Career"]
)

@router.post("/api/v1/student/target-career")
def set_target_career(data: TargetCareerInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can set target careers.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        db.execute(
            text("""
                UPDATE student_metrics
                SET target_career = :tc, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid
            """),
            {"tc": data.target_career, "sid": sid}
        )
        db.commit()
        return {"success": True, "message": "Target career updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/v1/student/target-career")
def get_target_career(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can fetch target careers.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        tc = db.execute(
            text("SELECT target_career FROM student_metrics WHERE student_id = :sid"),
            {"sid": sid}
        ).scalar() or "ai-engineer"
        return {"target_career": tc}
    finally:
        db.close()


@router.get("/api/v1/career/profile")
def get_career_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can access career profiles.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        # Ensure row exists
        profile = db.execute(
            text("SELECT resume_text, target_career, custom_skills, ai_analysis FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if not profile:
            # Let's seed an empty profile
            db.execute(
                text("""
                    INSERT INTO student_career_profiles (student_id, resume_text, target_career, custom_skills, ai_analysis)
                    VALUES (:sid, NULL, 'ai-engineer', '[]'::jsonb, NULL)
                    ON CONFLICT (student_id) DO NOTHING
                """),
                {"sid": sid}
            )
            db.commit()
            profile = db.execute(
                text("SELECT resume_text, target_career, custom_skills, ai_analysis FROM student_career_profiles WHERE student_id = :sid"),
                {"sid": sid}
            ).fetchone()
            
        custom_skills = []
        if profile.custom_skills:
            if isinstance(profile.custom_skills, str):
                custom_skills = json.loads(profile.custom_skills)
            else:
                custom_skills = profile.custom_skills
                
        ai_analysis = None
        if profile.ai_analysis:
            if isinstance(profile.ai_analysis, str):
                ai_analysis = json.loads(profile.ai_analysis)
            else:
                ai_analysis = profile.ai_analysis
                
        return {
            "resume_text": profile.resume_text,
            "target_career": profile.target_career,
            "custom_skills": custom_skills,
            "ai_analysis": ai_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/api/v1/career/profile")
def save_career_profile(data: CareerProfileInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can update career profiles.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        custom_skills_json = json.dumps(data.custom_skills or [])
        
        # Check if row exists
        existing = db.execute(
            text("SELECT student_id FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if existing:
            db.execute(
                text("""
                    UPDATE student_career_profiles
                    SET resume_text = COALESCE(:resume_text, resume_text),
                        target_career = COALESCE(:target_career, target_career),
                        custom_skills = COALESCE(:custom_skills, custom_skills),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE student_id = :sid
                """),
                {
                    "resume_text": data.resume_text,
                    "target_career": data.target_career,
                    "custom_skills": custom_skills_json if data.custom_skills is not None else None,
                    "sid": sid
                }
            )
        else:
            db.execute(
                text("""
                    INSERT INTO student_career_profiles (student_id, resume_text, target_career, custom_skills)
                    VALUES (:sid, :resume_text, :target_career, :custom_skills)
                """),
                {
                    "sid": sid,
                    "resume_text": data.resume_text or "",
                    "target_career": data.target_career or "ai-engineer",
                    "custom_skills": custom_skills_json
                }
            )
            
        # Also sync target_career to student_metrics
        if data.target_career:
            db.execute(
                text("UPDATE student_metrics SET target_career = :tc, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid"),
                {"tc": data.target_career, "sid": sid}
            )
            
        db.commit()
        return {"success": True, "message": "Career profile saved successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.post("/api/v1/career/analyze")
def analyze_career_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can trigger career profile analysis.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        
        # 1. Fetch student info
        student = db.execute(
            text("SELECT s.full_name, s.department, s.semester, sm.predicted_cgpa, sm.attendance, sm.xp_points FROM students s JOIN student_metrics sm ON s.student_id = sm.student_id WHERE s.student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
            
        # 2. Fetch career profile details
        profile = db.execute(
            text("SELECT resume_text, target_career, custom_skills FROM student_career_profiles WHERE student_id = :sid"),
            {"sid": sid}
        ).fetchone()
        
        resume_text = profile.resume_text if (profile and profile.resume_text) else "No resume uploaded."
        target_career = profile.target_career if (profile and profile.target_career) else "ai-engineer"
        custom_skills_list = []
        if profile and profile.custom_skills:
            if isinstance(profile.custom_skills, str):
                custom_skills_list = json.loads(profile.custom_skills)
            else:
                custom_skills_list = profile.custom_skills
                
        # 3. Fetch completed quiz attempts
        quiz_attempts = db.execute(
            text("SELECT DISTINCT node_id, domain_id FROM quiz_attempts WHERE student_id = :sid AND passed = True"),
            {"sid": sid}
        ).fetchall()
        completed_quizzes = [f"{q.domain_id}/{q.node_id}" for q in quiz_attempts]
        
        # 4. Fetch completed programming problems
        programming = db.execute(
            text("""
                SELECT pq.title, pq.difficulty 
                FROM student_programming_progress spp 
                JOIN programming_questions pq ON spp.question_id = pq.question_id 
                WHERE spp.student_id = :sid AND spp.completed = True
            """),
            {"sid": sid}
        ).fetchall()
        completed_programming = [f"{p.title} ({p.difficulty})" for p in programming]
        
        # Call Gemini or execute fallback
        gemini_key = os.getenv("GEMINI_API_KEY")
        analysis_result = None
        
        prompt = f"""
You are an expert AI Career Mentor. Analyze the following student's profile for the target role: "{target_career}".

### STUDENT PROFILE:
- Name: {student.full_name}
- Department: {student.department}
- Semester: {student.semester}
- CGPA: {float(student.predicted_cgpa) if student.predicted_cgpa else 0.0}
- Attendance: {float(student.attendance) if student.attendance else 0.0}%
- XP Points: {student.xp_points}
- Completed Quizzes (Curriculum Topics): {completed_quizzes}
- Completed Programming Problems: {completed_programming}
- Custom Self-Declared Skills: {custom_skills_list}
- Uploaded Resume Text:
---
{resume_text}
---

Generate a highly personalized AI Career Guidance report in JSON format.
You must return ONLY a valid JSON object. Do not include markdown formatting like ```json or anything else. The output should be a parseable JSON block matching this schema:

{{
  "readiness_score": integer (0 to 100 representing their readiness for placement in the target career),
  "readiness_summary": "string summary of their profile alignment",
  "role_recommendations": [
    {{
      "title": "string (matching alternative tech role from: AI Engineer, Machine Learning Engineer, Data Scientist, Data Analyst, Software Engineer, Cloud Engineer, Cyber Security Analyst, DevOps Engineer, Product Manager, Business Analyst)",
      "alignment": integer (0 to 100),
      "reason": "string detailed explanation why this aligns with their background"
    }}
  ],
  "skill_gap_analysis": {{
    "acquired": ["string of skills the student has shown proficiency in"],
    "missing": ["string of crucial missing skills for their target role"]
  }},
  "resume_suggestions": [
    "string suggestion 1",
    "string suggestion 2"
  ],
  "placement_readiness": {{
    "score": integer (0 to 100),
    "strengths": ["string strength 1", "string strength 2"],
    "weak_areas": ["string weak area 1", "string weak area 2"],
    "preparation_tips": ["string actionable prep tip 1", "string actionable prep tip 2"]
  }},
  "learning_suggestions": [
    {{
      "type": "string (quiz | certification | course)",
      "title": "string title",
      "url": "string (url to quiz, e.g. /quiz?domain=ai-ml&node=aiml-3, or external resource url)"
    }}
  ],
  "company_recommendations": [
    {{
      "name": "string company name from standard market",
      "role": "string recommended internship/entry level role",
      "suitability": "string (High | Medium | Low alignment reasoning)"
    }}
  ],
  "internship_opportunities": [
    {{
      "title": "string title",
      "company": "string company",
      "description": "string description",
      "link": "string url"
    }}
  ],
  "mock_interview_questions": [
    {{
      "question": "string technical question related to their target role, gaps, and resume",
      "topic": "string topic area"
    }}
  ]
}}
"""
        
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                # Clean clean json tags if gemini output markdown by mistake
                if raw_text.startswith("```"):
                    raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                    raw_text = re.sub(r'\n```$', '', raw_text)
                analysis_result = json.loads(raw_text.strip())
            except Exception as e:
                print(f"Gemini API error during career analysis: {e}")
                
        # Heuristic/Fallback generator if Gemini failed or key was missing
        if not analysis_result:
            # Let's map target role to default recommendations
            readiness_val = int(min(95, max(30, int(student.xp_points / 25) + int(float(student.predicted_cgpa or 0) * 5))))
            
            # Simple list of companies
            companies_mapping = {
                "ai-engineer": [{"name": "NVIDIA", "role": "Research Intern - Deep Learning", "suitability": "High alignment"}, {"name": "Google", "role": "ML Intern", "suitability": "Medium alignment"}],
                "software-engineer": [{"name": "Microsoft", "role": "Software Engineering Intern", "suitability": "High alignment"}, {"name": "TCS", "role": "Systems Engineer", "suitability": "High alignment"}],
                "cloud-engineer": [{"name": "Amazon AWS", "role": "Cloud Support Associate", "suitability": "High alignment"}, {"name": "GCP", "role": "Cloud Solutions Intern", "suitability": "Medium alignment"}],
                "cybersecurity-analyst": [{"name": "Palo Alto Networks", "role": "Security Intern", "suitability": "High alignment"}, {"name": "CrowdStrike", "role": "SOC Analyst", "suitability": "Medium alignment"}]
            }
            role_cos = companies_mapping.get(target_career, [{"name": "Cognizant", "role": "Technical Graduate", "suitability": "High alignment"}])
            
            # Generate mock questions
            q_mapping = {
                "ai-engineer": [
                    {"question": "What is the difference between supervised fine-tuning and RLHF in LLMs?", "topic": "Generative AI"},
                    {"question": "Explain vanishing gradients and how residual skips prevent them.", "topic": "Deep Learning"}
                ],
                "software-engineer": [
                    {"question": "Explain database normalization up to BCNF and when to denormalize.", "topic": "DBMS"},
                    {"question": "Compare REST API vs WebSockets for real-time messaging workloads.", "topic": "Web Architecture"}
                ],
                "cloud-engineer": [
                    {"question": "What is the role of an Ingress Controller in a Kubernetes cluster?", "topic": "Microservices"},
                    {"question": "How do IAM roles compare to user keys for access security?", "topic": "Cloud IAM"}
                ],
                "cybersecurity-analyst": [
                    {"question": "Walk through the steps of an SSL/TLS handshake.", "topic": "Cryptography"},
                    {"question": "Explain SQL Injection vulnerabilities and how prepared queries secure them.", "topic": "Web Exploits"}
                ]
            }
            role_qs = q_mapping.get(target_career, [
                {"question": "Describe an engineering problem you solved and your implementation methodology.", "topic": "General Engineering"},
                {"question": "How do you check computational complexity using Big O notation?", "topic": "DSA"}
            ])
            
            analysis_result = {
                "readiness_score": readiness_val,
                "readiness_summary": f"Your current academic profile (CGPA {student.predicted_cgpa}, {student.xp_points} XP) shows solid progression. You have completed {len(completed_quizzes)} quizzes and {len(completed_programming)} programming challenges. Focus on bridging gaps around {target_career.replace('-', ' ').title()} specific libraries.",
                "role_recommendations": [
                    {"title": "Machine Learning Engineer" if target_career == "ai-engineer" else "AI Engineer", "alignment": readiness_val - 5, "reason": "Strong background in statistics and database processing aligns well with ML pipelines."},
                    {"title": "Software Engineer", "alignment": readiness_val + 10, "reason": "High programming completions qualify you for general systems engineering roles."}
                ],
                "skill_gap_analysis": {
                    "acquired": ["Python", "SQL", "Git"] + custom_skills_list[:3],
                    "missing": ["LangChain", "Vector Databases", "MLOps Infrastructure"] if target_career == "ai-engineer" else ["Docker", "Kubernetes", "Redis Caching"]
                },
                "resume_suggestions": [
                    f"Integrate keywords matching the '{target_career.replace('-', ' ').title()}' role descriptors such as data analysis and model tracking.",
                    "Quantify project metrics (e.g. 'Reduced indexing time by 30% using vector caching').",
                    "Add technical profiles (Leetcode, Github) directly to the header.",
                    "Ensure your professional summary aligns with your career target."
                ],
                "placement_readiness": {
                    "score": readiness_val,
                    "strengths": [f"Excellent attendance record of {student.attendance}%", f"Active platform involvement with {student.xp_points} XP"],
                    "weak_areas": ["Requires larger capstone projects listed on resume", "Needs more mock interview practice"],
                    "preparation_tips": ["Complete at least 5 intermediate domain-specific quizzes", "Run regular mock technical interviews on standard questions"]
                },
                "learning_suggestions": [
                    {"type": "quiz", "title": "Generative AI & LLMs", "url": "/quiz?domain=ai-ml&node=aiml-4"},
                    {"type": "certification", "title": "AWS Certified Cloud Practitioner", "url": "https://aws.amazon.com/certification/"}
                ],
                "company_recommendations": role_cos,
                "internship_opportunities": [
                    {
                        "title": f"{target_career.replace('-', ' ').title()} Intern",
                        "company": role_co["name"],
                        "description": f"Build analytics dashboards and scalable connectors. Key alignment: {role_co['suitability']}",
                        "link": "https://supabase.com/careers"
                    } for role_co in role_cos
                ],
                "mock_interview_questions": role_qs
            }
            
        # 5. Save the analysis to database
        db.execute(
            text("UPDATE student_career_profiles SET ai_analysis = :ai_analysis, updated_at = CURRENT_TIMESTAMP WHERE student_id = :sid"),
            {"ai_analysis": json.dumps(analysis_result), "sid": sid}
        )
        db.commit()
        return analysis_result
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.post("/api/v1/career/interview/evaluate")
def evaluate_interview_response(data: InterviewAnswerInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can submit interview responses.")
        
    gemini_key = os.getenv("GEMINI_API_KEY")
    prompt = f"""
You are a technical interviewer. Evaluate the student's answer to the mock interview question below.

Question Topic: {data.topic}
Question: {data.question}
Student's Response:
---
{data.answer}
---

Provide a constructive review of their response in JSON format.
You must return ONLY a valid JSON object. Do not include markdown formatting like ```json or anything else. The output should be a parseable JSON block matching this schema:

{{
  "score": integer (0 to 100 rating the accuracy and depth of their response),
  "verdict": "string (e.g. Excellent, Good, Needs Improvement, Incorrect)",
  "strengths": "string describing what they did well",
  "weaknesses": "string detailing what was missing or incorrect",
  "suggested_improvement": "string providing the correct/better way to phrase or answer the question, including any relevant code/concepts"
}}
"""
    eval_result = None
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = re.sub(r'^```(?:json)?\n', '', raw_text)
                raw_text = re.sub(r'\n```$', '', raw_text)
            eval_result = json.loads(raw_text.strip())
        except Exception as e:
            print(f"Gemini evaluation error: {e}")
            
    if not eval_result:
        # Fallback evaluation logic based on length and keywords
        score = 40
        verdict = "Needs Improvement"
        strengths = "Attempted the question."
        weaknesses = "Lacks deep technical details or specific examples."
        suggested = "For a complete answer, explain key components mathematically, provide structure definitions, or outline actual use cases. (Fallback Mode)"
        
        answer_lower = data.answer.lower()
        if len(data.answer) > 50:
            score += 15
            verdict = "Good"
            strengths = "Provided a reasonable verbal explanation."
            
        # Topic specific keywords
        keywords = {
            "Generative AI": ["rlhf", "fine-tuning", "weights", "dataset", "prompts"],
            "Deep Learning": ["vanishing", "gradients", "relu", "sigmoid", "residual", "backpropagation"],
            "DBMS": ["bcnf", "normalization", "redundancy", "join", "anomaly"],
            "Web Architecture": ["websocket", "stateless", "http", "polling", "latency"],
            "Microservices": ["ingress", "pod", "kubernetes", "k8s", "proxy"],
            "Cloud IAM": ["role", "permissions", "temporary", "access key", "least privilege"],
            "Cryptography": ["handshake", "ssl", "tls", "private key", "public key", "certificates"],
            "Web Exploits": ["sqli", "prepared", "parameterized", "sanitize", "input"]
        }
        
        matches = [kw for kw in keywords.get(data.topic, []) if kw in answer_lower]
        if len(matches) >= 2:
            score = min(95, score + 20)
            verdict = "Excellent" if score > 80 else "Good"
            strengths += f" Correctly referenced relevant terminologies: {', '.join(matches)}."
            
        eval_result = {
            "score": score,
            "verdict": verdict,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "suggested_improvement": suggested
        }
        
    return eval_result