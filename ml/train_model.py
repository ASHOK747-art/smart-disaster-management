import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# --------------------------------------------------
# Paths
# --------------------------------------------------

DATA_FILE = os.path.join(
    "ml",
    "data",
    "processed",
    "district_ml_dataset.csv"
)

MODEL_DIR = os.path.join(
    "ml",
    "models"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "flood_risk_model.pkl"
)

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# Load dataset
# --------------------------------------------------

df = pd.read_csv(DATA_FILE)

print("=" * 60)
print("FLOOD RISK MODEL TRAINING")
print("=" * 60)

print("Dataset rows:", len(df))


# --------------------------------------------------
# Create target from DFSI
# --------------------------------------------------

q33 = df["DFSI"].quantile(0.333333)
q66 = df["DFSI"].quantile(0.666667)


def classify_risk(value):

    if value <= q33:
        return "Low"

    elif value <= q66:
        return "Medium"

    else:
        return "High"


df["Risk_Level"] = df["DFSI"].apply(
    classify_risk
)


# --------------------------------------------------
# Select model features
# --------------------------------------------------
# DFSI is deliberately NOT included because it
# is used to create the target.

FEATURES = [
    "Percent_Flooded_Area",
    "Parmanent_Water",
    "Corrected_Percent_Flooded_Area",
    "Population",
    "Mean_Flood_Duration",
    "Historical_Flood_Count",
    "Historical_Average_Duration",
    "Historical_Total_Duration"
]

TARGET = "Risk_Level"


X = df[FEATURES]
y = df[TARGET]


# --------------------------------------------------
# Train/test split
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# --------------------------------------------------
# Create Random Forest
# --------------------------------------------------

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=8,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    class_weight="balanced"
)


# --------------------------------------------------
# Train
# --------------------------------------------------

print("\nTraining model...")

model.fit(
    X_train,
    y_train
)

print("Training complete.")


# --------------------------------------------------
# Evaluate
# --------------------------------------------------

y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n" + "=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)

print("\nClassification report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)

print("\nConfusion matrix:")

print(
    confusion_matrix(
        y_test,
        y_pred
    )
)


# --------------------------------------------------
# Feature importance
# --------------------------------------------------

importance = pd.DataFrame({
    "Feature": FEATURES,
    "Importance": model.feature_importances_
})

importance = importance.sort_values(
    "Importance",
    ascending=False
)

print("\nFeature importance:")

print(
    importance.to_string(
        index=False
    )
)


# --------------------------------------------------
# Save model
# --------------------------------------------------

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "threshold_low_medium": q33,
        "threshold_medium_high": q66
    },
    MODEL_FILE
)

print("\nModel saved to:")

print(MODEL_FILE)

print("\n" + "=" * 60)
print("MODEL TRAINING COMPLETE")
print("=" * 60)