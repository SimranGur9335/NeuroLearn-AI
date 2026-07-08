# scratch/test_institutions.py
import time
from sqlalchemy import text
from backend.database import SessionLocal

db = SessionLocal()
try:
    start_time = time.time()
    result = db.execute(
        text("""
            SELECT institution_id, institution_name, short_name, domain_name, logo_url, theme_color, website, address, status, contact_email, contact_phone, academic_year 
            FROM institutions 
            WHERE status = 'active'
            ORDER BY institution_id ASC
        """)
    ).fetchall()
    duration = time.time() - start_time
    print(f"Query returned {len(result)} active institutions in {duration:.4f} seconds.")
    for idx, row in enumerate(result[:5]):
        print(f"Row {idx+1}: {row.institution_name} ({row.short_name})")
except Exception as e:
    print(f"Error querying institutions: {e}")
finally:
    db.close()
