from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from backend.app.database import SessionLocal, engine
from backend.app.models import Base, SensorData
from backend.app.schema import SensorDataCreate

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB INIT ----------------
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# ---------------- DB DEPENDENCY ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- ROUTES ----------------
@app.post("/api/v1/sensor-data")
def create_sensor_data(payload: SensorDataCreate, db: Session = Depends(get_db)):
    obj = SensorData(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/v1/sensor-data/latest")
def latest(db: Session = Depends(get_db)):
    return db.query(SensorData).order_by(SensorData.id.desc()).first()


@app.get("/api/v1/sensor-data/history")
def history(db: Session = Depends(get_db)):
    return db.query(SensorData).order_by(SensorData.id.desc()).limit(50).all()

# ---------------- STATIC FRONTEND ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.normpath(os.path.join(BASE_DIR, "..", "static"))

if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="frontend")