# inspect_db.py
import sys
import os
from sqlalchemy import text
from backend.database import SessionLocal

db = SessionLocal()
try:
    # Get table list
    tables = db.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)).fetchall()
    print("Tables in database:")
    for t in tables:
        print(f" - {t[0]}")
        
    # Inspect notifications table
    cols = db.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'notifications'
    """)).fetchall()
    print("\nColumns in 'notifications':")
    for c in cols:
        print(f" - {c[0]}: {c[1]}")
        
    # Inspect assignments table
    cols_a = db.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'assignments'
    """)).fetchall()
    print("\nColumns in 'assignments':")
    for c in cols_a:
        print(f" - {c[0]}: {c[1]}")

    # Inspect assignment_submissions table
    cols_s = db.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'assignment_submissions'
    """)).fetchall()
    print("\nColumns in 'assignment_submissions':")
    for c in cols_s:
        print(f" - {c[0]}: {c[1]}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
