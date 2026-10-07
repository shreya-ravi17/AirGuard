from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from .. import hardware_aqi, mysql_bridge, pms_source

router = APIRouter(prefix="/api", tags=["data-sources"])


@router.get("/sql")
def fetch_from_sql():
    """FETCH FROM SQL - latest real ESP32 reading from XAMPP/MySQL."""
    try:
        result = mysql_bridge.get_latest_reading()
    except mysql_bridge.HardwareDBError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    result["estimated_aqi"] = hardware_aqi.estimate_aqi(result["reading"])
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