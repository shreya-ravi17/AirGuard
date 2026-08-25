import joblib
import pandas as pd
import os

# Load the trained model once when this module is imported
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'rf_model.pkl')
model = joblib.load(MODEL_PATH)

def predict_aqi(co, nh3, no2, nox):
    """
    Predict AQI category from sensor gas readings.

    Parameters:
        co   (float): CO reading (mapped from MQ7, in ppm/mg-m3 matching training units)
        nh3  (float): NH3 reading (mapped from MQ135)
        no2  (float): NO2 reading (mapped from MQ135)
        nox  (float): NOx reading (mapped from MQ135)

    Returns:
        dict: {
            "category": str,   # e.g. "Good", "Moderate", "Poor", "Severe"
            "input": dict       # echoes back the input values used
        }
    """
    # Build input in the exact same column order used during training
    input_df = pd.DataFrame([{
        'CO': co,
        'NH3': nh3,
        'NO2': no2,
        'NOx': nox
    }])

    prediction = model.predict(input_df)[0]

    return {
        "category": prediction,
        "input": {
            "CO": co,
            "NH3": nh3,
            "NO2": no2,
            "NOx": nox
        }
    }


# Quick manual test — run this file directly to check it works
if __name__ == "__main__":
    result = predict_aqi(co=2.5, nh3=15.0, no2=45.0, nox=60.0)
    print(result)