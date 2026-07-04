import random
import bcrypt
import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy import text

from backend.database import SessionLocal
from backend.schemas.auth import (
    LoginInput, RefreshInput, RegisterInput, ForgotPasswordInput, ChangePasswordInput,
    AvatarUpdateInput, PasswordChangeInput
)
from backend.core.security import (
    get_current_user, create_access_token, create_refresh_token, verify_token, hash_password
)
from backend.core.helpers import (
    handle_exception_securely, get_current_academic_year, log_audit,
)
from backend.services.notification_service import log_faculty_activity, create_notification

router = APIRouter(
    tags=["Authentication & Profile"]
)

failed_logins_tracker = {}

@router.post("/api/v1/auth/login")
def login_route(data: LoginInput, response: Response):
    # Lockout check
    now = datetime.utcnow()
    tracker = failed_logins_tracker.get(data.email, {"failed_attempts": 0, "lockout_until": None})
    if tracker["lockout_until"] and tracker["lockout_until"] > now:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts."
        )

    db = SessionLocal()
    try:
        # Get user
        user = db.execute(
            text("SELECT user_id, email, password_hash, role, student_id, faculty_id, institution_id, must_change_password FROM users WHERE email = :email AND role = :role"),
            {"email": data.email, "role": data.role}
        ).fetchone()

        if not user or (user.role != "super_admin" and user.institution_id != data.institution_id):
            # Log failed login attempt
            db.execute(
                text("""
                    INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                    VALUES (:email, 'LOGIN_FAILED', 'User not found, role mismatch, or wrong institution select', :iid, CURRENT_TIMESTAMP)
                """),
                {"email": data.email, "iid": data.institution_id}
            )
            db.commit()
            
            # Lockout logic
            tracker["failed_attempts"] += 1
            if tracker["failed_attempts"] >= 5:
                tracker["lockout_until"] = datetime.utcnow() + timedelta(seconds=45)
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=429, detail="Too many login attempts.")
            else:
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=400, detail="Incorrect Login ID or Password")

        # Verify password using bcrypt
        password_bytes = data.password.encode('utf-8')
        hash_bytes = user.password_hash.encode('utf-8')
        if not bcrypt.checkpw(password_bytes, hash_bytes):
            # Log failed login attempt
            db.execute(
                text("""
                    INSERT INTO security_events (user_id, email, event_type, details, institution_id, created_at)
                    VALUES (:user_id, :email, 'LOGIN_FAILED', 'Incorrect password', :iid, CURRENT_TIMESTAMP)
                """),
                {"user_id": user.user_id, "email": data.email, "iid": user.institution_id}
            )
            db.commit()
            
            # Lockout logic
            tracker["failed_attempts"] += 1
            if tracker["failed_attempts"] >= 5:
                tracker["lockout_until"] = datetime.utcnow() + timedelta(seconds=45)
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=429, detail="Too many login attempts.")
            else:
                failed_logins_tracker[data.email] = tracker
                raise HTTPException(status_code=400, detail="Incorrect Login ID or Password")

        # Reset failed attempts on success
        if data.email in failed_logins_tracker:
            del failed_logins_tracker[data.email]

        # Fetch extra details depending on role
        name = "System Administrator"
        roll_number = None
        branch = None
        designation = None
        college = "NeuroLearn AI"
        inst_color = "indigo"
        inst_logo = "/assets/logo.png"
        
        # Query user's institution, falling back to default/first active institution if unassigned
        iid = user.institution_id or 1
        inst = db.execute(
            text("SELECT institution_name, theme_color, logo_url FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        if not inst and not user.institution_id:
            inst = db.execute(
                text("SELECT institution_name, theme_color, logo_url FROM institutions WHERE status = 'active' LIMIT 1")
            ).fetchone()
            
        if inst:
            college = inst.institution_name
            inst_color = inst.theme_color
            inst_logo = inst.logo_url

        if user.role == "student" and user.student_id:
            student = db.execute(
                text("SELECT full_name, roll_no, department, division, semester FROM students WHERE student_id = :sid"),
                {"sid": user.student_id}
            ).fetchone()
            if student:
                name = student.full_name
                roll_number = student.roll_no
                branch = f"B.Tech {student.department}"
        elif user.role == "faculty" and user.faculty_id:
            faculty = db.execute(
                text("SELECT full_name, department, designation FROM faculty WHERE faculty_id = :fid"),
                {"fid": user.faculty_id}
            ).fetchone()
            if faculty:
                name = faculty.full_name
                branch = faculty.department
                designation = faculty.designation

        # Log successful login
        db.execute(
            text("""
                INSERT INTO security_events (user_id, email, event_type, details, institution_id, created_at)
                VALUES (:user_id, :email, 'LOGIN_SUCCESS', 'Successful login authentication', :iid, CURRENT_TIMESTAMP)
            """),
            {"user_id": user.user_id, "email": data.email, "iid": user.institution_id}
        )
        db.commit()
        
        # Create tokens
        token_payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "student_id": user.student_id,
            "faculty_id": user.faculty_id,
            "institution_id": user.institution_id
        }
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        # Set cookies on response
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=120 * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        # Determine avatar based on role or database avatar_url
        avatar = "🚀"
        if user.role == "super_admin":
            avatar = "👑"
        elif user.role == "admin":
            avatar = "🛡️"
        elif user.role == "faculty" and user.faculty_id:
            row = db.execute(text("SELECT avatar_url FROM faculty WHERE faculty_id = :fid"), {"fid": user.faculty_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "👨‍🏫"
        elif user.role == "student" and user.student_id:
            row = db.execute(text("SELECT avatar_url FROM students WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "🚀"

        # Assemble user payload
        user_info = {
            "email": user.email,
            "name": name,
            "role": user.role,
            "college": college,
            "institution_id": user.institution_id,
            "theme_color": inst_color,
            "logo_url": inst_logo,
            "avatar": avatar,
            "mustChangePassword": bool(user.must_change_password)
        }
        if user.student_id:
            user_info["student_id"] = user.student_id
            user_info["rollNumber"] = roll_number
            user_info["branch"] = branch
            metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            user_info["xp"] = metrics_row.xp_points if metrics_row else 0
        if user.faculty_id:
            user_info["faculty_id"] = user.faculty_id
            user_info["branch"] = branch
            user_info["designation"] = designation

        return {
            "user": user_info,
            "accessToken": access_token,
            "refreshToken": refresh_token
        }
    finally:
        db.close()


@router.post("/api/v1/auth/refresh")
def refresh_token_route(data: RefreshInput, response: Response, request: Request):
    rf_token = data.refresh_token or request.cookies.get("refresh_token")
    if not rf_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token!")

    payload = verify_token(rf_token, token_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token!")

    db = SessionLocal()
    try:
        # Check blacklist for token rotation
        blacklisted = db.execute(text("SELECT 1 FROM token_blacklist WHERE token = :t"), {"t": rf_token}).fetchone()
        if blacklisted:
            raise HTTPException(status_code=401, detail="Refresh token has been invalidated.")
            
        # Blacklist the old refresh token (Token Rotation!)
        db.execute(text("INSERT INTO token_blacklist (token) VALUES (:t) ON CONFLICT DO NOTHING"), {"t": rf_token})
        db.commit()

        user = db.execute(
            text("SELECT user_id, email, role, student_id, faculty_id, institution_id FROM users WHERE user_id = :uid"),
            {"uid": payload["user_id"]}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="User not found!")

        # Re-fetch info
        name = "System Administrator"
        roll_number = None
        branch = None
        designation = None
        college = "NeuroLearn AI"
        inst_color = "indigo"
        inst_logo = "/assets/logo.png"

        # Query user's institution, falling back to default/first active institution if unassigned
        iid = user.institution_id or 1
        inst = db.execute(
            text("""
                SELECT institution_name, theme_color, logo_url
                FROM institutions
                WHERE institution_id = :iid
            """),
            {"iid": iid}
        ).fetchone()
        if not inst and not user.institution_id:
            inst = db.execute(
                text("SELECT institution_name, theme_color, logo_url FROM institutions WHERE status = 'active' LIMIT 1")
            ).fetchone()

        if inst:
            college = inst.institution_name
            inst_color = inst.theme_color
            inst_logo = inst.logo_url

        if user.role == "super_admin":
            name = "Platform Owner"
            college = "NeuroLearn AI Platform"

        if user.role == "student" and user.student_id:
            student = db.execute(
                text("SELECT full_name, roll_no, department, division, semester FROM students WHERE student_id = :sid"),
                {"sid": user.student_id}
            ).fetchone()
            if student:
                name = student.full_name
                roll_number = student.roll_no
                branch = f"B.Tech {student.department}"
        elif user.role == "faculty" and user.faculty_id:
            faculty = db.execute(
                text("SELECT full_name, department, designation FROM faculty WHERE faculty_id = :fid"),
                {"fid": user.faculty_id}
            ).fetchone()
            if faculty:
                name = faculty.full_name
                branch = faculty.department
                designation = faculty.designation

        token_payload = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "student_id": user.student_id,
            "faculty_id": user.faculty_id,
            "institution_id": user.institution_id
        }
        access_token = create_access_token(token_payload)
        new_refresh_token = create_refresh_token(token_payload)

        # Set new rotated cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=120 * 60
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        # Determine avatar based on database avatar_url
        avatar = "🚀"
        if user.role == "super_admin":
            avatar = "👑"
        elif user.role == "admin":
            avatar = "🛡️"
        elif user.role == "faculty" and user.faculty_id:
            row = db.execute(text("SELECT avatar_url FROM faculty WHERE faculty_id = :fid"), {"fid": user.faculty_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "👨‍🏫"
        elif user.role == "student" and user.student_id:
            row = db.execute(text("SELECT avatar_url FROM students WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            avatar = row.avatar_url if row and row.avatar_url else "🚀"

        user_info = {
            "email": user.email,
            "name": name,
            "role": user.role,
            "college": college,
            "institution_id": user.institution_id,
            "theme_color": inst_color,
            "logo_url": inst_logo,
            "avatar": avatar
        }
        if user.student_id:
            user_info["student_id"] = user.student_id
            user_info["rollNumber"] = roll_number
            user_info["branch"] = branch
            metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": user.student_id}).fetchone()
            user_info["xp"] = metrics_row.xp_points if metrics_row else 0
        if user.faculty_id:
            user_info["faculty_id"] = user.faculty_id
            user_info["branch"] = branch
            user_info["designation"] = designation

        return {
            "user": user_info,
            "accessToken": access_token,
            "refreshToken": new_refresh_token
        }
    finally:
        db.close()


@router.post("/api/v1/auth/logout")
def logout_route(response: Response, current_user: dict = Depends(get_current_user), request: Request = None):
    # Retrieve token manually from cookie or Authorization header to blacklist
    token = request.cookies.get("access_token") if request else None
    if not token and request:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if token:
        db = SessionLocal()
        try:
            db.execute(text("INSERT INTO token_blacklist (token) VALUES (:t) ON CONFLICT DO NOTHING"), {"t": token})
            db.commit()
        finally:
            db.close()
            
    # Remove cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    
    return {"success": True, "message": "Successfully logged out and invalidated session."}


@router.post("/api/v1/auth/register")
def register_route(data: RegisterInput):
    email = data.email.strip().lower()
    db = SessionLocal()
    try:
        # Check institution exists
        inst = db.execute(
            text("SELECT short_name ,domain_name FROM institutions WHERE institution_id = :iid"),
            {"iid": data.institution_id}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=400, detail="Invalid selected institution selection.")

        # Enforce email domain rule (allowing @neurolearn.ai for demo accounts)
        valid_domain = inst.domain_name.lower()
        email_domain = email.split("@")[-1]
        
        short_name_clean = "".join(c for c in inst.short_name.lower() if c.isalnum())
        is_valid_domain = (
            email_domain == valid_domain or 
            email_domain == "neurolearn.ai" or
            short_name_clean in email_domain
        )

        if not is_valid_domain:
            db.execute(
                text("""
                    INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                    VALUES (:email, 'REGISTER_BLOCKED', :details, :iid, CURRENT_TIMESTAMP)
                """),
                {"email": email, "details": f"Email domain {email_domain} does not match institution domain {valid_domain}", "iid": data.institution_id}
            )
            db.commit()
            raise HTTPException(
                status_code=400, 
                detail=f"Only official institutional emails ending with @{valid_domain} are allowed for {inst.institution_name}."
            )

        # Check if email already registered
        existing_user = db.execute(text("SELECT user_id FROM users WHERE email = :email"), {"email": email}).fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="This email is already registered inside NeuroLearn!")

        password_hash = hash_password(data.password)
        student_id = None
        faculty_id = None

        if data.role == "student":
            roll_no = data.roll_no or f"MOCK{random.randint(1000, 9999)}"
            existing_student = db.execute(text("SELECT student_id FROM students WHERE roll_no = :roll OR email = :email"), {"roll": roll_no, "email": email}).fetchone()
            if existing_student:
                student_id = existing_student.student_id
            else:
                dept = data.department or "Computer Engineering"
                div = data.division or "A"
                sem = data.semester or 5
                student_id = db.execute(
                    text("""
                        INSERT INTO students (roll_no, full_name, email, department, semester, division, institution_id, created_at)
                        VALUES (:roll, :name, :email, :dept, :sem, :div, :iid, CURRENT_TIMESTAMP)
                        RETURNING student_id
                    """),
                    {"roll": roll_no, "name": data.name, "email": email, "dept": dept, "sem": sem, "div": div, "iid": data.institution_id}
                ).scalar()

                db.execute(
                    text("INSERT INTO enrollments (student_id, class_id, created_at) VALUES (:sid, 1, CURRENT_TIMESTAMP)"),
                    {"sid": student_id}
                )

                db.execute(
                    text("""
                        INSERT INTO student_metrics (student_id, attendance, quiz_score, risk_level, predicted_cgpa, xp_points, updated_at)
                        VALUES (:sid, 85.0, 75.0, 'Low', 8.2, 500, CURRENT_TIMESTAMP)
                    """),
                    {"sid": student_id}
                )

        elif data.role == "faculty":
            code = data.faculty_code or f"FAC{random.randint(100, 999)}"
            existing_faculty = db.execute(text("SELECT faculty_id FROM faculty WHERE faculty_code = :code OR email = :email"), {"code": code, "email": email}).fetchone()
            if existing_faculty:
                faculty_id = existing_faculty.faculty_id
            else:
                dept = data.department or "Computer Engineering"
                desg = data.designation or "Faculty Member"
                faculty_id = db.execute(
                    text("""
                        INSERT INTO faculty (faculty_code, full_name, email, department, designation, institution_id, created_at)
                        VALUES (:code, :name, :email, :dept, :desg, :iid, CURRENT_TIMESTAMP)
                        RETURNING faculty_id
                    """),
                    {"code": code, "name": data.name, "email": email, "dept": dept, "desg": desg, "iid": data.institution_id}
                ).scalar()

                db.execute(
                    text("""
                        INSERT INTO faculty_assignments (faculty_id, class_id, subject_id, role, academic_year, created_at)
                        VALUES (:fid, 1, 1, 'Theory', :ay, CURRENT_TIMESTAMP)
                    """),
                    {"fid": faculty_id, "ay": get_current_academic_year(db, data.institution_id)}
                )

        # Create user account
        db.execute(
            text("""
                INSERT INTO users (email, password_hash, role, student_id, faculty_id, institution_id, created_at, updated_at)
                VALUES (:email, :hash, :role, :sid, :fid, :iid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """),
            {"email": email, "hash": password_hash, "role": data.role, "sid": student_id, "fid": faculty_id, "iid": data.institution_id}
        )

        db.commit()
        
        # Log successful registration
        db.execute(
            text("""
                INSERT INTO security_events (email, event_type, details, institution_id, created_at)
                VALUES (:email, 'REGISTER_SUCCESS', 'Successful registration', :iid, CURRENT_TIMESTAMP)
            """),
            {"email": email, "iid": data.institution_id}
        )
        db.commit()

        return {"success": True, "message": "User registered successfully"}
    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")
    finally:
        db.close()


@router.post("/api/v1/auth/change-password")
def change_password(data: ChangePasswordInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = db.execute(
            text("SELECT user_id, password_hash FROM users WHERE user_id = :uid"),
            {"uid": current_user["user_id"]}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify old password
        if not bcrypt.checkpw(data.old_password.encode('utf-8'), user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=400, detail="Incorrect current password")

        # Hash and update new password
        new_pwd_hash = hash_password(data.new_password)
        db.execute(
            text("""
                UPDATE users 
                SET password_hash = :pwd, 
                    must_change_password = FALSE, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = :uid
            """),
            {"pwd": new_pwd_hash, "uid": current_user["user_id"]}
        )
        db.commit()
        log_audit(db, "PASSWORD_CHANGE", "User", current_user["user_id"], current_user["email"])
        return {"success": True, "message": "Password changed successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/auth/forgot-password")
def forgot_password(data: ForgotPasswordInput):
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.execute(
            text("SELECT user_id, email FROM users WHERE email = :email"),
            {"email": data.email}
        ).fetchone()
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account registered with this email address."
            )
        
        # Generate temporary password
        temp_pwd = f"Temp{random.randint(10000, 99999)}!"
        password_bytes = temp_pwd.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Update user's password and require change on next login
        db.execute(
            text("UPDATE users SET password_hash = :hash, must_change_password = TRUE WHERE user_id = :uid"),
            {"hash": hashed, "uid": user.user_id}
        )
        db.commit()
        
        # Log the security event
        db.execute(
            text("""
                INSERT INTO security_events (user_id, email, event_type, details, created_at)
                VALUES (:uid, :email, 'PASSWORD_RESET_REQUEST', 'Temporary password generated', CURRENT_TIMESTAMP)
            """),
            {"uid": user.user_id, "email": user.email}
        )
        db.commit()
        
        return {
            "success": True,
            "message": "Temporary password generated successfully.",
            "temp_password": temp_pwd
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


# =====================================================
# Profile Endpoints
# =====================================================

@router.get("/api/v1/profile")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        uid = current_user["user_id"]
        role = current_user["role"]
        
        profile_data = {
            "user_id": uid,
            "email": current_user["email"],
            "role": role
        }
        
        if role == "student" and current_user["student_id"]:
            sid = current_user["student_id"]
            s = db.execute(text("SELECT * FROM students WHERE student_id = :sid"), {"sid": sid}).fetchone()
            if s:
                metrics_row = db.execute(text("SELECT xp_points FROM student_metrics WHERE student_id = :sid"), {"sid": sid}).fetchone()
                
                # Fetch career details (resume, custom_skills, certificates, achievements)
                career_row = db.execute(text("SELECT resume_text, custom_skills, certificates, achievements FROM student_career_profiles WHERE student_id = :sid"), {"sid": sid}).fetchone()
                
                resume_text = ""
                skills_list = []
                certs_list = []
                achievements_list = []
                
                if career_row:
                    resume_text = career_row.resume_text or ""
                    try:
                        skills_list = json.loads(career_row.custom_skills) if career_row.custom_skills else []
                    except Exception:
                        skills_list = []
                    try:
                        certs_list = json.loads(career_row.certificates) if career_row.certificates else []
                    except Exception:
                        certs_list = []
                    try:
                        achievements_list = json.loads(career_row.achievements) if career_row.achievements else []
                    except Exception:
                        achievements_list = []
                else:
                    # Create default empty career profile row if not exists
                    db.execute(text("INSERT INTO student_career_profiles (student_id) VALUES (:sid) ON CONFLICT DO NOTHING"), {"sid": sid})
                    db.commit()

                profile_data.update({
                    "name": s.full_name,
                    "rollNumber": s.roll_no,
                    "branch": s.department,
                    "semester": s.semester,
                    "division": s.division,
                    "mobile": s.mobile or "",
                    "avatar": s.avatar_url or "🚀",
                    "xp": metrics_row.xp_points if metrics_row else 0,
                    "resume": resume_text,
                    "skills": skills_list,
                    "certificates": certs_list,
                    "achievements": achievements_list
                })
        elif role == "faculty" and current_user["faculty_id"]:
            f = db.execute(text("SELECT * FROM faculty WHERE faculty_id = :fid"), {"fid": current_user["faculty_id"]}).fetchone()
            if f:
                # Fetch assigned classes and subjects
                assignments = db.execute(
                    text("""
                        SELECT fa.assignment_id, c.class_id, c.class_name, s.subject_id, s.subject_name, s.subject_code, fa.role, fa.academic_year
                        FROM faculty_assignments fa
                        JOIN classes c ON fa.class_id = c.class_id
                        JOIN subjects s ON fa.subject_id = s.subject_id
                        WHERE fa.faculty_id = :faculty_id
                    """),
                    {"faculty_id": current_user["faculty_id"]}
                ).fetchall()

                assigned_classes = []
                assigned_subjects = []
                seen_classes = set()
                seen_subjects = set()
                seen_classes_and_subjects = set()

                for row in assignments:
                    if row.class_id not in seen_classes:
                        seen_classes.add(row.class_id)
                        assigned_classes.append({
                            "class_id": row.class_id,
                            "class_name": row.class_name
                        })
                    if row.subject_id not in seen_subjects:
                        seen_subjects.add(row.subject_id)
                        assigned_subjects.append({
                            "subject_id": row.subject_id,
                            "subject_code": row.subject_code,
                            "subject_name": row.subject_name
                        })

                # Fetch institution name
                institution_name = "NeuroLearn AI"
                if f.institution_id:
                    inst = db.execute(
                        text("SELECT institution_name FROM institutions WHERE institution_id = :iid"),
                        {"iid": f.institution_id}
                    ).fetchone()
                    if inst:
                        institution_name = inst.institution_name

                # Fetch account status & change password status
                u = db.execute(
                    text("SELECT must_change_password FROM users WHERE user_id = :uid"),
                    {"uid": uid}
                ).fetchone()
                must_change_password = bool(u.must_change_password) if u else False

                profile_data.update({
                    "name": f.full_name,
                    "faculty_code": f.faculty_code,
                    "branch": f.department,
                    "designation": f.designation,
                    "avatar": f.avatar_url or "👨‍🏫",
                    "assigned_classes": assigned_classes,
                    "assigned_subjects": assigned_subjects,
                    "institution_name": institution_name,
                    "must_change_password": must_change_password,
                    "account_status": "Active"
                })
        else:
            profile_data.update({
                "name": "System Administrator",
                "avatar": "🛡️"
            })
        return profile_data
    finally:
        db.close()


@router.post("/api/v1/profile/update")
def update_my_profile(data: dict, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "student" and current_user["student_id"]:
            sid = current_user["student_id"]
            db.execute(
                text("""
                    UPDATE students
                    SET full_name = :name, department = :dept, semester = :sem, division = :div, mobile = :mobile, roll_no = :roll
                    WHERE student_id = :sid
                """),
                {
                    "name": data.get("name"),
                    "dept": data.get("branch"),
                    "sem": int(data.get("semester", 5)),
                    "div": data.get("division", "A"),
                    "mobile": data.get("mobile", ""),
                    "roll": data.get("rollNumber", ""),
                    "sid": sid
                }
            )
            
            # Update student_career_profiles table
            skills_json = json.dumps(data.get("skills", []))
            certs_json = json.dumps(data.get("certificates", []))
            ach_json = json.dumps(data.get("achievements", []))
            resume_val = data.get("resume", "")
            
            career_exists = db.execute(text("SELECT student_id FROM student_career_profiles WHERE student_id = :sid"), {"sid": sid}).fetchone()
            if career_exists:
                db.execute(
                    text("""
                        UPDATE student_career_profiles
                        SET resume_text = :resume, custom_skills = :skills, certificates = :certs, achievements = :ach, updated_at = CURRENT_TIMESTAMP
                        WHERE student_id = :sid
                    """),
                    {
                        "resume": resume_val,
                        "skills": skills_json,
                        "certs": certs_json,
                        "ach": ach_json,
                        "sid": sid
                    }
                )
            else:
                db.execute(
                    text("""
                        INSERT INTO student_career_profiles (student_id, resume_text, custom_skills, certificates, achievements)
                        VALUES (:sid, :resume, :skills, :certs, :ach)
                    """),
                    {
                        "sid": sid,
                        "resume": resume_val,
                        "skills": skills_json,
                        "certs": certs_json,
                        "ach": ach_json
                    }
                )
            db.commit()
            log_audit(db, "UPDATE_PROFILE", "Student", sid, performed_by=f"Student {sid}")
            create_notification(db, "student", sid, "Profile Updated", "Your profile details have been successfully updated.", "profile", sid)
        elif role == "faculty" and current_user["faculty_id"]:
            fid = current_user["faculty_id"]
            db.execute(
                text("""
                    UPDATE faculty
                    SET full_name = :name, department = :dept, designation = :desg
                    WHERE faculty_id = :fid
                """),
                {
                    "name": data.get("name"),
                    "dept": data.get("branch"),
                    "desg": data.get("designation"),
                    "fid": fid
                }
            )
            db.commit()
            log_audit(db, "UPDATE_PROFILE", "Faculty", fid, performed_by=f"Faculty {fid}")
            log_faculty_activity(fid, "profile", "updated", "Updated faculty profile details.", fid, db=db)
            create_notification(db, "faculty", fid, "Profile Updated", "Your profile details have been successfully updated.", "profile", fid)
        return {"success": True, "message": "Profile updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/profile/avatar")
def update_my_avatar(data: AvatarUpdateInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        role = current_user["role"]
        if role == "student" and current_user["student_id"]:
            db.execute(text("UPDATE students SET avatar_url = :url WHERE student_id = :sid"), {"url": data.avatar_url, "sid": current_user["student_id"]})
            db.commit()
            create_notification(db, "student", current_user["student_id"], "Avatar Updated", "Your profile avatar has been successfully updated.", "profile", current_user["student_id"])
        elif role == "faculty" and current_user["faculty_id"]:
            db.execute(text("UPDATE faculty SET avatar_url = :url WHERE faculty_id = :fid"), {"url": data.avatar_url, "fid": current_user["faculty_id"]})
            db.commit()
            create_notification(db, "faculty", current_user["faculty_id"], "Avatar Updated", "Your profile avatar has been successfully updated.", "profile", current_user["faculty_id"])
        return {"success": True, "message": "Avatar updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/profile/change-password")
def change_my_password(data: PasswordChangeInput, current_user: dict = Depends(get_current_user)):
    db = SessionLocal()
    try:
        uid = current_user["user_id"]
        user = db.execute(text("SELECT password_hash FROM users WHERE user_id = :uid"), {"uid": uid}).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify old password
        password_bytes = data.old_password.encode('utf-8')
        hash_bytes = user.password_hash.encode('utf-8')
        if not bcrypt.checkpw(password_bytes, hash_bytes):
            # Log failed attempt
            db.execute(
                text("""
                    INSERT INTO security_events (user_id, email, event_type, details, created_at)
                    VALUES (:uid, :email, 'PASSWORD_CHANGE_FAILED', 'Incorrect old password', CURRENT_TIMESTAMP)
                """),
                {"uid": uid, "email": current_user["email"]}
            )
            db.commit()
            raise HTTPException(status_code=400, detail="The current password you entered is incorrect!")
        
        # Hash new password
        new_hash = hash_password(data.new_password)
        db.execute(text("UPDATE users SET password_hash = :hash, updated_at = CURRENT_TIMESTAMP WHERE user_id = :uid"), {"hash": new_hash, "uid": uid})
        db.commit()
        # Log success
        db.execute(
            text("""
                INSERT INTO security_events (user_id, email, event_type, details, created_at)
                VALUES (:uid, :email, 'PASSWORD_CHANGE_SUCCESS', 'Successfully changed password', CURRENT_TIMESTAMP)
            """),
            {"uid": uid, "email": current_user["email"]}
        )
        db.commit()
        log_audit(db, "CHANGE_PASSWORD", "User", uid, performed_by=f"User {uid}")
        if current_user.get("role") == "faculty" and current_user.get("faculty_id"):
            log_faculty_activity(current_user["faculty_id"], "authentication", "changed_password", "Successfully changed account password.", current_user["faculty_id"], db=db)
            create_notification(db, "faculty", current_user["faculty_id"], "Security Alert: Password Changed", "Your NeuroLearn-AI account password was successfully updated.", "profile", current_user["faculty_id"])
        return {"success": True, "message": "Password changed successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()