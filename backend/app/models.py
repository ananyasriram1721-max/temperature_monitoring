from sqlalchemy import Column, Integer, Float, Boolean
from backend.app.database import Base


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    predicted_temperature = Column(Float, nullable=False)
    ir_detected = Column(Boolean, default=False)