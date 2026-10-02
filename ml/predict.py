import sys
import json
import os

import joblib
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_FILE = os.path.join(
    BASE_DIR,
    "ml",
    "data",
    "processed",
    "district_ml_dataset.csv"
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "flood_risk_model.pkl"
)


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
    )


def main():

    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "message": "District name is required."
        }))
        sys.exit(1)

    district_name = sys.argv[1]

    # Load dataset
    df = pd.read_csv(DATA_FILE)

    # Normalize district names for matching
    df["_lookup"] = df["District"].apply(
        normalize_name
    )

    lookup = normalize_name(district_name)

    district = df[
        df["_lookup"] == lookup
    ]

    if district.empty:
        print(json.dumps({
            "success": False,
            "message": f"District not found: {district_name}"
        }))
        sys.exit(0)

    # Load trained model
    bundle = joblib.load(MODEL_FILE)

    model = bundle["model"]

    # Get district row
    row = district.iloc[0]

    # Prepare features
    X = pd.DataFrame(
        [[row[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    # Prediction
    prediction = model.predict(X)[0]

    # Probabilities
    probabilities = model.predict_proba(X)[0]

    probability_map = {
        class_name: round(
            float(probability) * 100,
            2
        )
        for class_name, probability
        in zip(
            model.classes_,
            probabilities
        )
    }

    # Output
    result = {
        "success": True,
        "district": row["District"],
        "state": row["State"],
        "riskLevel": prediction,
        "probabilities": probability_map,
        "features": {
            "percentFloodedArea": float(
                row["Percent_Flooded_Area"]
            ),
            "permanentWater": float(
                row["Parmanent_Water"]
            ),
            "correctedFloodedArea": float(
                row["Corrected_Percent_Flooded_Area"]
            ),
            "population": float(
                row["Population"]
            ),
            "meanFloodDuration": float(
                row["Mean_Flood_Duration"]
            ),
            "historicalFloodCount": float(
                row["Historical_Flood_Count"]
            ),
            "historicalAverageDuration": float(
                row["Historical_Average_Duration"]
            ),
            "historicalTotalDuration": float(
                row["Historical_Total_Duration"]
            )
        }
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()