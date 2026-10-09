"""
Calibration from raw MQ-sensor ADC values.

TWO separate things live here:

1. raw_to_pollutants()  - feeds the trained AQI model (unchanged behaviour).
2. raw_to_ppm()         - NEW: gas concentrations in ppm for the dashboard,
                          using the standard MQ datasheet method:
                              Vout = ADC / 4095 * VREF * DIVIDER
                              Rs   = RL * (VC - Vout) / Vout
                              ppm  = a * (Rs / R0) ^ b

IMPORTANT - be upfront about this in your report/viva:
 * R0 (the sensor resistance in clean air) must be measured for YOUR sensors.
   Set MQ7_CLEAN, MQ135_CLEAN, MQ2_CLEAN in backend/.env to the raw ADC value
   each sensor shows in clean outdoor air after a long warm-up. Until you do,
   the ppm numbers are only rough.
 * MQ sensors are cross-sensitive. MQ-7 -> CO, MQ-135 -> NH3 (also reacts to
   CO2, NOx, benzene...), MQ-2 -> LPG/smoke. There is NO dedicated NO2 / NOx
   sensor, so NO2 and NOx cannot be given as measured ppm values.
"""
import os

ADC_MAX = float(os.getenv("MQ_ADC_MAX", "4095"))

# ----------------------------------------------------------------------------
# 1) Model inputs (unchanged)
# ----------------------------------------------------------------------------
CLEAN_MQ7 = float(os.getenv("MQ7_CLEAN", "200"))
CLEAN_MQ135 = float(os.getenv("MQ135_CLEAN", "200"))
CO_MAX_PPM = float(os.getenv("CO_MAX_PPM", "10"))
NH3_MAX_PPM = float(os.getenv("NH3_MAX_PPM", "60"))


def _scale(raw, clean, max_value):
    span = ADC_MAX - clean
    if span <= 0:
        return 0.0
    fraction = max(0.0, min(1.0, (float(raw) - clean) / span))
    return round(fraction * max_value, 2)


def raw_to_pollutants(mq7, mq135):
    """Approximate CO / NH3 / NO2 / NOx for predict_aqi()."""
    co = _scale(mq7, CLEAN_MQ7, CO_MAX_PPM)
    mq135_scaled = _scale(mq135, CLEAN_MQ135, NH3_MAX_PPM)
    return {
        "co": co,
        "nh3": mq135_scaled,
        "no2": round(mq135_scaled * 0.4, 2),
        "nox": round(mq135_scaled * 0.6, 2),
    }


def mq2_smoke_alert(mq2_raw, threshold=None):
    threshold = threshold or float(os.getenv("MQ2_SMOKE_THRESHOLD", "2500"))
    return float(mq2_raw) >= threshold


# ----------------------------------------------------------------------------
# 2) NEW: ppm from the MQ datasheet curves
# ----------------------------------------------------------------------------
VC = float(os.getenv("MQ_VC", "5.0"))             # sensor module supply voltage
VREF = float(os.getenv("ADC_VREF", "3.3"))        # ESP32 ADC full-scale voltage
# 1.0 = AO wired straight to the ESP32. With a 10k + 20k divider use 1.5.
DIVIDER = float(os.getenv("MQ_DIVIDER", "1.0"))

CLEAN_MQ2 = float(os.getenv("MQ2_CLEAN", "200"))

# name: (RL in kOhm, Rs/R0 in clean air, a, b)  -> ppm = a * (Rs/R0) ** b
# Constants are the commonly used datasheet-curve fits.
_SENSORS = {
    "mq7_co":     (10.0, 27.5, 99.042,  -1.518),
    "mq135_nh3":  (10.0, 3.6,  102.2,   -2.473),
    "mq2_lpg":    (5.0,  9.83, 574.25,  -2.222),
    "mq2_smoke":  (5.0,  9.83, 3616.1,  -2.675),
}
# NO2 / NOx have no dedicated sensor: these are ESTIMATES scaled from the
# MQ-135 rise above its clean-air value (full-scale values are only a guess).
NO2_MAX_PPM = float(os.getenv("NO2_MAX_PPM", "1.0"))
NOX_MAX_PPM = float(os.getenv("NOX_MAX_PPM", "2.0"))
_RL_OVERRIDE = os.getenv("MQ_RL_KOHM")  # set if your module uses a different load resistor


def _rs(raw, rl):
    """Sensor resistance (kOhm) from a raw ADC reading."""
    vout = float(raw) / ADC_MAX * VREF * DIVIDER
    vout = max(0.01, min(VC - 0.01, vout))
    return rl * (VC - vout) / vout


def _ppm(raw, clean_raw, key):
    rl, clean_ratio, a, b = _SENSORS[key]
    if _RL_OVERRIDE:
        rl = float(_RL_OVERRIDE)
    r0 = _rs(clean_raw, rl) / clean_ratio
    ratio = _rs(raw, rl) / r0
    return a * (ratio ** b)


def _fmt(value, max_ppm):
    return round(max(0.0, min(value, max_ppm)), 2)


def raw_to_ppm(mq2, mq7, mq135):
    """Gas concentrations in ppm for the dashboard tiles."""
    return {
        "co_ppm":     _fmt(_ppm(mq7, CLEAN_MQ7, "mq7_co"), 2000),        # MQ-7
        "nh3_ppm":    _fmt(_ppm(mq135, CLEAN_MQ135, "mq135_nh3"), 500),  # MQ-135
        "no2_ppm":    _scale(mq135, CLEAN_MQ135, NO2_MAX_PPM),          # estimate
        "nox_ppm":    _scale(mq135, CLEAN_MQ135, NOX_MAX_PPM),          # estimate
        "lpg_ppm":    _fmt(_ppm(mq2, CLEAN_MQ2, "mq2_lpg"), 10000),      # MQ-2
        "smoke_ppm":  _fmt(_ppm(mq2, CLEAN_MQ2, "mq2_smoke"), 10000),    # MQ-2
        "note": "Approximate ppm from MQ datasheet curves. Needs R0 calibration "
                "(MQ7_CLEAN / MQ135_CLEAN / MQ2_CLEAN). NO2/NOx are estimates from MQ-135, not measured.",
    }