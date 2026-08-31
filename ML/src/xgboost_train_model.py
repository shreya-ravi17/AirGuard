import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
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

X = df_clean[['CO', 'NH3', 'NO2']]
y = df_clean['AQI_Category_Merged']

# XGBoost needs numeric labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='mlogloss'
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

joblib.dump(model, 'models/model4.pkl')
joblib.dump(le, 'models/label_encoder.pkl')
print("\nModel saved to models/model4.pkl")