from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import uvicorn

from backend.app.database import SessionLocal, enginefrom app.models import Base, SensorData
from app.schema import SensorDataCreate

# ---------------- DATABASE INIT ----------------
Base.metadata.create_all(bind=engine)

# ---------------- APP INIT ----------------
app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- API ROUTES ----------------
@app.post("/api/v1/sensor-data")
def create_sensor_data(payload: SensorDataCreate, db: Session = Depends(get_db)):
    db_data = SensorData(**payload.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data


@app.get("/api/v1/sensor-data/latest")
def latest(db: Session = Depends(get_db)):
    return db.query(SensorData).order_by(SensorData.id.desc()).first()


@app.get("/api/v1/sensor-data/history")
def history(db: Session = Depends(get_db)):
    return (
        db.query(SensorData)
        .order_by(SensorData.id.desc())
        .limit(50)
        .all()
    )

# ---------------- STATIC FRONTEND (VITE BUILD) ----------------
# IMPORTANT: must exist before running container
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="frontend")

# ---------------- MAIN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)