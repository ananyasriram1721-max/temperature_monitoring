from pydantic import BaseModel

class SensorDataCreate(BaseModel):

    temperature: float

    humidity: float

    predicted_temperature: float

    ir_detected: bool


class SensorDataResponse(SensorDataCreate):

    id: int

    class Config:
        from_attributes = True