from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Prefer persistent volume if available
DB_PATH = os.environ.get("DATABASE_PATH")

if not DB_PATH:
    DB_PATH = "/tmp/sensor.db"

# ensure directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    },
    pool_size=1,
    max_overflow=0,
    pool_timeout=30,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()