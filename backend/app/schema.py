from pydantic import BaseModel


class SensorDataCreate(BaseModel):
    temperature: float
    humidity: float
    predicted_temperature: float
    ir_detected: bool

    class Config:
        from_attributes = True