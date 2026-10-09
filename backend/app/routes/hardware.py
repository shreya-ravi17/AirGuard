from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import hardware_aqi, mysql_bridge, pms_source, calibration, models, pm_api
from ..database import get_db
from ..ml_bridge import predict_aqi
from ..geocode import get_city_from_coords

router = APIRouter(prefix="/api", tags=["data-sources"])

# Location used for the mask (no GPS). Same place as the PM API in pm_api.py.
DEVICE_LAT = pm_api.LAT
DEVICE_LON = pm_api.LON

# Remembers the last XAMPP row already sent to the model (avoids duplicates)
_last_row_id = None


def run_pipeline(db: Session, mq2, mq7, mq135, temperature=None, humidity=None,
                 device_id="airguard_01", pm_city=None):
    """raw MQ values -> calibration -> live PM -> trained model -> PostgreSQL."""
    gases = calibration.raw_to_pollutants(mq7=float(mq7), mq135=float(mq135))
    smoke_alert = calibration.mq2_smoke_alert(mq2)

    # Raises PMSSourceError if the live PM API is unreachable.
    # We never feed zeros to the model.
    pm = pms_source.get_latest_pm(pm_city)
    pm2_5, pm10 = pm["pm2_5"], pm["pm10"]

    result = predict_aqi(
        co=gases["co"], nh3=gases["nh3"], no2=gases["no2"], nox=gases["nox"],
        pm25=pm2_5, pm10=pm10,
    )

    reading = models.SensorReading(
        device_id=device_id,
        city=get_city_from_coords(DEVICE_LAT, DEVICE_LON),
        latitude=DEVICE_LAT,
        longitude=DEVICE_LON,
        co=gases["co"], nh3=gases["nh3"], no2=gases["no2"], nox=gases["nox"],
        pm2_5=pm2_5, pm10=pm10,
        temperature=temperature, humidity=humidity,
        aqi_value=result["aqi_value"],
        aqi_category=result["aqi_category"],
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return {
        "id": reading.id,
        "aqi_value": result["aqi_value"],
        "aqi_category": result["aqi_category"],
        "smoke_alert": smoke_alert,
        "pm_source": pm["source"],
        "calibrated_input": {**gases, "pm2_5": pm2_5, "pm10": pm10},
    }


@router.get("/sql")
def fetch_from_sql(db: Session = Depends(get_db)):
    """Latest ESP32 reading from XAMPP/MySQL.
    Every NEW row is also run through the trained model and saved to PostgreSQL."""
    global _last_row_id
    try:
        result = mysql_bridge.get_latest_reading()
    except mysql_bridge.HardwareDBError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    r = result["reading"]
    result["estimated_aqi"] = hardware_aqi.estimate_aqi(r)   # fallback only

    # NEW: gas concentrations in ppm for the dashboard tiles
    result["gases_ppm"] = calibration.raw_to_ppm(r["mq2"], r["mq7"], r["mq135"])

    result["model"] = None

    row_id = r.get("id") or r.get("created_at")
    if row_id != _last_row_id:
        try:
            result["model"] = run_pipeline(
                db, r["mq2"], r["mq7"], r["mq135"],
                r.get("temperature"), r.get("humidity"),
            )
            _last_row_id = row_id
        except pms_source.PMSSourceError as exc:
            result["model"] = {"error": f"PM data unavailable: {exc}"}
        except Exception as exc:
            print("Model pipeline failed:", exc)
            result["model"] = {"error": str(exc)}

    return result


@router.get("/pms")
def fetch_pms(city: Optional[str] = Query(None, description="City name from the dataset")):
    """FETCH PMS DATA - external PM2.5/PM10 (NOT measured by the mask)."""
    try:
        return pms_source.get_latest_pm(city)
    except pms_source.PMSSourceError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/pms/cities")
def pms_cities():
    try:
        return {"cities": pms_source.list_cities()}
    except pms_source.PMSSourceError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


# Optional: manual test with curl/PowerShell. Not needed for the ESP32 + XAMPP flow.
class HardwarePredictInput(BaseModel):
    device_id: str = "airguard_01"
    mq2: float
    mq7: float
    mq135: float
    temperature: Optional[float] = None
    humidity: Optional[float] = None


@router.post("/hardware/predict")
def predict_from_hardware(data: HardwarePredictInput, db: Session = Depends(get_db)):
    try:
        return run_pipeline(db, data.mq2, data.mq7, data.mq135,
                            data.temperature, data.humidity, data.device_id)
    except pms_source.PMSSourceError as exc:
        raise HTTPException(status_code=503, detail=f"PM data unavailable: {exc}")