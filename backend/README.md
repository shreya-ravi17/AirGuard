# AirGuard Backend — API Documentation

FastAPI backend for AirGuard: an IoT wearable-mask air quality monitor. Receives sensor readings (with phone GPS coordinates), predicts current AQI, forecasts next-day AQI, and serves everything the dashboard needs.

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL (hosted on Neon)
- **ML**: scikit-learn models (Random Forest), built by Member 3, imported directly from `../src/`
- **Geocoding**: OpenStreetMap Nominatim (reverse geocoding lat/long → city name)

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env` (copy from `.env.example`):
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000`. Interactive docs (Swagger UI) at `http://127.0.0.1:8000/docs` — every endpoint below can be tested there directly.

## Folder Structure

```
AirGuard/
├── data/                  (Member 3's dataset — not used by backend directly)
├── models/                (Member 3's trained .pkl models)
├── src/
│   ├── predict.py         (current AQI prediction)
│   └── forecast_predict.py (next-day AQI forecast)
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py       (DB tables)
│   │   ├── schemas.py      (request/response shapes)
│   │   ├── geocode.py      (lat/long → city name)
│   │   ├── ml_bridge.py    (imports Member 3's ML functions)
│   │   └── routes/
│   │       ├── sensor.py    (ingest endpoint)
│   │       ├── dashboard.py (current/trend/stats/history/forecast/alerts)
│   │       └── settings.py
│   ├── requirements.txt
│   └── .env.example
```

## How Data Flows

```
ESP32 (MQ2, MQ7, MQ135, DHT22)
    ↓ sends raw sensor values to paired phone
Phone (gets GPS coordinates)
    ↓ POSTs sensor values + coordinates
Backend: POST /api/current-aqi
    ↓ calls predict_aqi() (Member 3's model)
    ↓ resolves city from coordinates (Nominatim)
    ↓ saves to PostgreSQL
    ↓ returns AQI value + category + city
Frontend Dashboard (Member 2)
    ↓ fetches via GET endpoints below
```

## Endpoints

### Ingest (called by hardware/phone app)

**POST** `/api/current-aqi`

Request body:
```json
{
  "device_id": "airguard_01",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "co": 2.5,
  "nh3": 15.0,
  "no2": 45.0,
  "nox": 60.0,
  "temperature": 28.5,
  "humidity": 60.0
}
```

Response:
```json
{
  "id": 3,
  "device_id": "airguard_01",
  "city": "Bengaluru",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "timestamp": "2026-08-27T05:53:17.954836",
  "co": 2.5, "nh3": 15, "no2": 45, "nox": 60,
  "aqi_value": 250.4,
  "aqi_category": "Poor"
}
```

City is auto-resolved from coordinates — you don't send it, the backend figures it out via reverse geocoding. If coordinates don't resolve to a known place, `city` returns `"Unknown"`.

---

### Dashboard — current AQI

**GET** `/api/current`

Returns the latest saved reading plus a recommendation string.

```json
{
  "aqi_value": 250.4,
  "aqi_category": "Poor",
  "timestamp": "2026-08-27T05:53:17.954836",
  "temperature": 28.5,
  "humidity": 60,
  "recommendation": "Consider wearing a mask outdoors and limiting exposure."
}
```

---

### Live Monitoring — trend chart

**GET** `/api/trend?range=1D`

`range` accepts: `live`, `1D`, `3D`, `month`

```json
{
  "range": "1D",
  "points": [
    {"timestamp": "...", "aqi_value": 231.5, "category": "Poor"},
    {"timestamp": "...", "aqi_value": 250.4, "category": "Poor"}
  ]
}
```

---

### Live Monitoring — stats (Avg/Max/Min + category donut)

**GET** `/api/stats?range=1D`

```json
{
  "range": "1D",
  "avg_aqi": 244.1,
  "max_aqi": 250.4,
  "min_aqi": 231.5,
  "category_breakdown": {"Poor": 3}
}
```

---

### History — paginated table with search + date filter

**GET** `/api/history?page=1&page_size=20&search=Bengaluru&date=2026-08-27`

All query params optional. `search` matches city name (partial match). `date` filters to a single calendar day (format: `YYYY-MM-DD`).

```json
{
  "total": 3,
  "page": 1,
  "page_size": 20,
  "data": [ /* array of readings */ ]
}
```

---

### History — CSV export

**GET** `/api/history/export`

Returns a downloadable CSV file of all readings.

---

### AI Prediction — next-day forecast

**GET** `/api/forecast`

Requires at least 3 distinct calendar days of logged readings. If not enough data:
```json
{ "message": "Not enough data yet. Forecast needs at least 3 days of readings.", "days_available": 1 }
```

Once enough data exists:
```json
{
  "predicted_aqi": 245.8,
  "risk_level": "Poor",
  "confidence": 87.3,
  "based_on": {"day_minus_1": 250.4, "day_minus_2": 231.5, "day_minus_3": 210.0},
  "recommendation": "Consider wearing a mask outdoors and limiting exposure."
}
```

Note on `confidence`: approximated from agreement across the Random Forest's individual trees (lower spread in tree predictions = higher confidence), not a true statistical confidence interval. Useful as a relative indicator, not a precise probability.

---

### Alerts

**GET** `/api/alerts`

Returns alerts derived by comparing consecutive readings — fires when AQI category worsens (e.g. Moderate → Poor).

```json
{
  "alerts": [
    {"timestamp": "...", "message": "AQI worsened from Moderate to Poor", "aqi_value": 275.7}
  ]
}
```

---

### Settings

**GET** `/api/settings?device_id=airguard_01`

Auto-creates default settings on first call if none exist.

```json
{
  "device_id": "airguard_01",
  "device_name": "My AirGuard Mask",
  "alert_threshold": 200,
  "temperature_unit": "C",
  "notifications_enabled": true
}
```

**PUT** `/api/settings?device_id=airguard_01`

Body (all fields optional — only send what you want to change):
```json
{ "alert_threshold": 250, "notifications_enabled": false }
```

## Known Limitations (worth knowing for viva/demo)

- **Geocoding rate limit**: Nominatim allows ~1 request/second. Fine for a demo; would need caching or a paid geocoding API at production scale.
- **Forecast confidence**: approximated via tree-prediction spread, not a formal statistical confidence interval.
- **Alerts**: computed on-the-fly from reading history, not stored as a separate table — simple and sufficient for this project's scale.
- **CORS**: currently open (`allow_origins=["*"]`) for development. Restrict to the actual frontend URL before any public deployment.

## For Member 2 (Frontend)

Base URL during development: `http://127.0.0.1:8000`

All endpoints are read (`GET`) except `/api/current-aqi` (ingest, POST) and `/api/settings` (PUT to update). CORS is enabled so you can call these directly from the React dev server — if you hit a CORS error, tell Member 1 your dev server's exact URL (e.g. `http://localhost:5173`) so it can be added explicitly.