import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

df_clean = pd.read_csv('data/cleaned_data.csv')

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
print("Class distribution:\n", df_clean['AQI_Category_Merged'].value_counts())

X = df_clean[['CO', 'NH3', 'NO2']]
y = df_clean['AQI_Category_Merged']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    class_weight='balanced',
    random_state=42
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

joblib.dump(model, 'models/airguard_model.pkl')
print("\nModel saved to models/airguard_model.pkl")