import os
import re
import pandas as pd


RAW_DIR = os.path.join("ml", "data", "raw")
PROCESSED_DIR = os.path.join("ml", "data", "processed")

os.makedirs(PROCESSED_DIR, exist_ok=True)


def normalize_name(name):
    """Normalize a district name for matching."""

    if pd.isna(name):
        return ""

    name = str(name).strip().lower()

    name = name.replace("&", "and")
    name = name.replace("district", "")

    name = re.sub(r"[^a-z0-9]", "", name)

    return name


# --------------------------------------------------
# 1. Load master district dataset
# --------------------------------------------------

master = pd.read_csv(
    os.path.join(
        PROCESSED_DIR,
        "district_combined.csv"
    )
)

master["district_key"] = (
    master["District"]
    .apply(normalize_name)
)

# Authoritative district -> state mapping
valid_districts = set(
    master["district_key"]
)


# --------------------------------------------------
# 2. Load flood inventory
# --------------------------------------------------

inventory = pd.read_csv(
    os.path.join(
        RAW_DIR,
        "India_Flood_Inventory_v3.csv"
    )
)

print("=" * 60)
print("PROCESSING HISTORICAL FLOOD INVENTORY")
print("=" * 60)

print("Total inventory records:", len(inventory))


# --------------------------------------------------
# 3. Convert numerical fields
# --------------------------------------------------

numeric_columns = [
    "Duration(Days)",
    "Human fatality",
    "Human injured",
    "Human Displaced",
    "Animal Fatality"
]

for column in numeric_columns:

    inventory[column] = pd.to_numeric(
        inventory[column],
        errors="coerce"
    )


# --------------------------------------------------
# 4. Extract valid district names
# --------------------------------------------------

records = []

for _, row in inventory.iterrows():

    if pd.isna(row["Districts"]):
        continue

    district_text = str(row["Districts"])

    # Split comma-separated district names
    district_names = [
        x.strip()
        for x in district_text.split(",")
        if x.strip()
    ]

    for district in district_names:

        district_key = normalize_name(district)

        # Only accept districts that exist
        # in our authoritative 722-district dataset
        if district_key not in valid_districts:
            continue

        records.append({
            "district_key": district_key,

            "Duration_Days": row["Duration(Days)"],

            "Human_Fatality": row["Human fatality"],

            "Human_Injured": row["Human injured"],

            "Human_Displaced": row["Human Displaced"],

            "Animal_Fatality": row["Animal Fatality"]
        })


expanded = pd.DataFrame(records)


# --------------------------------------------------
# 5. Check extracted records
# --------------------------------------------------

print(
    "Valid district-event records:",
    len(expanded)
)

print(
    "Unique matched districts:",
    expanded["district_key"].nunique()
)


# --------------------------------------------------
# 6. Aggregate historical information
# --------------------------------------------------

history = (
    expanded
    .groupby(
        "district_key",
        as_index=False
    )
    .agg(
        Historical_Flood_Count=(
            "district_key",
            "count"
        ),

        Historical_Total_Duration=(
            "Duration_Days",
            "sum"
        ),

        Historical_Average_Duration=(
            "Duration_Days",
            "mean"
        ),

        Historical_Fatalities=(
            "Human_Fatality",
            "sum"
        ),

        Historical_Injuries=(
            "Human_Injured",
            "sum"
        ),

        Historical_Displaced=(
            "Human_Displaced",
            "sum"
        ),

        Historical_Animal_Fatalities=(
            "Animal_Fatality",
            "sum"
        )
    )
)


# --------------------------------------------------
# 7. Fill missing historical values
# --------------------------------------------------

history_columns = [
    "Historical_Flood_Count",
    "Historical_Total_Duration",
    "Historical_Average_Duration",
    "Historical_Fatalities",
    "Historical_Injuries",
    "Historical_Displaced",
    "Historical_Animal_Fatalities"
]

for column in history_columns:

    history[column] = (
        history[column]
        .fillna(0)
    )


# --------------------------------------------------
# 8. Merge with all 722 districts
# --------------------------------------------------

final = master[
    [
        "District",
        "State",
        "district_key"
    ]
].merge(
    history,
    on="district_key",
    how="left"
)


# Districts with no historical record
# receive zero historical events.
for column in history_columns:

    final[column] = (
        final[column]
        .fillna(0)
    )


# --------------------------------------------------
# 9. Save
# --------------------------------------------------

output_file = os.path.join(
    PROCESSED_DIR,
    "district_flood_history.csv"
)

final.to_csv(
    output_file,
    index=False
)


# --------------------------------------------------
# 10. Final summary
# --------------------------------------------------

print("\n" + "=" * 60)
print("HISTORICAL PROCESSING COMPLETE")
print("=" * 60)

print(
    "Master districts:",
    len(master)
)

print(
    "Matched historical districts:",
    history["district_key"].nunique()
)

print(
    "Final districts:",
    len(final)
)

print("\nColumns:")

for column in final.columns:
    print(" -", column)

print("\nSample:")
print(
    final.head(10).to_string(index=False)
)

print("\nSaved to:")
print(output_file)
