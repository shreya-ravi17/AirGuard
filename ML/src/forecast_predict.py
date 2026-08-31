import joblib
import pandas as pd
import os

# Load the trained forecast model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'forecast_model.pkl')
model = joblib.load(MODEL_PATH)


def forecast_next_aqi(aqi_day1, aqi_day2, aqi_day3):
    """
    Predict tomorrow's AQI using the last 3 days of AQI history.

    Parameters:
        aqi_day1 (float): AQI from 1 day ago (most recent)
        aqi_day2 (float): AQI from 2 days ago
        aqi_day3 (float): AQI from 3 days ago (oldest)

    Returns:
        dict with forecast_aqi and input_history
    """
    input_df = pd.DataFrame([{
        'AQI_lag1': aqi_day1,
        'AQI_lag2': aqi_day2,
        'AQI_lag3': aqi_day3
    }])

    forecast_value = model.predict(input_df)[0]
    forecast_value = round(float(forecast_value), 1)

    return {
        "forecast_aqi": forecast_value,
        "input_history": {
            "day_minus_1": aqi_day1,
            "day_minus_2": aqi_day2,
            "day_minus_3": aqi_day3
        }
    }


# Quick manual test
if __name__ == "__main__":
    result = forecast_next_aqi(aqi_day1=180, aqi_day2=165, aqi_day3=190)
    print(result)