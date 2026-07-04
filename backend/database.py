# database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fix legacy/standard Heroku/Render Postgres URI scheme if needed
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL or not (DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")):
    raise RuntimeError(
        "DATABASE_URL environment variable is missing, empty, or not a valid PostgreSQL connection URI. "
        "SQLite support is deprecated. Please configure a valid PostgreSQL link (e.g. from Supabase)."
    )

DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "300"))

engine = create_engine(
    DATABASE_URL,
    pool_size=DB_POOL_SIZE,
    max_overflow=DB_MAX_OVERFLOW,
    pool_recycle=DB_POOL_RECYCLE,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    """
    FastAPI dependency injection helper to yield database sessions.
    Automatically closes sessions when the request context finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()