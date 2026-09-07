import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Load original dataset
df = pd.read_csv("data/city_day.csv")

# Now include PM2.5 and PM10 since PMS5003 sensor is being added
columns_needed = ['CO', 'NH3', 'NO2', 'NOx', 'PM2.5', 'PM10', 'AQI']
df_clean = df[columns_needed].dropna()

print("Dataset shape after dropping NaN:", df_clean.shape)

# Check correlation with AQI - verify PM2.5/PM10 actually help
correlation = df_clean.corr()['AQI']
print("\nCorrelation with AQI:\n", correlation)

features = ['CO', 'NH3', 'NO2', 'NOx', 'PM2.5', 'PM10']
X = df_clean[features]
y = df_clean['AQI']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\nMAE       : {mae:.2f}")
print(f"RMSE      : {rmse:.2f}")
print(f"R2 Score  : {r2:.4f}")

# Feature importance - see how much PM2.5/PM10 actually contribute
importances = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature Importance:\n", importances)

joblib.dump(model, 'models/rf_regressor_with_pm.pkl')
print("\nModel saved to models/rf_regressor_with_pm.pkl")