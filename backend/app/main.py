from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models import Base, SensorData
from app.schema import SensorDataCreate

# Ensure tables exist on app spin up
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Dependency generator helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "IoT API running"}

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
    # Pull the latest 50 logs directly
    return db.query(SensorData).order_by(SensorData.id.desc()).limit(50).all()