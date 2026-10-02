import pandas as pd
import os


FILE = os.path.join(
    "ml",
    "data",
    "processed",
    "district_ml_dataset.csv"
)

df = pd.read_csv(FILE)

print("=" * 60)
print("DFSI TARGET ANALYSIS")
print("=" * 60)

print("\nDFSI statistics:")
print(df["DFSI"].describe())

# --------------------------------------------------
# Create Low / Medium / High classes
# --------------------------------------------------
# 0-33%  -> Low
# 33-66% -> Medium
# 66-100% -> High
#
# Using quantiles gives approximately equal numbers
# of districts in each class.

q33 = df["DFSI"].quantile(0.333333)
q66 = df["DFSI"].quantile(0.666667)

print("\nProposed thresholds:")
print(f"Low / Medium threshold : {q33:.4f}")
print(f"Medium / High threshold : {q66:.4f}")


def classify_risk(value):
    if value <= q33:
        return "Low"
    elif value <= q66:
        return "Medium"
    else:
        return "High"


df["Risk_Level"] = df["DFSI"].apply(classify_risk)


print("\nRisk-level distribution:")
print(
    df["Risk_Level"]
    .value_counts()
    .sort_index()
)

print("\nRisk-level percentages:")
print(
    (
        df["Risk_Level"]
        .value_counts(normalize=True)
        * 100
    )
    .round(2)
)


print("\nRisk-level DFSI ranges:")

print(
    df.groupby("Risk_Level")["DFSI"]
    .agg(["count", "min", "max", "mean"])
    .sort_index()
)


print("\nSample districts:")

print(
    df[
        [
            "District",
            "State",
            "DFSI",
            "Risk_Level"
        ]
    ]
    .head(20)
    .to_string(index=False)
)

print("\n" + "=" * 60)
print("TARGET ANALYSIS COMPLETE")
print("=" * 60)