from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from .database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, default="airguard_01")
    city = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    co = Column(Float)
    nh3 = Column(Float)
    no2 = Column(Float)
    nox = Column(Float)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)

    aqi_value = Column(Float)
    aqi_category = Column(String)

class DeviceSettings(Base):
    __tablename__ = "device_settings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, default="airguard_01")
    device_name = Column(String, default="My AirGuard Mask")
    alert_threshold = Column(Integer, default=200)   # notify if AQI crosses this
    temperature_unit = Column(String, default="C")    # "C" or "F"
    notifications_enabled = Column(Integer, default=1)  # 1 = on, 0 = off