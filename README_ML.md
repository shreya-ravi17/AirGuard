# AirGuard — ML Model Integration Guide (for Backend)

This document explains how to use the two ML functions built for AirGuard.
Both are ready to import directly into the backend — no additional setup beyond installing dependencies.

---

## Files you need

```
models/
├── rf_regressor.pkl        # Current AQI prediction model
└── forecast_model.pkl      # Next-day AQI forecast model

src/
├── predict.py               # Function: predict_aqi()
└── forecast_predict.py      # Function: forecast_next_aqi()
```

Place the `models/` folder and both `.py` files anywhere in your backend project,
keeping their relative path to each other the same (the scripts look for the
`.pkl` files one folder up, inside `models/`).

## Requirements

```bash
pip install pandas scikit-learn joblib
```

---

## 1. Current AQI Prediction — `predict_aqi()`

Use this when live sensor data arrives from the hardware (ESP32 + MQ2/MQ7/MQ135/DHT22).

### Import
```python
from predict import predict_aqi
```

### Call
```python
result = predict_aqi(co=2.5, nh3=15.0, no2=45.0, nox=60.0)
```

### Input parameters
| Parameter | Type  | Source sensor | Notes |
|-----------|-------|----------------|-------|
| `co`      | float | MQ7            | CO reading, calibrated to ppm |
| `nh3`     | float | MQ135          | NH3 reading, calibrated to ppm |
| `no2`     | float | MQ135          | NO2 reading, calibrated to ppm |
| `nox`     | float | MQ135          | NOx reading, calibrated to ppm |

**Important:** raw ADC values from the sensors must be converted to ppm
using the MQ calibration formulas (Rs/Ro curve) before calling this function.
Do not pass raw analog values directly.

### Output
```python
{
    "aqi_value": 247.3,
    "aqi_category": "Poor",
    "input": {
        "CO": 2.5,
        "NH3": 15.0,
        "NO2": 45.0,
        "NOx": 60.0
    }
}
```

`aqi_category` is always mathematically derived from `aqi_value`
(standard CPCB bands: Good 0-100, Moderate 101-200, Poor 201-300,
Very Poor 301-400, Severe 401+) — so the two will never contradict each other.

### Suggested endpoint
```python
@app.route('/api/current-aqi', methods=['POST'])
def get_current_aqi():
    data = request.json
    result = predict_aqi(
        co=data['co'], nh3=data['nh3'],
        no2=data['no2'], nox=data['nox']
    )
    return jsonify(result)
```

---

## 2. Next-Day AQI Forecast — `forecast_next_aqi()`

Use this to predict tomorrow's AQI, based on the last 3 days of AQI values
already stored in your database (NOT live sensor readings).

### Import
```python
from forecast_predict import forecast_next_aqi
```

### Call
```python
result = forecast_next_aqi(aqi_day1=180, aqi_day2=165, aqi_day3=190)
```

### Input parameters
| Parameter   | Type  | Meaning |
|-------------|-------|---------|
| `aqi_day1`  | float | AQI value from 1 day ago (most recent) |
| `aqi_day2`  | float | AQI value from 2 days ago |
| `aqi_day3`  | float | AQI value from 3 days ago (oldest) |

**Important:** this requires at least 3 days of AQI history already logged
in the database. It cannot forecast on day 1 of device use — the backend
should handle that case gracefully (e.g., show "Not enough data yet").

### Output
```python
{
    "forecast_aqi": 178.4,
    "input_history": {
        "day_minus_1": 180,
        "day_minus_2": 165,
        "day_minus_3": 190
    }
}
```

### Suggested endpoint
```python
@app.route('/api/forecast-aqi', methods=['GET'])
def get_forecast():
    last_3_days = get_last_3_days_aqi_from_db()  # your own DB query
    if len(last_3_days) < 3:
        return jsonify({"error": "Not enough AQI history yet"}), 400
    result = forecast_next_aqi(
        aqi_day1=last_3_days[0],
        aqi_day2=last_3_days[1],
        aqi_day3=last_3_days[2]
    )
    return jsonify(result)
```

---

## Model performance (for reference / report)

| Model              | Metric        | Value |
|---------------------|--------------|-------|
| Current AQI (regressor) | MAE          | 35.05 |
|                      | RMSE         | 52.91 |
|                      | R² Score     | 0.666 |
| Forecast (next-day)  | MAE          | 23.97 |
|                      | RMSE         | 38.65 |
|                      | R² Score     | 0.870 |

**Note:** the current-AQI model is limited to ~0.67 R² because the device
uses only 4 gas sensors (CO, NH3, NO2, NOx) and does not include a PM2.5/PM10
sensor, which was excluded due to size/power constraints for a wearable mask
form factor. This is a known, deliberate hardware trade-off.


