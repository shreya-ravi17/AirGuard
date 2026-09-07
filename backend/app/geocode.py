import requests

def get_city_from_coords(lat: float, lon: float) -> str:
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": lat, "lon": lon, "format": "json"}
        headers = {"User-Agent": "AirGuard-App"}  # required by Nominatim's usage policy

        response = requests.get(url, params=params, headers=headers, timeout=5)
        data = response.json()

        address = data.get("address", {})
        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("county")
            or "Unknown"
        )
        return city
    except Exception:
        return "Unknown"