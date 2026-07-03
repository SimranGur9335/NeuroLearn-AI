from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from backend.database import SessionLocal
from backend.core.security import get_current_user
from backend.core.helpers import handle_exception_securely, log_audit
from backend.schemas.institution import InstitutionApplication, InstitutionConfigurationInput

router = APIRouter(
    tags=["Institution"]
)

@router.get("/api/v1/institutions")
def get_institutions_list():
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year 
                FROM institutions 
                WHERE status = 'active'
                ORDER BY institution_id ASC
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
                "contact_email": row.contact_email or "",
                "contact_phone": row.contact_phone or "",
                "academic_year": row.academic_year
            } for row in result
        ]
    finally:
        db.close()


@router.get("/api/v1/institution/configuration")
def get_institution_configuration(current_user: dict = Depends(get_current_user)):
    iid = current_user.get("institution_id")
    if not iid:
        raise HTTPException(status_code=400, detail="User is not associated with any institution")
    
    db = SessionLocal()
    try:
        inst = db.execute(
            text("SELECT institution_name, logo_url, academic_year, theme_color, contact_email, contact_phone FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution configuration not found")
            
        return {
            "institution_name": inst.institution_name,
            "logo_url": inst.logo_url,
            "academic_year": inst.academic_year,
            "theme": inst.theme_color,
            "contact_email": inst.contact_email or "",
            "contact_phone": inst.contact_phone or ""
        }
    finally:
        db.close()


@router.post("/api/v1/institution/configuration")
def update_institution_configuration(data: InstitutionConfigurationInput, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied: Only College Admin may modify branding")
        
    iid = current_user.get("institution_id")
    if not iid:
        raise HTTPException(status_code=400, detail="User is not associated with any institution")
        
    db = SessionLocal()
    try:
        inst = db.execute(
            text("SELECT institution_id FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        if not inst:
            raise HTTPException(status_code=404, detail="Institution not found")
            
        db.execute(
            text("""
                UPDATE institutions
                SET institution_name = :name,
                    logo_url = :logo,
                    academic_year = :year,
                    theme_color = :theme,
                    contact_email = :email,
                    contact_phone = :phone
                WHERE institution_id = :iid
            """),
            {
                "name": data.institution_name,
                "logo": data.logo_url,
                "year": data.academic_year,
                "theme": data.theme,
                "email": data.contact_email,
                "phone": data.contact_phone,
                "iid": iid
            }
        )
        db.commit()
        log_audit(db, "UPDATE_BRANDING", "Institution", iid, performed_by=f"Admin {current_user['user_id']}", institution_id=iid)
        return {"message": "Institution branding updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.get("/api/v1/branding")
def get_branding(institution_id: Optional[int] = None):
    db = SessionLocal()
    try:
        iid = institution_id if institution_id is not None else 1
        inst = db.execute(
            text("SELECT institution_name, logo_url, theme_color FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution branding not found")
            
        return {
            "institution_name": inst.institution_name,
            "institution_logo": inst.logo_url,
            "branding_color": inst.theme_color,
            "theme_preference": "dark"
        }
    finally:
        db.close()


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

@router.get("/api/v1/branding")
def get_branding(institution_id: Optional[int] = None):
    db = SessionLocal()
    try:
        iid = institution_id if institution_id is not None else 1
        inst = db.execute(
            text("SELECT institution_name, logo_url, theme_color FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution branding not found")
            
        return {
            "institution_name": inst.institution_name,
            "institution_logo": inst.logo_url,
            "branding_color": inst.theme_color,
            "theme_preference": "dark"
        }
    finally:
        db.close()

@router.get("/api/v1/institution/configuration")
def get_institution_configuration(current_user: dict = Depends(get_current_user)):
    iid = current_user.get("institution_id")
    if not iid:
        raise HTTPException(status_code=400, detail="User is not associated with any institution")
    
    db = SessionLocal()
    try:
        inst = db.execute(
            text("SELECT institution_name, logo_url, academic_year, theme_color, contact_email, contact_phone FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        
        if not inst:
            raise HTTPException(status_code=404, detail="Institution configuration not found")
            
        return {
            "institution_name": inst.institution_name,
            "logo_url": inst.logo_url,
            "academic_year": inst.academic_year,
            "theme": inst.theme_color,
            "contact_email": inst.contact_email or "",
            "contact_phone": inst.contact_phone or ""
        }
    finally:
        db.close()

@router.post("/api/v1/institution/configuration")
def update_institution_configuration(data: InstitutionConfigurationInput, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied: Only College Admin may modify branding")
        
    iid = current_user.get("institution_id")
    if not iid:
        raise HTTPException(status_code=400, detail="User is not associated with any institution")
        
    db = SessionLocal()
    try:
        inst = db.execute(
            text("SELECT institution_id FROM institutions WHERE institution_id = :iid"),
            {"iid": iid}
        ).fetchone()
        if not inst:
            raise HTTPException(status_code=404, detail="Institution not found")
            
        db.execute(
            text("""
                UPDATE institutions
                SET institution_name = :name,
                    logo_url = :logo,
                    academic_year = :year,
                    theme_color = :theme,
                    contact_email = :email,
                    contact_phone = :phone
                WHERE institution_id = :iid
            """),
            {
                "name": data.institution_name,
                "logo": data.logo_url,
                "year": data.academic_year,
                "theme": data.theme,
                "email": data.contact_email,
                "phone": data.contact_phone,
                "iid": iid
            }
        )
        db.commit()
        log_audit(db, "UPDATE_BRANDING", "Institution", iid, performed_by=f"Admin {current_user['user_id']}", institution_id=iid)
        return {"message": "Institution branding updated successfully"}
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()