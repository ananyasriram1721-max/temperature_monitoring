from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uvicorn

from app.database import SessionLocal, engine
from app.models import Base, SensorData
from app.schema import SensorDataCreate

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Consolidated Static File Serving ---
# Mount your assets. Assuming the path relative to the root is 'backend/static/assets'
app.mount("/assets", StaticFiles(directory="backend/static/assets"), name="assets")

@app.get("/{rest_of_path:path}")
async def serve_spa(rest_of_path: str):
    # 1. Handle API routes first so they aren't caught by the SPA fallback
    if rest_of_path.startswith("api/"):
        # This is handled by your API functions, but if you hit this 
        # point, let the app return a 404 or handle accordingly
        return {"error": "Not found"}

    # 2. Serve the SPA index.html for any other route
    return FileResponse("backend/static/index.html")

# --- API Endpoints ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
    return db.query(SensorData).order_by(SensorData.id.desc()).limit(50).all()

if __name__ == "__main__":
    # Render assigns the port to the environment variable $PORT
    try:
        import uvicorn
        port = int(os.environ.get("PORT", 8000))
        print(f"--- Starting Uvicorn on port {port} ---")
        uvicorn.run("main:app", host="0.0.0.0", port=port)
    except Exception as e:
        print(f"--- CRASHED DURING STARTUP ---")
        print(e)
        raise e