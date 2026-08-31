import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import numpy as np

df = pd.read_csv('data/city_day.csv')

columns_needed = ['CO', 'NH3', 'NO2', 'NOx', 'AQI']
df_clean = df[columns_needed].dropna()

features = ['CO', 'NH3', 'NO2', 'NOx']
X = df_clean[features]
y = df_clean['AQI']  # predicting the exact number now, not category

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"MAE:  {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R2 Score: {r2:.4f}")

joblib.dump(model, 'models/rf_regressor.pkl')
print("\nModel saved to models/rf_regressor.pkl")