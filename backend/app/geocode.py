import time
import threading
import requests

# Cache by coordinates rounded to 2 decimals (~1 km). A wearable that keeps
# posting from the same place makes ONE Nominatim request, not one per reading.
_CACHE: dict = {}
_LOCK = threading.Lock()
_LAST_CALL = 0.0
_MIN_INTERVAL = 1.1      # Nominatim usage policy: max 1 request / second
_FAIL_RETRY_AFTER = 300  # seconds before retrying a failed lookup


def get_city_from_coords(lat: float, lon: float) -> str:
    global _LAST_CALL
    key = (round(lat, 2), round(lon, 2))

    with _LOCK:
        hit = _CACHE.get(key)
        if hit and (hit["city"] != "Unknown" or time.time() - hit["at"] < _FAIL_RETRY_AFTER):
            return hit["city"]

        wait = _MIN_INTERVAL - (time.time() - _LAST_CALL)
        if wait > 0:
            time.sleep(wait)
        _LAST_CALL = time.time()

        city = "Unknown"
        try:
            response = requests.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lon, "format": "json"},
                headers={"User-Agent": "AirGuard-App"},
                timeout=5,
            )
            response.raise_for_status()
            address = response.json().get("address", {})
            city = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("county")
                or "Unknown"
            )
        except Exception:
            pass

        _CACHE[key] = {"city": city, "at": time.time()}
        return city