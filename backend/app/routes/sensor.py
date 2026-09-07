from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..ml_bridge import predict_aqi

router = APIRouter(prefix="/api", tags=["sensor"])

from ..geocode import get_city_from_coords

@router.post("/current-aqi", response_model=schemas.SensorReadingOut)
def submit_sensor_reading(data: schemas.SensorInput, db: Session = Depends(get_db)):
    result = predict_aqi(co=data.co, nh3=data.nh3, no2=data.no2, nox=data.nox)
    city = get_city_from_coords(data.latitude, data.longitude)

    reading = models.SensorReading(
        device_id=data.device_id,
        city=city,
        latitude=data.latitude,
        longitude=data.longitude,
        co=data.co,
        nh3=data.nh3,
        no2=data.no2,
        nox=data.nox,
        temperature=data.temperature,
        humidity=data.humidity,
        aqi_value=result["aqi_value"],
        aqi_category=result["aqi_category"],
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading