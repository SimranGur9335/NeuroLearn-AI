import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal
from backend.core.security import get_current_user, require_role, hash_password
from backend.core.helpers import (
    log_audit,
    handle_exception_securely,
)
from backend.schemas.institution import InstitutionApplication

router = APIRouter(
    tags=["Platform Admin"]
)


@router.post("/api/v1/institution/apply")
def apply_institution(data: InstitutionApplication):
    db = SessionLocal()

    try:
        existing = db.execute(
            text("""
                SELECT request_id
                FROM institution_requests
                WHERE email = :email
                AND status = 'pending'
            """),
            {"email": data.email}
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Application already pending"
            )

        db.execute(
            text("""
                INSERT INTO institution_requests (
                    institution_name,
                    institution_code,
                    contact_person,
                    email,
                    phone,
                    website,
                    address,
                    status,
                    created_at
                )
                VALUES (
                    :institution_name,
                    :institution_code,
                    :contact_person,
                    :email,
                    :phone,
                    :website,
                    :address,
                    'pending',
                    CURRENT_TIMESTAMP
                )
            """),
            {
                "institution_name": data.institution_name,
                "institution_code": data.institution_code.upper(),
                "contact_person": data.contact_person,
                "email": data.email,
                "phone": data.phone,
                "website": data.website,
                "address": data.address
            }
        )

        db.commit()

        return {
            "success": True,
            "message": "Institution application submitted successfully"
        }

    finally:
        db.close()


@router.get("/api/v1/platform-admin/institution-requests")
def get_institution_requests(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()

    try:
        rows = db.execute(
            text("""
                SELECT
                    request_id,
                    institution_name,
                    institution_code,
                    contact_person,
                    email,
                    phone,
                    website,
                    address,
                    status,
                    created_at
                FROM institution_requests
                ORDER BY created_at DESC
            """)
        ).fetchall()

        return [
            {
                "request_id": row.request_id,
                "institution_name": row.institution_name,
                "institution_code": row.institution_code,
                "contact_person": row.contact_person,
                "email": row.email,
                "phone": row.phone,
                "website": row.website,
                "address": row.address,
                "status": row.status,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]

    finally:
        db.close()


@router.post("/api/v1/platform-admin/approve/{request_id}")
def approve_institution(request_id: int, current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()

    try:
        request = db.execute(
            text("""
                SELECT *
                FROM institution_requests
                WHERE request_id = :rid
            """),
            {"rid": request_id}
        ).fetchone()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Request not found"
            )

        institution = db.execute(
            text("""
                SELECT institution_id
                FROM institutions
                WHERE
                    REPLACE(UPPER(short_name),' ','') = 
                    REPLACE(UPPER(:code),' ','')
            """),
            {"code": request.institution_code}
        ).fetchone()

        if not institution:
            raise HTTPException(
                status_code=404,
                detail="Institution not found"
            )

        existing_admin = db.execute(
            text("""
                SELECT user_id
                FROM users
                WHERE role='admin'
                AND institution_id=:iid
            """),
            {"iid": institution.institution_id}
        ).fetchone()

        if existing_admin:
            raise HTTPException(
                status_code=400,
                detail="Admin already exists"
            )

        admin_email = f"admin_{request.institution_code.lower()}@neurolearn.ai"

        # Generate random temporary password dynamically
        temp_pwd = f"Temp{random.randint(10000, 99999)}!"
        hashed_pwd = hash_password(temp_pwd)

        db.execute(
            text("""
                INSERT INTO users (
                    email,
                    password_hash,
                    role,
                    institution_id,
                    must_change_password,
                    is_active,
                    created_at,
                    updated_at
                )
                VALUES (
                    :email,
                    :hash,
                    'admin',
                    :iid,
                    TRUE,
                    TRUE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            """),
            {
                "email": admin_email,
                "iid": institution.institution_id,
                "hash": hashed_pwd
            }
        )

        db.execute(
            text("""
                UPDATE institution_requests
                SET status='approved',
                    approved_at=CURRENT_TIMESTAMP
                WHERE request_id=:rid
            """),
            {"rid": request_id}
        )

        db.commit()

        return {
            "success": True,
            "institution": request.institution_name,
            "admin_email": admin_email,
            "temporary_password": temp_pwd
        }

    finally:
        db.close()


@router.get("/api/v1/platform-admin/dashboard-stats")
def get_platform_admin_stats(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        pending_requests = db.execute(
            text("SELECT COUNT(*) FROM institution_requests WHERE status = 'pending'")
        ).scalar() or 0

        approved_requests = db.execute(
            text("SELECT COUNT(*) FROM institution_requests WHERE status = 'approved'")
        ).scalar() or 0

        total_institutions = db.execute(
            text("SELECT COUNT(*) FROM institutions")
        ).scalar() or 0

        total_users = db.execute(
            text("SELECT COUNT(*) FROM users")
        ).scalar() or 0

        return {
            "pendingRequests": pending_requests,
            "approvedRequests": approved_requests,
            "totalInstitutions": total_institutions,
            "totalUsers": total_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.post("/api/v1/platform-admin/reject/{request_id}")
def reject_institution(request_id: int, current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        request = db.execute(
            text("SELECT * FROM institution_requests WHERE request_id = :rid"),
            {"rid": request_id}
        ).fetchone()

        if not request:
            raise HTTPException(status_code=404, detail="Request not found")

        db.execute(
            text("UPDATE institution_requests SET status = 'rejected' WHERE request_id = :rid"),
            {"rid": request_id}
        )
        db.commit()
        log_audit(db, "INSTITUTION_REJECTION", "InstitutionRequest", request_id, current_user["email"])
        return {"success": True, "message": "Request rejected successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/platform-admin/institutions")
def get_all_institutions(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
                SELECT institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year, created_at 
                FROM institutions 
                ORDER BY created_at DESC
            """)
        ).fetchall()

        return [
            {
                "institution_id": row.institution_id,
                "institution_name": row.institution_name,
                "short_name": row.short_name,
                "domain_name": row.domain_name,
                "logo_url": row.logo_url,
                "theme_color": row.theme_color,
                "website": row.website,
                "address": row.address,
                "status": row.status,
                "contact_email": row.contact_email,
                "contact_phone": row.contact_phone,
                "academic_year": row.academic_year,
                "created_at": str(row.created_at)
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/api/v1/platform-admin/users")
def get_all_users(current_user: dict = Depends(require_role(["super_admin"]))):
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
                SELECT u.user_id, u.email, u.role, u.created_at, u.is_active, i.institution_name 
                FROM users u 
                LEFT JOIN institutions i ON u.institution_id = i.institution_id 
                ORDER BY u.created_at DESC
            """)
        ).fetchall()

        return [
            {
                "user_id": row.user_id,
                "email": row.email,
                "role": row.role,
                "created_at": str(row.created_at),
                "is_active": row.is_active,
                "institution_name": row.institution_name or "Platform"
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
