import joblib
import pandas as pd
import os

# Load the trained regression model (predicts exact AQI number)
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'rf_regressor.pkl')
model = joblib.load(MODEL_PATH)


def get_aqi_category(aqi_value):
    """Convert numeric AQI into official category using fixed CPCB/EPA-style bands."""
    if aqi_value <= 100:
        return 'Good'
    elif aqi_value <= 200:
        return 'Moderate'
    elif aqi_value <= 300:
        return 'Poor'
    elif aqi_value <= 400:
        return 'Very Poor'
    else:
        return 'Severe'


def predict_aqi(co, nh3, no2, nox):
    """
    Predict AQI value and category from sensor gas readings.
    Category is always derived from the predicted value, so they can never disagree.
    """
    input_df = pd.DataFrame([{
        'CO': co,
        'NH3': nh3,
        'NO2': no2,
        'NOx': nox
    }])

    aqi_value = model.predict(input_df)[0]
    aqi_value = round(float(aqi_value), 1)
    aqi_category = get_aqi_category(aqi_value)

    return {
        "aqi_value": aqi_value,
        "aqi_category": aqi_category,
        "input": {
            "CO": co,
            "NH3": nh3,
            "NO2": no2,
            "NOx": nox
        }
    }


if __name__ == "__main__":
    result = predict_aqi(co=2.5, nh3=15.0, no2=45.0, nox=60.0)
    print(result)