from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from app.database import SessionLocal, engine
from app.models import Base, SensorData
from app.schema import SensorDataCreate

# Ensure tables exist on app spin up
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS is still useful if you develop locally with separate ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NEW: Static File Serving ---
# Mount the static assets folder (JS/CSS)
# Make sure your built react files are in a 'static' folder in your root
app.mount("/assets", StaticFiles(directory="backend/static/assets"), name="assets")

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")
# --------------------------------

# DB Dependency generator helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints
@app.post("/api/v1/sensor-data")
def create_sensor_data(payload: SensorDataCreate, db: Session = Depends(get_db)):
    db_data = SensorData(
        temperature=payload.temperature,
        humidity=payload.humidity,
        predicted_temperature=payload.predicted_temperature,
        ir_detected=payload.ir_detected
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

@app.get("/api/v1/sensor-data/latest")
def latest(db: Session = Depends(get_db)):
    data = db.query(SensorData).order_by(SensorData.id.desc()).first()
    return data

@app.get("/api/v1/sensor-data/history")
def history(db: Session = Depends(get_db)):
    return db.query(SensorData).order_by(SensorData.id.desc()).limit(50).all()

# Fallback for React Router (if you use it)
@app.get("/{rest_of_path:path}")
async def serve_spa(rest_of_path: str):
    return FileResponse("static/index.html")