import os
import re
import pandas as pd


RAW_DIR = os.path.join("ml", "data", "raw")
PROCESSED_DIR = os.path.join("ml", "data", "processed")

os.makedirs(PROCESSED_DIR, exist_ok=True)


def normalize_district(name):
    """Normalize district names for reliable dataset matching."""
    if pd.isna(name):
        return ""

    name = str(name).strip().lower()

    # Remove the word district
    name = name.replace("district", "")

    # Normalize common punctuation/spacing differences
    name = name.replace("&", "and")

    # Remove non-alphanumeric characters
    name = re.sub(r"[^a-z0-9]", "", name)

    return name


# --------------------------------------------------
# 1. Load datasets
# --------------------------------------------------

dfsi = pd.read_csv(
    os.path.join(RAW_DIR, "DFSI.csv")
)

flood_area = pd.read_csv(
    os.path.join(RAW_DIR, "District_FloodedArea.csv")
)

flood_impact = pd.read_csv(
    os.path.join(RAW_DIR, "District_FloodImpact.csv")
)


# --------------------------------------------------
# 2. Rename columns
# --------------------------------------------------
dfsi = dfsi.rename(columns={
    "Unnamed: 0": "District",
    "State_Name": "State"
})

flood_area = flood_area.rename(columns={
    "Dist_Name": "District"
})

flood_impact = flood_impact.rename(columns={
    "Dist_Name": "District"
})


# --------------------------------------------------
# 3. Create normalized matching key
# --------------------------------------------------

dfsi["district_key"] = dfsi["District"].apply(normalize_district)
flood_area["district_key"] = flood_area["District"].apply(normalize_district)
flood_impact["district_key"] = flood_impact["District"].apply(normalize_district)


# --------------------------------------------------
# 4. Remove duplicate matching keys if any
# --------------------------------------------------

dfsi = dfsi.drop_duplicates("district_key")
flood_area = flood_area.drop_duplicates("district_key")
flood_impact = flood_impact.drop_duplicates("district_key")


# --------------------------------------------------
# 5. Merge the district datasets
# --------------------------------------------------

combined = dfsi.merge(
    flood_area.drop(columns=["District"]),
    on="district_key",
    how="inner"
)

combined = combined.merge(
    flood_impact.drop(columns=["District"]),
    on="district_key",
    how="inner"
)


# --------------------------------------------------
# 6. Clean numerical columns
# --------------------------------------------------

numeric_columns = [
    "DFSI",
    "Percent_Flooded_Area",
    "Parmanent_Water",
    "Corrected_Percent_Flooded_Area",
    "Human_fatality",
    "Human_injured",
    "Population",
    "Mean_Flood_Duration"
]

for column in numeric_columns:
    combined[column] = pd.to_numeric(
        combined[column],
        errors="coerce"
    )


# --------------------------------------------------
# 7. Handle missing flood duration
# --------------------------------------------------

combined["Mean_Flood_Duration"] = (
    combined["Mean_Flood_Duration"]
    .fillna(combined["Mean_Flood_Duration"].median())
)


# --------------------------------------------------
# 8. Select final columns
# --------------------------------------------------
combined = combined[
    [
        "District",
        "State",
        "district_key",
        "DFSI",
        "Percent_Flooded_Area",
        "Parmanent_Water",
        "Corrected_Percent_Flooded_Area",
        "Human_fatality",
        "Human_injured",
        "Population",
        "Mean_Flood_Duration"
    ]
]


# --------------------------------------------------
# 9. Save processed dataset
# --------------------------------------------------

output_file = os.path.join(
    PROCESSED_DIR,
    "district_combined.csv"
)

combined.to_csv(
    output_file,
    index=False
)


# --------------------------------------------------
# 10. Print summary
# --------------------------------------------------

print("=" * 60)
print("DISTRICT DATASET PREPARATION COMPLETE")
print("=" * 60)

print(f"DFSI districts:         {len(dfsi)}")
print(f"Flood area districts:   {len(flood_area)}")
print(f"Flood impact districts: {len(flood_impact)}")
print(f"Combined districts:     {len(combined)}")

print("\nColumns:")
for column in combined.columns:
    print(" -", column)

print("\nMissing values:")
print(combined.isna().sum())

print(f"\nSaved to:")
print(output_file)