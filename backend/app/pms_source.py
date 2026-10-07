"""External PM2.5 / PM10 source for "FETCH PMS DATA".

The AirGuard mask has NO PMS5003 sensor. PM values come from the project's
own dataset file ML/data/city_day.csv (historical daily city data). Values
are returned exactly as in the file and always flagged as external.
"""
import os
from functools import lru_cache
from typing import Optional

import pandas as pd

CSV_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "ML", "data", "city_day.csv"
)
DEFAULT_CITY = os.getenv("PMS_DEFAULT_CITY", "Bengaluru")


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


def get_latest_pm(city: Optional[str] = None) -> dict:
    df = _load()
    wanted = city or DEFAULT_CITY
    match = df[df["City"].str.lower() == wanted.lower()]
    if match.empty:
        raise PMSSourceError(
            f"No PM data for city '{wanted}'. Available: {', '.join(list_cities())}"
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
        "note": (
            "External historical daily value from the project dataset. "
            "Not live, and NOT measured by the AirGuard mask."
        ),
    }