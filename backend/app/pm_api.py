import time
import requests

CITY = "Mangaluru"
LAT, LON = 12.9141, 74.8560
CACHE_SECONDS = 600
STALE_OK_SECONDS = 3 * 3600
_cache = {"t": 0.0, "data": None}


def get_live_pm():
    now = time.time()
    if _cache["data"] and now - _cache["t"] < CACHE_SECONDS:
        return _cache["data"]
    try:
        r = requests.get(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={"latitude": LAT, "longitude": LON, "current": "pm2_5,pm10"},
            timeout=8,
        )
        r.raise_for_status()
        c = r.json()["current"]
        data = {
            "source": "open_meteo_api",
            "measured_by_device": False,
            "dataset": "Open-Meteo Air Quality API",
            "city": CITY,
            "date": c["time"],
            "pm2_5": float(c["pm2_5"]),
            "pm10": float(c["pm10"]),
            "unit": "ug/m3",
            "note": "Live modelled area-level value for Mangaluru from an external API. Not measured by the AirGuard mask.",
        }
        _cache.update(t=now, data=data)
        return data
    except Exception as e:
        print("PM API failed:", e)
        if _cache["data"] and now - _cache["t"] < STALE_OK_SECONDS:
            return _cache["data"]
        return None
