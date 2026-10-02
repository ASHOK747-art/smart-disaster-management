import os
import pandas as pd


PROCESSED_DIR = os.path.join("ml", "data", "processed")

MASTER_FILE = os.path.join(
    PROCESSED_DIR,
    "district_combined.csv"
)

HISTORY_FILE = os.path.join(
    PROCESSED_DIR,
    "district_flood_history.csv"
)

OUTPUT_FILE = os.path.join(
    PROCESSED_DIR,
    "district_ml_dataset.csv"
)


# --------------------------------------------------
# 1. Load datasets
# --------------------------------------------------

master = pd.read_csv(MASTER_FILE)
history = pd.read_csv(HISTORY_FILE)

print("=" * 60)
print("CREATING ML DATASET")
print("=" * 60)

print("Master rows:", len(master))
print("History rows:", len(history))


# --------------------------------------------------
# 2. Select useful prediction features
# --------------------------------------------------

master_features = [
    "District",
    "State",
    "district_key",
    "DFSI",
    "Percent_Flooded_Area",
    "Parmanent_Water",
    "Corrected_Percent_Flooded_Area",
    "Population",
    "Mean_Flood_Duration"
]

history_features = [
    "district_key",
    "Historical_Flood_Count",
    "Historical_Average_Duration",
    "Historical_Total_Duration"
]


master_selected = master[master_features].copy()

history_selected = history[history_features].copy()


# --------------------------------------------------
# 3. Merge
# --------------------------------------------------

ml_dataset = master_selected.merge(
    history_selected,
    on="district_key",
    how="left"
)


# --------------------------------------------------
# 4. Fill missing values
# --------------------------------------------------

numeric_columns = [
    "DFSI",
    "Percent_Flooded_Area",
    "Parmanent_Water",
    "Corrected_Percent_Flooded_Area",
    "Population",
    "Mean_Flood_Duration",
    "Historical_Flood_Count",
    "Historical_Average_Duration",
    "Historical_Total_Duration"
]

for column in numeric_columns:

    ml_dataset[column] = pd.to_numeric(
        ml_dataset[column],
        errors="coerce"
    )

    ml_dataset[column] = (
        ml_dataset[column]
        .fillna(0)
    )


# --------------------------------------------------
# 5. Remove duplicate districts
# --------------------------------------------------

ml_dataset = (
    ml_dataset
    .drop_duplicates(
        subset=["district_key"]
    )
)


# --------------------------------------------------
# 6. Save
# --------------------------------------------------

ml_dataset.to_csv(
    OUTPUT_FILE,
    index=False
)


# --------------------------------------------------
# 7. Display information
# --------------------------------------------------

print("\nFinal ML dataset")
print("-" * 60)

print("Rows:", len(ml_dataset))
print("Columns:", len(ml_dataset.columns))

print("\nColumns:")

for column in ml_dataset.columns:
    print(" -", column)


print("\nMissing values:")

print(
    ml_dataset.isnull().sum()
)


print("\nSample:")

print(
    ml_dataset.head(10).to_string(
        index=False
    )
)


print("\nSaved to:")
print(OUTPUT_FILE)

print("\n" + "=" * 60)
print("ML DATASET CREATION COMPLETE")
print("=" * 60)