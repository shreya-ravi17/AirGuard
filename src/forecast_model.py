import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Load original dataset (has Date + City + AQI)
df = pd.read_csv("data/city_day.csv")

# Keep only what we need
df = df[['City', 'Date', 'AQI']].dropna()
df['Date'] = pd.to_datetime(df['Date'])

# Sort properly by city and date (critical for time-series lag features)
df = df.sort_values(['City', 'Date'])

# Create lag features PER CITY (yesterday, 2 days ago, 3 days ago AQI)
df['AQI_lag1'] = df.groupby('City')['AQI'].shift(1)
df['AQI_lag2'] = df.groupby('City')['AQI'].shift(2)
df['AQI_lag3'] = df.groupby('City')['AQI'].shift(3)

# Drop rows where lag features are missing (first 3 days of each city)
df = df.dropna(subset=['AQI_lag1', 'AQI_lag2', 'AQI_lag3'])

print("Dataset shape after creating lag features:", df.shape)

# Features = past AQI values, Target = today's AQI (i.e., "tomorrow" relative to lags)
features = ['AQI_lag1', 'AQI_lag2', 'AQI_lag3']
X = df[features]
y = df['AQI']

# Time-series split: don't shuffle randomly, use last 20% as test (more realistic)
split_idx = int(len(df) * 0.8)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)

# Train model
model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\nForecast Model Performance")
print("---------------------------")
print(f"MAE       : {mae:.2f}")
print(f"RMSE      : {rmse:.2f}")
print(f"R2 Score  : {r2:.4f}")

# Save model
joblib.dump(model, "models/forecast_model.pkl")
print("\nForecast model saved to models/forecast_model.pkl")