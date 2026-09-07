# AirGuard 🌬️

**IoT-based Smart E-Nose for Air Pollution Detection**

AirGuard is a wearable smart mask device that detects air pollution levels in real time using gas and particulate sensors, predicts current AQI, forecasts next-day AQI, and displays everything through a live dashboard.

---

## Team & Contributions

| Member | Main Work | Approx. Share |
|--------|-----------|----------------|
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
| **PMS5003** | Detects PM2.5 and PM10 (particulate matter) — added after initial design phase |
| ESP32 / Arduino | Microcontroller, sends sensor data over WiFi |

**Design note:** PM sensors were initially excluded from the wearable mask due to
size/power constraints. A PMS5003 was later integrated after evaluating the
trade-off, since PM2.5/PM10 proved to be the dominant drivers of AQI accuracy.

---

## Repository Structure

```
AirGuard/
├── ML/                        # Machine Learning pipeline (Member 3)
│   ├── data/
│   │   ├── city_day.csv
│   │   └── cleaned_data.csv
│   ├── models/
│   │   ├── rf_regressor_with_pm.pkl   # Current AQI model (final)
│   │   └── forecast_model.pkl         # Next-day AQI forecast model
│   ├── notebooks/
│   │   └── 01_explore.ipynb
│   ├── src/
│   │   ├── predict.py                  # predict_aqi()
│   │   ├── forecast_predict.py         # forecast_next_aqi()
│   │   └── ...                         # training/experiment scripts
│   ├── README.md
│   └── README_ML.md                    # ML integration guide for backend
│
├── backend/                   # Backend, APIs, Database (Member 1)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── ml_bridge.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── geocode.py
│   │   └── routes/
│   │       ├── dashboard.py
│   │       ├── sensor.py
│   │       └── settings.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                  # React Dashboard (Member 2)
│   ├── src/
│   │   ├── airguard-dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── alerts/
│   │   │   ├── analytics/
│   │   │   ├── history/
│   │   │   ├── live-monitoring/
│   │   │   └── prediction/
│   │   ├── components/
│   │   ├── context/
│   │   ├── firebase/
│   │   ├── pages/auth/
│   │   └── services/api.js
│   ├── package.json
│   └── README_FRONTEND.md
│
├── README.md                  # This file
└── .gitignore
```

---

## AI/ML Component (Member 3)

### Current AQI Prediction
- **Model:** Random Forest Regressor
- **Features:** CO, NH3, NO2, NOx, PM2.5, PM10 (matched to MQ7 + MQ135 + PMS5003 sensors)
- **Performance:** R² = 0.931, MAE = 15.25, RMSE = 23.20
- **Feature importance:** PM2.5 (73%), PM10 (21%), gases combined (~6%)

### Next-Day AQI Forecast
- **Model:** Random Forest Regressor with 3-day AQI lag features
- **Performance:** R² = 0.8705, MAE = 23.97, RMSE = 38.65
- Uses only historical AQI values — independent of gas/PM sensor readings

### Dataset
[Air Quality Data in India (2015-2020)](https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india) — sourced from CPCB (Central Pollution Control Board), covering 26 Indian cities.

### Model Evolution Summary
| Stage | Features | R² | Notes |
|---|---|---|---|
| Initial (no PM sensor) | CO, NH3, NO2, NOx | 0.666 | Hardware constraint at the time |
| **Final (with PMS5003)** | CO, NH3, NO2, NOx, PM2.5, PM10 | **0.931** | After PM sensor integration |

Full technical details and backend integration instructions: see [`ML/README_ML.md`](./ML/README_ML.md)

---

## Backend (Member 1)

Built with FastAPI, connecting hardware sensor data to the ML models and serving
results to the frontend dashboard via REST APIs, backed by a PostgreSQL database.

Key modules:
- `ml_bridge.py` — integrates `predict_aqi()` and `forecast_next_aqi()` from the ML pipeline
- `routes/sensor.py` — receives sensor data from hardware
- `routes/dashboard.py` — serves AQI data to the frontend
- `routes/settings.py` — user/device settings

See [`backend/README.md`](./backend/README.md) for setup instructions.

---

## Frontend (Member 2)

Built with React (Vite), displaying:
- **Live Monitoring** — real-time sensor readings and current AQI
- **Prediction** — current AQI value + category from the ML model
- **Analytics** — historical trends and charts
- **History** — past readings log
- **Alerts** — notifications for poor/severe air quality

See [`frontend/README_FRONTEND.md`](./frontend/README_FRONTEND.md) for setup instructions.

---

## Setup (Full Project)

```bash
git clone https://github.com/shreya-ravi17/AirGuard.git
cd AirGuard
```

**ML:**
```bash
cd ML
python -m venv venv
venv\Scripts\activate
pip install pandas numpy scikit-learn joblib
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## System Flow

```
Hardware (ESP32 + MQ2/MQ7/MQ135/DHT22/PMS5003)
    -> sends sensor readings via WiFi
Backend API (FastAPI)
    -> calls predict_aqi() -> current AQI value + category
    -> stores in PostgreSQL
    -> calls forecast_next_aqi() -> next-day AQI (using last 3 days from DB)
React Dashboard
    -> fetches from backend APIs
    -> displays live AQI, forecasts, history, and alerts
```

---

## License
This project uses the CPCB India Air Quality dataset for educational/research purposes only.