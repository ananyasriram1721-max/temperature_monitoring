from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Production Note: 
# On Railway, use a Persistent Volume. Set the 'DATABASE_PATH' 
# environment variable to a path inside your mounted volume (e.g., /data/sensor.db).
# If no variable is set, it defaults to /tmp/sensor.db for safety.
DB_PATH = os.environ.get("DATABASE_PATH", "/tmp/sensor.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create the engine
# check_same_thread=False is required for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create the session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for your models
Base = declarative_base()