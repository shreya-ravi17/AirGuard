# AirGuard 🌬️

**IoT-based Smart E-Nose for Air Pollution Detection**

AirGuard is a wearable smart mask device that detects air pollution levels in real time using gas sensors, predicts current AQI, and forecasts next-day AQI — displayed through a live dashboard.

---

## Team & Contributions

| Member | Responsibility | Contribution |
|--------|----------------|---------------|
| Member 1 | Backend, APIs, Database, Integration | 33% |
| Member 2 | React Dashboard, UI, Charts, Frontend Integration | 33% |
| Member 3 | Dataset, AI Model, Forecasting, Model Evaluation | 33% |

---

## Hardware

| Component | Purpose |
|-----------|---------|
| MQ2 | Detects LPG, smoke, propane, methane, alcohol, CO |
| MQ7 | Detects Carbon Monoxide (CO) |
| MQ135 | Detects NH3, NOx, NO2, CO2, benzene, smoke |
| DHT22 | Temperature and Humidity |
| ESP32 / Arduino | Microcontroller, sends sensor data over WiFi |

---

## AI/ML Component

### Current AQI Prediction
- **Model:** Random Forest Regressor
- **Features:** CO, NH3, NO2, NOx (matched to MQ7 + MQ135 sensors)
- **Performance:** R² = 0.666, MAE = 35.05, RMSE = 52.91

### Next-Day AQI Forecast
- **Model:** Random Forest Regressor with 3-day AQI lag features
- **Performance:** R² = 0.8705, MAE = 23.97, RMSE = 38.65

Full technical details and integration instructions: see [`README_ML.md`](./README_ML.md)

### Dataset
[Air Quality Data in India (2015–2020)](https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india) — sourced from CPCB (Central Pollution Control Board), covering 26 Indian cities.

### Design Note
PM2.5/PM10 sensors were excluded due to their larger form factor and power requirements, which are impractical for a compact wearable mask device. This was a deliberate design trade-off prioritizing portability over prediction granularity.

---

## Setup

```bash
git clone <repo-url>
cd AirGuard
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux
pip install pandas numpy scikit-learn matplotlib seaborn jupyter joblib imbalanced-learn xgboost
```

---

## Usage

```python
from src.predict import predict_aqi
from src.forecast_predict import forecast_next_aqi

# Current AQI from live sensor readings
current = predict_aqi(co=2.5, nh3=15.0, no2=45.0, nox=60.0)

# Next-day forecast from past 3 days of AQI
forecast = forecast_next_aqi(aqi_day1=180, aqi_day2=165, aqi_day3=190)
```

---

## License
This project uses the CPCB India Air Quality dataset for educational/research purposes only.
