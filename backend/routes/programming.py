from typing import Optional
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
    tags=["Programming"]
)

@router.get("/api/programming/topics")
def get_programming_topics(category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        query_str = "SELECT * FROM programming_topics"
        params = {}
        if category:
            query_str += " WHERE category = :category"
            params["category"] = category
        query_str += " ORDER BY topic_id ASC"
        res = db.execute(text(query_str), params).fetchall()
        
        topics = []
        for r in res:
            topics.append({
                "topic_id": r.topic_id,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "icon": r.icon,
                "created_at": str(r.created_at) if r.created_at else None
            })
        return topics
    finally:
        db.close()

@router.get("/api/programming/questions")
def get_programming_questions(topic_id: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        query_str = """
            SELECT q.*, COALESCE(p.completed, FALSE) as completed
            FROM programming_questions q
            LEFT JOIN student_programming_progress p 
              ON q.question_id = p.question_id AND p.student_id = :sid
        """
        params = {"sid": student_id or 0}
        
        if topic_id is not None:
            query_str += " WHERE q.topic_id = :topic_id"
            params["topic_id"] = topic_id
            
        query_str += " ORDER BY q.question_id ASC"
        res = db.execute(text(query_str), params).fetchall()
        
        questions = []
        for r in res:
            questions.append({
                "question_id": r.question_id,
                "topic_id": r.topic_id,
                "title": r.title,
                "difficulty": r.difficulty,
                "platform": r.platform,
                "url": r.url,
                "completed": bool(r.completed),
                "created_at": str(r.created_at) if r.created_at else None
            })
        return questions
    finally:
        db.close()

@router.post("/api/programming/questions/{question_id}/toggle-complete")
def toggle_question_complete(question_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can track programming progress")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # Verify question exists
        q_exists = db.execute(
            text("SELECT 1 FROM programming_questions WHERE question_id = :qid"),
            {"qid": question_id}
        ).fetchone()
        if not q_exists:
            raise HTTPException(status_code=404, detail="Programming question not found.")

        # Check if progress exists
        row = db.execute(text("""
            SELECT completed FROM student_programming_progress 
            WHERE student_id = :sid AND question_id = :qid
        """), {"sid": student_id, "qid": question_id}).fetchone()
        
        if row:
            # Toggle completion
            new_status = not row.completed
            db.execute(text("""
                UPDATE student_programming_progress 
                SET completed = :status, completed_at = CURRENT_TIMESTAMP
                WHERE student_id = :sid AND question_id = :qid
            """), {"sid": student_id, "qid": question_id, "status": new_status})
        else:
            new_status = True
            db.execute(text("""
                INSERT INTO student_programming_progress (student_id, question_id, completed)
                VALUES (:sid, :qid, TRUE)
            """), {"sid": student_id, "qid": question_id})
        
        db.commit()
        return {"success": True, "completed": new_status}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()

@router.get("/api/programming/stats")
def get_programming_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students have programming stats")
        
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        # 1. Total questions count by difficulty and platform
        all_q = db.execute(text("""
            SELECT difficulty, platform, COUNT(*) as count 
            FROM programming_questions 
            GROUP BY difficulty, platform
        """)).fetchall()
        
        # 2. Solved questions count by difficulty and platform
        solved_q = db.execute(text("""
            SELECT q.difficulty, q.platform, COUNT(*) as count
            FROM programming_questions q
            JOIN student_programming_progress p ON q.question_id = p.question_id
            WHERE p.student_id = :sid AND p.completed = TRUE
            GROUP BY q.difficulty, q.platform
        """), {"sid": student_id}).fetchall()
        
        # Format totals
        total_easy = sum(r.count for r in all_q if r.difficulty.lower() == "easy")
        total_medium = sum(r.count for r in all_q if r.difficulty.lower() == "medium")
        total_hard = sum(r.count for r in all_q if r.difficulty.lower() == "hard")
        total_questions = sum(r.count for r in all_q)
        
        solved_easy = sum(r.count for r in solved_q if r.difficulty.lower() == "easy")
        solved_medium = sum(r.count for r in solved_q if r.difficulty.lower() == "medium")
        solved_hard = sum(r.count for r in solved_q if r.difficulty.lower() == "hard")
        total_solved = sum(r.count for r in solved_q)
        
        # Platform breakdown
        platforms = ["Leetcode", "Codeforces", "HackerRank", "GitHub", "Practice"]
        platform_stats = {}
        for plat in platforms:
            tot = sum(r.count for r in all_q if r.platform.lower() == plat.lower())
            sol = sum(r.count for r in solved_q if r.platform.lower() == plat.lower())
            platform_stats[plat] = {
                "total": tot,
                "solved": sol
            }
            
        return {
            "total_questions": total_questions,
            "total_solved": total_solved,
            "difficulty_breakdown": {
                "easy": {"total": total_easy, "solved": solved_easy},
                "medium": {"total": total_medium, "solved": solved_medium},
                "hard": {"total": total_hard, "solved": solved_hard}
            },
            "platform_breakdown": platform_stats
        }
    finally:
        db.close()