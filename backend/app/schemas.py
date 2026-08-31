from pydantic import BaseModel
from datetime import datetime

class SensorInput(BaseModel):
    device_id: str = "airguard_01"
    latitude: float
    longitude: float
    co: float
    nh3: float
    no2: float
    nox: float
    temperature: float | None = None
    humidity: float | None = None


class SensorReadingOut(BaseModel):
    id: int
    device_id: str
    city: str
    latitude: float
    longitude: float
    timestamp: datetime
    co: float
    nh3: float
    no2: float
    nox: float
    aqi_value: float
    aqi_category: str

    class Config:
        from_attributes = True

class SettingsInput(BaseModel):
    device_name: str | None = None
    alert_threshold: int | None = None
    temperature_unit: str | None = None
    notifications_enabled: bool | None = None

class SettingsOut(BaseModel):
    device_id: str
    device_name: str
    alert_threshold: int
    temperature_unit: str
    notifications_enabled: bool

    class Config:
        from_attributes = True