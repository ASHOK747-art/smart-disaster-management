import sys
import json
import os
import joblib
import pandas as pd

# SCRIPT_DIR is the directory containing predict.py (i.e. <project-root>/ml)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SCRIPT_DIR)

# Primary dataset & model paths relative to predict.py location
DATA_FILE = os.path.join(SCRIPT_DIR, "data", "processed", "district_ml_dataset.csv")
MODEL_FILE = os.path.join(SCRIPT_DIR, "models", "flood_risk_model.pkl")

# Fallback paths relative to root project directory
if not os.path.exists(DATA_FILE):
    DATA_FILE = os.path.join(BASE_DIR, "ml", "data", "processed", "district_ml_dataset.csv")

if not os.path.exists(MODEL_FILE):
    MODEL_FILE = os.path.join(BASE_DIR, "ml", "models", "flood_risk_model.pkl")

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


def normalize_name(value):
    return (
        str(value)
        .strip()
        .lower()
        .replace("district", "")
        .replace("-", "")
        .replace(" ", "")
    )


def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print(json.dumps({
            "success": False,
            "message": "District name is required."
        }))
        sys.exit(1)

    district_name = sys.argv[1].strip()

    try:
        if not os.path.exists(DATA_FILE):
            print(json.dumps({
                "success": False,
                "message": f"Dataset file not found at path: {DATA_FILE}"
            }))
            sys.exit(1)

        if not os.path.exists(MODEL_FILE):
            print(json.dumps({
                "success": False,
                "message": f"Trained model file not found at path: {MODEL_FILE}"
            }))
            sys.exit(1)

        # Load dataset
        df = pd.read_csv(DATA_FILE)

        # Normalize district names for robust lookup matching
        df["_lookup"] = df["District"].apply(normalize_name)
        lookup = normalize_name(district_name)

        district = df[df["_lookup"] == lookup]

        # Partial matching fallback if exact normalized match fails
        if district.empty:
            district = df[df["_lookup"].str.contains(lookup, regex=False)]

        if district.empty:
            print(json.dumps({
                "success": False,
                "message": f"District not found: {district_name}"
            }))
            sys.exit(0)

        # Load trained model bundle
        bundle = joblib.load(MODEL_FILE)
        model = bundle["model"] if isinstance(bundle, dict) and "model" in bundle else bundle

        # Get top matching district row
        row = district.iloc[0]

        # Prepare feature vector
        X = pd.DataFrame(
            [[row[feature] for feature in FEATURES]],
            columns=FEATURES
        )

        # Model prediction & class probabilities
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]

        probability_map = {
            str(class_name): round(float(prob) * 100, 2)
            for class_name, prob in zip(model.classes_, probabilities)
        }

        result = {
            "success": True,
            "district": str(row["District"]),
            "state": str(row["State"]) if "State" in row and pd.notna(row["State"]) else "",
            "riskLevel": str(prediction),
            "probabilities": probability_map,
            "features": {
                "percentFloodedArea": float(row["Percent_Flooded_Area"]),
                "permanentWater": float(row["Parmanent_Water"]),
                "correctedFloodedArea": float(row["Corrected_Percent_Flooded_Area"]),
                "population": float(row["Population"]),
                "meanFloodDuration": float(row["Mean_Flood_Duration"]),
                "historicalFloodCount": float(row["Historical_Flood_Count"]),
                "historicalAverageDuration": float(row["Historical_Average_Duration"]),
                "historicalTotalDuration": float(row["Historical_Total_Duration"])
            }
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": f"Error during ML prediction execution: {str(e)}"
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()