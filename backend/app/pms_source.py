"""External PM2.5 / PM10 source for "FETCH PMS DATA".

The AirGuard mask has NO PMS5003 sensor. PM values come from the live
Open-Meteo Air Quality API for Mangaluru (pm_api.py).

The old dataset ML/data/city_day.csv is only used if a city is requested
explicitly (e.g. /api/pms?city=Chennai). It has no Mangaluru, so it is NOT
used as a silent backup - that would mix another city's air with your sensor.
"""
import os
from functools import lru_cache
from typing import Optional

import pandas as pd

from . import pm_api

CSV_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "ML", "data", "city_day.csv"
)


class PMSSourceError(Exception):
    pass


@lru_cache(maxsize=1)
def _load() -> pd.DataFrame:
    if not os.path.exists(CSV_PATH):
        raise PMSSourceError(f"PM dataset not found at {os.path.abspath(CSV_PATH)}")
    df = pd.read_csv(CSV_PATH, usecols=["City", "Date", "PM2.5", "PM10"])
    df = df.dropna(subset=["PM2.5", "PM10"])
    df["Date"] = pd.to_datetime(df["Date"])
    return df.sort_values("Date")


def list_cities() -> list:
    return sorted(_load()["City"].unique().tolist())


def _get_csv_pm(city: str) -> dict:
    df = _load()
    match = df[df["City"].str.lower() == city.lower()]
    if match.empty:
        raise PMSSourceError(
            f"No PM data for city '{city}'. Available: {', '.join(list_cities())}"
        )
    row = match.iloc[-1]
    return {
        "source": "external_dataset",
        "measured_by_device": False,
        "dataset": "ML/data/city_day.csv",
        "city": row["City"],
        "date": row["Date"].strftime("%Y-%m-%d"),
        "pm2_5": float(row["PM2.5"]),
        "pm10": float(row["PM10"]),
        "unit": "ug/m3",
        "note": "Historical daily value from the project dataset. Not live, "
                "and NOT measured by the AirGuard mask.",
    }


def get_latest_pm(city: Optional[str] = None) -> dict:
    """Live Mangaluru PM from Open-Meteo. A city name forces the CSV dataset."""
    if city:
        return _get_csv_pm(city)
    live = pm_api.get_live_pm()
    if live:
        return live
    raise PMSSourceError("Live PM API (Open-Meteo) is unreachable. Check internet connection.")