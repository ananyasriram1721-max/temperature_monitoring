from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

data_store = []

class SensorData(BaseModel):
    temperature: float
    humidity: float
    predicted_temperature: float
    ir_detected: bool

@app.post("/api/v1/sensor-data")
def save_data(data: SensorData):
    data_store.append(data.dict())
    return {"status":"success"}

@app.get("/api/v1/sensor-data")
def get_data():
    return data_store[-50:]