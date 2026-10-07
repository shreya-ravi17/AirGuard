"""Sensor-based ESTIMATED AQI for the AirGuard wearable.

IMPORTANT: this is NOT an official AQI. The mask has MQ-2 / MQ-7 / MQ-135
(raw analog readings) and no PM sensor, so a real CPCB AQI cannot be computed.

Method (transparent and tunable):
  1. Each MQ reading is scaled onto 0-500 between a clean-air baseline and the
     ADC full-scale value:  sub_index = (raw - clean) / (adc_max - clean) * 500
  2. Like a real AQI, the final value is the WORST (highest) sub-index.
  3. The category uses the same bands as the rest of the project
     (<=100 Good, <=200 Moderate, <=300 Poor, <=400 Very Poor, else Severe).

Tune in backend/.env after measuring your sensors in clean air:
  MQ_ADC_MAX      (default 4095 = ESP32 12-bit ADC)
  MQ7_CLEAN, MQ135_CLEAN, MQ2_CLEAN   (default 0)
"""
import os

SENSORS = {
    "mq7": "MQ7_CLEAN",
    "mq135": "MQ135_CLEAN",
    "mq2": "MQ2_CLEAN",
}


def get_category(aqi: float) -> str:
    if aqi <= 100:
        return "Good"
    if aqi <= 200:
        return "Moderate"
    if aqi <= 300:
        return "Poor"
    if aqi <= 400:
        return "Very Poor"
    return "Severe"


def estimate_aqi(reading: dict):
    """Return the estimated-AQI block, or None if no MQ values are present."""
    adc_max = float(os.getenv("MQ_ADC_MAX", "4095"))
    sub_indices = {}

    for column, env_name in SENSORS.items():
        raw = reading.get(column)
        if raw is None:
            continue
        clean = float(os.getenv(env_name, "0"))
        span = adc_max - clean
        if span <= 0:
            continue
        fraction = (float(raw) - clean) / span
        sub_indices[column] = round(min(max(fraction, 0.0), 1.0) * 500, 1)

    if not sub_indices:
        return None

    driver = max(sub_indices, key=sub_indices.get)
    value = round(sub_indices[driver])

    return {
        "value": value,
        "category": get_category(value),
        "driven_by": driver,
        "sub_indices": sub_indices,
        "is_official_aqi": False,
        "disclaimer": (
            "Estimated from MQ sensor readings (no PM sensor). "
            "Not an official AQI."
        ),
    }