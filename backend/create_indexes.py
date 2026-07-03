# backend/create_indexes.py
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from backend.database import engine

def create_database_indexes():
    indexes = [

    ]
    
    with engine.connect() as conn:
        transaction = conn.begin()
        try:
            for idx_sql in indexes:
                print(f"Executing: {idx_sql}")
                conn.execute(text(idx_sql))
            transaction.commit()
        except Exception as e:
            transaction.rollback()
            raise e

if __name__ == "__main__":
    create_database_indexes()
