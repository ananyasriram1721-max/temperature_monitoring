from sqlalchemy import Column, Integer, Float, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base

class SensorData(Base):

    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True)

    temperature = Column(Float)

    humidity = Column(Float)

    predicted_temperature = Column(Float)

    ir_detected = Column(Boolean)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )