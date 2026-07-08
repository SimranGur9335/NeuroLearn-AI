# scratch/profile_db.py
import time
from sqlalchemy import text
from backend.database import SessionLocal, engine

print("Starting DB profiling...")

# Profile engine creation (should be instant)
start = time.time()
db = SessionLocal()
print(f"SessionLocal instantiation: {(time.time() - start) * 1000:.2f} ms")

# Profile first query (opens connection)
start = time.time()
conn = db.connection()
print(f"Connection checkout (lazy connect): {(time.time() - start) * 1000:.2f} ms")

# Profile lightweight query
start = time.time()
res = db.execute(text("SELECT 1")).scalar()
print(f"SELECT 1 execution: {(time.time() - start) * 1000:.2f} ms")

# Profile institutions query
start = time.time()
res = db.execute(text("SELECT COUNT(*) FROM institutions")).scalar()
print(f"SELECT COUNT(*) FROM institutions: {(time.time() - start) * 1000:.2f} ms")

db.close()
print("Session closed.")
