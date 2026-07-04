from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal

from backend.schemas.assignment import QuizSubmitInput

from backend.core.security import (
    get_current_user,
)

from backend.core.helpers import (
    handle_exception_securely,
)

router = APIRouter(
    tags=["Gamification"]
)

@router.get("/api/gamification/badges")
def get_student_badges_api(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Student ID required")
            
        metrics = db.execute(text("""
            SELECT attendance, quiz_score, predicted_cgpa, xp_points, streak 
            FROM student_metrics WHERE student_id = :sid
        """), {"sid": student_id}).fetchone()
        
        assign_count = db.execute(text("""
            SELECT COUNT(*) FROM assignment_submissions 
            WHERE student_id = :sid AND status = 'Graded'
        """), {"sid": student_id}).scalar() or 0
        
        quizzes_passed = db.execute(text("""
            SELECT COUNT(*) FROM quiz_attempts 
            WHERE student_id = :sid AND passed = TRUE
        """), {"sid": student_id}).scalar() or 0
        
        domains_count = db.execute(text("""
            SELECT COUNT(DISTINCT domain_id) FROM quiz_attempts 
            WHERE student_id = :sid
        """), {"sid": student_id}).scalar() or 0
        
        unlocked_res = db.execute(text("""
            SELECT badge_id FROM student_badges WHERE student_id = :sid
        """), {"sid": student_id}).fetchall()
        unlocked_badge_ids = {r.badge_id for r in unlocked_res}
        
        xp_pts = metrics.xp_points or 0 if metrics else 0
        streak_val = metrics.streak or 0 if metrics else 0
        cgpa_val = float(metrics.predicted_cgpa or 0.0) if metrics else 0.0
        attendance_val = float(metrics.attendance or 0.0) if metrics else 0.0
        
        badges_list = [
          { "id": "b1", "name": "Academic Topper", "description": "Achieve the highest score in your department quiz.", "category": "Academic Excellence", "icon": "Trophy", "xpReward": 500, "unlockCondition": "Rank 1 in Department Quiz", "unlocked": "b1" in unlocked_badge_ids, "progress": { "current": 1 if "b1" in unlocked_badge_ids else 0, "target": 1 } },
          { "id": "b2", "name": "Dean's List", "description": "Maintain an academic CGPA of 9.0 or above.", "category": "Academic Excellence", "icon": "Award", "xpReward": 400, "unlockCondition": "CGPA >= 9.0", "unlocked": cgpa_val >= 9.0 or "b2" in unlocked_badge_ids, "progress": { "current": cgpa_val, "target": 9.0 } },
          { "id": "b3", "name": "Subject Master", "description": "Complete all quizzes in a single domain with >90% average.", "category": "Academic Excellence", "icon": "BookOpen", "xpReward": 300, "unlockCondition": "Average score > 90%", "unlocked": "b3" in unlocked_badge_ids, "progress": { "current": 90 if "b3" in unlocked_badge_ids else 89, "target": 90 } },
          { "id": "b4", "name": "Perfect Attendance", "description": "Maintain a high attendance rate of 95% or higher.", "category": "Attendance", "icon": "CalendarCheck", "xpReward": 250, "unlockCondition": "Attendance >= 95%", "unlocked": attendance_val >= 95.0 or "b4" in unlocked_badge_ids, "progress": { "current": attendance_val, "target": 95 } },
          { "id": "b5", "name": "Consistent Learner", "description": "Maintain a study streak of 15 consecutive days.", "category": "Attendance", "icon": "Flame", "xpReward": 200, "unlockCondition": "15 Day Streak", "unlocked": streak_val >= 15 or "b5" in unlocked_badge_ids, "progress": { "current": streak_val, "target": 15 } },
          { "id": "b6", "name": "Campus Regular", "description": "Check in on campus for 30 consecutive days.", "category": "Attendance", "icon": "MapPin", "xpReward": 150, "unlockCondition": "30 Days Check-in", "unlocked": "b6" in unlocked_badge_ids, "progress": { "current": 30 if "b6" in unlocked_badge_ids else 12, "target": 30 } },
          { "id": "b7", "name": "Assignment Warrior", "description": "Complete 10 course assignments successfully.", "category": "Assignments", "icon": "FileText", "xpReward": 300, "unlockCondition": "10 Assignments Completed", "unlocked": assign_count >= 10 or "b7" in unlocked_badge_ids, "progress": { "current": assign_count, "target": 10 } },
          { "id": "b8", "name": "Deadline Crusher", "description": "Submit 5 assignments 24 hours before the deadline.", "category": "Assignments", "icon": "Clock", "xpReward": 200, "unlockCondition": "5 Early Submissions", "unlocked": "b8" in unlocked_badge_ids, "progress": { "current": 5 if "b8" in unlocked_badge_ids else 3, "target": 5 } },
          { "id": "b9", "name": "Zero Backlog Shield", "description": "Keep your backlog list completely clear for the semester.", "category": "Assignments", "icon": "Shield", "xpReward": 250, "unlockCondition": "No Pending Assignments", "unlocked": "b9" in unlocked_badge_ids, "progress": { "current": 0, "target": 0 } },
          { "id": "b10", "name": "Quiz Master", "description": "Complete 5 quizzes with an average score of over 85%.", "category": "Learning & Skills", "icon": "CheckCircle", "xpReward": 300, "unlockCondition": "5 Quizzes with >85% Score", "unlocked": quizzes_passed >= 5 or "b10" in unlocked_badge_ids, "progress": { "current": quizzes_passed, "target": 5 } },
          { "id": "b11", "name": "Knowledge Explorer", "description": "Unlock and view 4 learning domains.", "category": "Learning & Skills", "icon": "Compass", "xpReward": 150, "unlockCondition": "4 Domains Visited", "unlocked": domains_count >= 4 or "b11" in unlocked_badge_ids, "progress": { "current": domains_count, "target": 4 } },
          { "id": "b12", "name": "AI Enthusiast", "description": "Earn a score of 100% on any AI/ML track quiz.", "category": "Learning & Skills", "icon": "Cpu", "xpReward": 200, "unlockCondition": "100% Score on AI Quiz", "unlocked": "b12" in unlocked_badge_ids, "progress": { "current": 1 if "b12" in unlocked_badge_ids else 0, "target": 1 } },
          { "id": "b13", "name": "Club Contributor", "description": "Participate in 3 campus club technical events.", "category": "Community & Events", "icon": "Users", "xpReward": 200, "unlockCondition": "Attend 3 Events", "unlocked": "b13" in unlocked_badge_ids, "progress": { "current": 3 if "b13" in unlocked_badge_ids else 1, "target": 3 } },
          { "id": "b14", "name": "Campus Ambassador", "description": "Refer 5 other students to join the NeuroLearn portal.", "category": "Community & Events", "icon": "Megaphone", "xpReward": 350, "unlockCondition": "5 Referrals Registered", "unlocked": "b14" in unlocked_badge_ids, "progress": { "current": 3 if "b14" in unlocked_badge_ids else 0, "target": 5 } },
          { "id": "b15", "name": "Legend Rank", "description": "Reach Level 10 and enter the elite Legend leaderboard.", "category": "Elite Achievements", "icon": "Crown", "xpReward": 1000, "unlockCondition": "Reach Level 10", "unlocked": xp_pts >= 10000 or "b15" in unlocked_badge_ids, "progress": { "current": min(10, int(xp_pts / 1000)), "target": 10 } }
        ]
        
        # Save newly unlocked badges automatically
        modified = False
        for b in badges_list:
            if b["unlocked"] and b["id"] not in unlocked_badge_ids:
                db.execute(text("""
                    INSERT INTO student_badges (student_id, badge_id)
                    VALUES (:sid, :bid) ON CONFLICT DO NOTHING
                """), {"sid": student_id, "bid": b["id"]})
                db.execute(text("""
                    UPDATE student_metrics SET xp_points = xp_points + :xp WHERE student_id = :sid
                """), {"xp": b["xpReward"], "sid": student_id})
                db.execute(text("""
                    INSERT INTO notifications (student_id, title, message, type, created_at)
                    VALUES (:sid, 'Badge Unlocked!', :msg, 'general', CURRENT_TIMESTAMP)
                """), {"sid": student_id, "msg": f"Prestige Unlock: You earned the '{b['name']}' badge and +{b['xpReward']} XP!"})
                modified = True
                
        if modified:
            db.commit()
            
        return badges_list
    finally:
        db.close()


@router.get("/api/gamification/leaderboard")
def get_gamification_leaderboard(
    type: str = "student", 
    filter: str = "institution",
    current_user: dict = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        inst_id = current_user.get("institution_id", 1)
        
        if type == "faculty":
            # Rank faculty by log count in faculty_activities
            query_str = """
                SELECT f.faculty_id as id, f.full_name as name, f.faculty_code as "facultyCode",
                       f.department as branch, f.designation, f.avatar_url as avatar,
                       COUNT(fa.activity_id) as xp,
                       COUNT(CASE WHEN fa.module = 'attendance' THEN 1 END) as streak
                FROM faculty f
                LEFT JOIN faculty_activities fa ON f.faculty_id = fa.faculty_id
                WHERE f.institution_id = :inst_id
                GROUP BY f.faculty_id, f.full_name, f.faculty_code, f.department, f.designation, f.avatar_url
                ORDER BY xp DESC
            """
            rows = db.execute(text(query_str), {"inst_id": inst_id}).fetchall()
            leaderboard = []
            for idx, r in enumerate(rows):
                leaderboard.append({
                    "id": f"FC-{r.id}",
                    "name": r.name,
                    "facultyCode": r.facultyCode,
                    "branch": r.branch,
                    "designation": r.designation,
                    "avatar": r.avatar or "👨‍🏫",
                    "xp": r.xp * 150 + 500, 
                    "streak": r.streak or 0,
                    "rank": idx + 1
                })
            return leaderboard
            
        else: # student or overall
            query_str = """
                SELECT s.student_id as id, s.full_name as name, s.roll_no as "rollNumber",
                       s.department as branch, s.semester, s.avatar_url as avatar,
                       COALESCE(sm.xp_points, 0) as xp, COALESCE(sm.streak, 0) as streak
                FROM students s
                LEFT JOIN student_metrics sm ON s.student_id = sm.student_id
                WHERE s.institution_id = :inst_id
            """
            params = {"inst_id": inst_id}
            
            if filter == "department" and current_user.get("role") == "student":
                user_dept = db.execute(text("SELECT department FROM students WHERE student_id = :sid"), {"sid": current_user["student_id"]}).scalar()
                if user_dept:
                    query_str += " AND s.department = :dept"
                    params["dept"] = user_dept
            elif filter == "semester" and current_user.get("role") == "student":
                user_sem = db.execute(text("SELECT semester FROM students WHERE student_id = :sid"), {"sid": current_user["student_id"]}).scalar()
                if user_sem:
                    query_str += " AND s.semester = :sem"
                    params["sem"] = user_sem
                    
            rows = db.execute(text(query_str), params).fetchall()
            leaderboard = []
            for r in rows:
                leaderboard.append({
                    "id": f"ST-{r.id}",
                    "name": r.name,
                    "rollNumber": r.rollNumber,
                    "branch": r.branch,
                    "year": f"Semester {r.semester}",
                    "avatar": r.avatar or "🚀",
                    "xp": r.xp,
                    "streak": r.streak,
                })
                
            if filter == "weekly":
                for item in leaderboard:
                    item["xp"] = int((item["xp"] * 0.15) + (item["streak"] * 12) + (item["id"].split("-")[1].encode()[0] * 5))
                    
            leaderboard.sort(key=lambda x: x["xp"], reverse=True)
            for idx, item in enumerate(leaderboard):
                item["rank"] = idx + 1
            return leaderboard
    finally:
        db.close()


@router.get("/api/gamification/stats")
def get_gamification_stats(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Gamification stats only available to students")
            
        metrics = db.execute(text("""
            SELECT COALESCE(xp_points, 0) as xp, COALESCE(streak, 0) as streak 
            FROM student_metrics WHERE student_id = :sid
        """), {"sid": student_id}).fetchone()
        
        xp = metrics.xp if metrics else 0
        streak = metrics.streak if metrics else 0
        
        level_map = [
          { "level": 1, "name": "Freshman", "minXp": 0, "maxXp": 199 },
          { "level": 2, "name": "Learner", "minXp": 200, "maxXp": 499 },
          { "level": 3, "name": "Explorer", "minXp": 500, "maxXp": 999 },
          { "level": 4, "name": "Scholar", "minXp": 1000, "maxXp": 1799 },
          { "level": 5, "name": "Achiever", "minXp": 1800, "maxXp": 2799 },
          { "level": 6, "name": "Innovator", "minXp": 2800, "maxXp": 3999 },
          { "level": 7, "name": "Expert", "minXp": 4000, "maxXp": 5499 },
          { "level": 8, "name": "Mentor", "minXp": 5500, "maxXp": 7499 },
          { "level": 9, "name": "Elite", "minXp": 7500, "maxXp": 9999 },
          { "level": 10, "name": "Legend", "minXp": 10000, "maxXp": 999999 }
        ]
        current_lvl = next((lvl for lvl in level_map if xp >= lvl["minXp"] and xp <= lvl["maxXp"]), level_map[-1])
        
        all_students = db.execute(text("""
            SELECT s.student_id, COALESCE(sm.xp_points, 0) as xp 
            FROM students s 
            LEFT JOIN student_metrics sm ON s.student_id = sm.student_id 
            WHERE s.institution_id = :iid
            ORDER BY xp DESC
        """), {"iid": current_user.get("institution_id", 1)}).fetchall()
        
        total_cohort = len(all_students)
        user_rank = 1
        for idx, r in enumerate(all_students):
            if r.student_id == student_id:
                user_rank = idx + 1
                break
                
        pct = (user_rank / total_cohort * 100) if total_cohort > 0 else 100
        percentile_str = "Top 1%" if pct <= 1 else f"Top {round(pct)}%"
        
        badges_unlocked = db.execute(text("""
            SELECT COUNT(*) FROM student_badges WHERE student_id = :sid
        """), {"sid": student_id}).scalar() or 0
        
        progress_range = (current_lvl["maxXp"] - current_lvl["minXp"] + 1)
        progress_percent = round(((xp - current_lvl["minXp"]) / progress_range) * 100) if current_lvl["maxXp"] != 999999 else 100
        
        return {
            "xp": xp,
            "streak": streak,
            "level": current_lvl["level"],
            "level_name": current_lvl["name"],
            "min_xp": current_lvl["minXp"],
            "max_xp": current_lvl["maxXp"],
            "progress_percent": progress_percent,
            "rank": user_rank,
            "total_cohort": total_cohort,
            "percentile": percentile_str,
            "badges_unlocked": badges_unlocked
        }
    finally:
        db.close()


@router.get("/api/gamification/analytics")
def get_gamification_analytics(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Only students have quiz analytics")
            
        attempts = db.execute(text("""
            SELECT score, total_questions, passed, created_at 
            FROM quiz_attempts 
            WHERE student_id = :sid 
            ORDER BY created_at ASC
        """), {"sid": student_id}).fetchall()
        
        if not attempts:
            return {
                "total_quizzes": 0,
                "passed_quizzes": 0,
                "avg_score": 0.0,
                "passing_rate": 0.0,
                "history": []
            }
            
        total = len(attempts)
        passed = sum(1 for a in attempts if a.passed)
        avg = sum((float(a.score) / float(a.total_questions) * 100) if a.total_questions > 0 else 0 for a in attempts) / total
        
        history = []
        for a in attempts:
            history.append({
                "score": a.score,
                "total_questions": a.total_questions,
                "passed": a.passed,
                "date": str(a.created_at.date()) if a.created_at else None
            })
            
        return {
            "total_quizzes": total,
            "passed_quizzes": passed,
            "avg_score": round(avg, 1),
            "passing_rate": round(passed / total * 100, 1),
            "history": history
        }
    finally:
        db.close()


@router.post("/api/v1/quiz/submit")
def submit_quiz_score(data: QuizSubmitInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        student_id = current_user.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Only students can submit quiz scores")
            
        accuracy = (data.score / data.total_questions) if data.total_questions > 0 else 0.0
        passed = accuracy >= 0.60
        
        # 1. Insert into quiz_attempts
        db.execute(text("""
            INSERT INTO quiz_attempts (student_id, node_id, domain_id, score, total_questions, xp_earned, passed)
            VALUES (:sid, :nid, :did, :score, :tq, :xp, :passed)
        """), {
            "sid": student_id,
            "nid": data.node_id,
            "did": data.domain_id,
            "score": int(data.score),
            "tq": data.total_questions,
            "xp": data.xp_earned,
            "passed": passed
        })
        
        # 2. Calculate and update streak
        metrics = db.execute(text("SELECT streak, last_active_date FROM student_metrics WHERE student_id = :sid"), {"sid": student_id}).fetchone()
        current_streak = metrics.streak if metrics and metrics.streak else 0
        last_active = metrics.last_active_date if metrics else None
        
        today = datetime.now().date()
        if last_active:
            if last_active == today:
                pass
            elif last_active == today - timedelta(days=1):
                current_streak += 1
            else:
                current_streak = 1
        else:
            current_streak = 1
            
        # 3. Update student metrics (XP & Streak)
        db.execute(text("""
            UPDATE student_metrics 
            SET xp_points = xp_points + :xp, streak = :streak, last_active_date = :today, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = :sid
        """), {"xp": data.xp_earned, "streak": current_streak, "today": today, "sid": student_id})
        
        # 4. Insert completion notification
        db.execute(text("""
            INSERT INTO notifications (student_id, title, message, type, created_at)
            VALUES (:sid, 'Quiz Completed', :msg, 'general', CURRENT_TIMESTAMP)
        """), {
            "sid": student_id,
            "msg": f"Congratulations! You completed the quiz for '{data.node_id}' and earned {data.xp_earned} XP."
        })
        
        # 5. Badge Unlocks Check
        unlocked_res = db.execute(text("SELECT badge_id FROM student_badges WHERE student_id = :sid"), {"sid": student_id}).fetchall()
        unlocked_badge_ids = {r.badge_id for r in unlocked_res}
        
        new_badges = []
        
        # Check: AI Enthusiast (b12) -> 100% score on any AI/ML quiz
        if data.domain_id == 'artificial-intelligence' and accuracy >= 1.0 and "b12" not in unlocked_badge_ids:
            new_badges.append(("b12", "AI Enthusiast", 200))
            
        # Check: Consistent Learner (b5) -> 15 day streak
        if current_streak >= 15 and "b5" not in unlocked_badge_ids:
            new_badges.append(("b5", "Consistent Learner", 200))
            
        # Check: Quiz Master (b10) -> 5 quizzes completed successfully
        quizzes_passed = db.execute(text("SELECT COUNT(*) FROM quiz_attempts WHERE student_id = :sid AND passed = TRUE"), {"sid": student_id}).scalar() or 0
        if quizzes_passed >= 5 and "b10" not in unlocked_badge_ids:
            new_badges.append(("b10", "Quiz Master", 300))
            
        # Check: Knowledge Explorer (b11) -> Quizzes attempted in 4 different domains
        unique_domains = db.execute(text("SELECT COUNT(DISTINCT domain_id) FROM quiz_attempts WHERE student_id = :sid"), {"sid": student_id}).scalar() or 0
        if unique_domains >= 4 and "b11" not in unlocked_badge_ids:
            new_badges.append(("b11", "Knowledge Explorer", 150))
            
        # Insert new badges and trigger notifications
        for bid, bname, reward in new_badges:
            db.execute(text("""
                INSERT INTO student_badges (student_id, badge_id)
                VALUES (:sid, :bid) ON CONFLICT DO NOTHING
            """), {"sid": student_id, "bid": bid})
            db.execute(text("""
                UPDATE student_metrics SET xp_points = xp_points + :reward WHERE student_id = :sid
            """), {"reward": reward, "sid": student_id})
            db.execute(text("""
                INSERT INTO notifications (student_id, title, message, type, created_at)
                VALUES (:sid, 'Badge Unlocked!', :msg, 'general', CURRENT_TIMESTAMP)
            """), {
                "sid": student_id,
                "msg": f"Prestige Unlock: You earned the '{bname}' badge and +{reward} XP!"
            })
            
        db.commit()
        return {"status": "success", "xp_earned": data.xp_earned, "passed": passed, "streak": current_streak, "unlocked_badges": [b[1] for b in new_badges]}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()