# scratch/count_rows.py
from sqlalchemy import text
from backend.database import SessionLocal

db = SessionLocal()
try:
    tables = db.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)).fetchall()
    
    print("Table row counts:")
    for t in tables:
        table_name = t[0]
        try:
            count = db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()
            print(f" - {table_name}: {count}")
        except Exception as err:
            print(f" - {table_name}: Error ({err})")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
