from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta, date as date_type
from typing import Optional
import csv
import io
import numpy as np
import pandas as pd

from .. import models
from ..database import get_db
from ..ml_bridge import forecast_next_aqi, forecast_model

router = APIRouter(prefix="/api", tags=["dashboard"])

RANGE_MAP = {
    "live": timedelta(hours=1),
    "1D": timedelta(days=1),
    "3D": timedelta(days=3),
    "month": timedelta(days=30),
}


def get_recommendation(category: str) -> str:
    tips = {
        "Good": "Air quality is good. Enjoy outdoor activities.",
        "Moderate": "Air quality is acceptable. Sensitive groups should reduce prolonged outdoor exertion.",
        "Poor": "Consider wearing a mask outdoors and limiting exposure.",
        "Very Poor": "Avoid outdoor activity. Wear a mask if you must go out.",
        "Severe": "Stay indoors. Air quality is hazardous.",
    }
    return tips.get(category, "No recommendation available.")


def get_risk_level(aqi: float) -> str:
    if aqi <= 100:
        return "Good"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"


def get_forecast_confidence(day1, day2, day3):
    input_df = pd.DataFrame([{'AQI_lag1': day1, 'AQI_lag2': day2, 'AQI_lag3': day3}])
    tree_predictions = [tree.predict(input_df)[0] for tree in forecast_model.estimators_]
    std_dev = np.std(tree_predictions)
    confidence = max(50, min(99, 100 - std_dev))
    return round(confidence, 1)


@router.get("/current")
def get_current_aqi(db: Session = Depends(get_db)):
    latest = db.query(models.SensorReading).order_by(desc(models.SensorReading.timestamp)).first()
    if not latest:
        return {"message": "No readings yet"}
    return {
        "aqi_value": latest.aqi_value,
        "aqi_category": latest.aqi_category,
        "timestamp": latest.timestamp,
        "co": latest.co,
        "nh3": latest.nh3,
        "no2": latest.no2,
        "nox": latest.nox,
        "pm2_5": latest.pm2_5,
        "pm10": latest.pm10,
        "temperature": latest.temperature,
        "humidity": latest.humidity,
        "recommendation": get_recommendation(latest.aqi_category),
    }


@router.get("/history")
def get_history(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    date: Optional[date_type] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.SensorReading)

    if search:
        query = query.filter(models.SensorReading.city.ilike(f"%{search}%"))

    if date:
        query = query.filter(func.date(models.SensorReading.timestamp) == date)

    offset = (page - 1) * page_size
    total = query.count()
    readings = (
        query.order_by(desc(models.SensorReading.timestamp))
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "data": readings
    }


@router.get("/history/export")
def export_history_csv(db: Session = Depends(get_db)):
    readings = db.query(models.SensorReading).order_by(desc(models.SensorReading.timestamp)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Timestamp", "Device ID", "City", "CO", "NH3", "NO2", "NOx",
        "PM2.5", "PM10", "Temperature", "Humidity", "AQI Value", "AQI Category"
    ])

    for r in readings:
        writer.writerow([
            r.timestamp, r.device_id, r.city, r.co, r.nh3, r.no2, r.nox,
            r.pm2_5, r.pm10, r.temperature, r.humidity, r.aqi_value, r.aqi_category
        ])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=airguard_history.csv"}
    )


@router.get("/trend")
def get_trend(range: str = "1D", db: Session = Depends(get_db)):
    delta = RANGE_MAP.get(range, timedelta(days=1))
    since = datetime.utcnow() - delta

    readings = (
        db.query(models.SensorReading)
        .filter(models.SensorReading.timestamp >= since)
        .order_by(models.SensorReading.timestamp)
        .all()
    )

    return {
        "range": range,
        "points": [
            {"timestamp": r.timestamp, "aqi_value": r.aqi_value, "category": r.aqi_category}
            for r in readings
        ]
    }


@router.get("/stats")
def get_stats(range: str = "1D", db: Session = Depends(get_db)):
    delta = RANGE_MAP.get(range, timedelta(days=1))
    since = datetime.utcnow() - delta

    query = db.query(models.SensorReading).filter(models.SensorReading.timestamp >= since)

    avg_aqi = query.with_entities(func.avg(models.SensorReading.aqi_value)).scalar()
    max_aqi = query.with_entities(func.max(models.SensorReading.aqi_value)).scalar()
    min_aqi = query.with_entities(func.min(models.SensorReading.aqi_value)).scalar()

    category_counts = (
        query.with_entities(models.SensorReading.aqi_category, func.count())
        .group_by(models.SensorReading.aqi_category)
        .all()
    )

    return {
        "range": range,
        "avg_aqi": round(avg_aqi, 1) if avg_aqi else None,
        "max_aqi": max_aqi,
        "min_aqi": min_aqi,
        "category_breakdown": {cat: count for cat, count in category_counts},
    }


@router.get("/forecast")
def get_forecast(db: Session = Depends(get_db)):
    daily_avg = (
        db.query(
            func.date(models.SensorReading.timestamp).label("day"),
            func.avg(models.SensorReading.aqi_value).label("avg_aqi")
        )
        .group_by(func.date(models.SensorReading.timestamp))
        .order_by(desc("day"))
        .limit(3)
        .all()
    )

    if len(daily_avg) < 3:
        return {
            "message": "Not enough data yet. Forecast needs at least 3 days of readings.",
            "days_available": len(daily_avg)
        }

    day1 = round(daily_avg[0].avg_aqi, 1)
    day2 = round(daily_avg[1].avg_aqi, 1)
    day3 = round(daily_avg[2].avg_aqi, 1)

    result = forecast_next_aqi(aqi_day1=day1, aqi_day2=day2, aqi_day3=day3)
    confidence = get_forecast_confidence(day1, day2, day3)

    return {
        "predicted_aqi": result["forecast_aqi"],
        "risk_level": get_risk_level(result["forecast_aqi"]),
        "confidence": confidence,
        "based_on": result["input_history"],
        "recommendation": get_recommendation(get_risk_level(result["forecast_aqi"])),
    }


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    readings = (
        db.query(models.SensorReading)
        .order_by(models.SensorReading.timestamp)
        .all()
    )

    alerts = []
    severity_order = ["Good", "Moderate", "Poor", "Very Poor", "Severe"]

    for i in range(1, len(readings)):
        prev = readings[i - 1]
        curr = readings[i]

        if curr.aqi_category in severity_order and prev.aqi_category in severity_order:
            if severity_order.index(curr.aqi_category) > severity_order.index(prev.aqi_category):
                alerts.append({
                    "timestamp": curr.timestamp,
                    "message": f"AQI worsened from {prev.aqi_category} to {curr.aqi_category}",
                    "aqi_value": curr.aqi_value,
                })

    alerts.reverse()
    return {"alerts": alerts}