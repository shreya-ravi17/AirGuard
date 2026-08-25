import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from imblearn.over_sampling import SMOTE
import joblib

df = pd.read_csv('data/city_day.csv')  # original raw file, not cleaned_data.csv

columns_needed = ['CO', 'NH3', 'NO2', 'NOx', 'AQI', 'AQI_Bucket']
df_clean = df[columns_needed].dropna()

def merge_categories(cat):
    if cat in ['Good', 'Satisfactory']:
        return 'Good'
    elif cat == 'Moderate':
        return 'Moderate'
    elif cat in ['Poor', 'Very Poor']:
        return 'Poor'
    else:
        return 'Severe'

df_clean['AQI_Category_Merged'] = df_clean['AQI_Bucket'].apply(merge_categories)

features = ['CO', 'NH3', 'NO2', 'NOx']
X = df_clean[features]
y = df_clean['AQI_Category_Merged']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
model.fit(X_train_resampled, y_train_resampled)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

joblib.dump(model, 'models/rf_model.pkl')
print("\nModel saved to models/rf_model.pkl")