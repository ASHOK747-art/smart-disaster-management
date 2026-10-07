import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Incident, { INCIDENT_TYPES } from "../models/Incident.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateCategory(riskScore) {
  if (riskScore >= 75) return "Critical";
  if (riskScore >= 50) return "High";
  if (riskScore >= 25) return "Medium";
  return "Low";
}

// GET /api/predictions/risk
export const getRiskPrediction = asyncHandler(async (_req, res) => {
  const totalCount = await Incident.countDocuments({});

  if (totalCount === 0) {
    return res.json({
      success: true,
      hasData: false,
      message:
        "Insufficient historical data in database to calculate predictive risk scores.",
      missingData: "No incident reports found in the MongoDB collection.",
    });
  }

  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const [
    recentIncidents,
    previousIncidents,
    criticalHighCount,
    peopleAffectedAgg,
    typeCountsAgg,
    dailyCountsAgg,
  ] = await Promise.all([
    Incident.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

    Incident.countDocuments({
      createdAt: {
        $gte: fourteenDaysAgo,
        $lt: sevenDaysAgo,
      },
    }),

    Incident.countDocuments({
      severity: { $in: ["Critical", "High"] },
    }),

    Incident.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$peopleAffected" },
        },
      },
    ]),

    Incident.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          criticalCount: {
            $sum: {
              $cond: [
                {
                  $in: ["$severity", ["Critical", "High"]],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    Incident.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now - 6 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  const totalPeopleAffected = peopleAffectedAgg[0]?.total || 0;

  const frequencyScore = Math.min(30, recentIncidents * 5);

  const severityRatio =
    totalCount > 0 ? criticalHighCount / totalCount : 0;

  const severityScore = Math.min(
    35,
    Math.round(severityRatio * 35)
  );

  const trendDiff = recentIncidents - previousIncidents;

  const trendScore =
    trendDiff > 0 ? Math.min(20, trendDiff * 5) : 5;

  const impactScore = Math.min(
    15,
    Math.round((totalPeopleAffected / 50) * 15)
  );

  const overallRisk = Math.min(
    99,
    Math.max(
      5,
      frequencyScore +
        severityScore +
        trendScore +
        impactScore
    )
  );

  const overallCategory = calculateCategory(overallRisk);

  const typeMap = Object.fromEntries(
    typeCountsAgg.map((t) => [t._id, t])
  );

  const hazardRisks = INCIDENT_TYPES.slice(0, 4).map((type) => {
    const data = typeMap[type] || {
      count: 0,
      criticalCount: 0,
    };

    const hazardFreq = Math.min(
      40,
      data.count * 10
    );

    const hazardSev = Math.min(
      40,
      data.criticalCount * 15
    );

    const hazardBase = Math.min(
      20,
      Math.round(overallRisk * 0.2)
    );

    const risk = Math.min(
      95,
      Math.max(
        10,
        hazardFreq + hazardSev + hazardBase
      )
    );

    return {
      type,
      risk,
      category: calculateCategory(risk),
      incidentCount: data.count,
    };
  });

  const dailyMap = Object.fromEntries(
    dailyCountsAgg.map((d) => [d._id, d.count])
  );

  const riskTrend = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(
      now - i * 24 * 60 * 60 * 1000
    );

    const dateStr = d.toISOString().slice(0, 10);

    const dayLabel = d.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
      }
    );

    const count = dailyMap[dateStr] || 0;

    const dayRisk = Math.min(
      98,
      Math.max(
        10,
        Math.round(overallRisk * 0.6 + count * 8)
      )
    );

    riskTrend.push({
      day: dayLabel,
      risk: dayRisk,
      count,
    });
  }

  const factors = [
    {
      label: "Recent Incident Frequency",
      value: `${recentIncidents} reports (last 7d)`,
      weight:
        Math.round(
          (frequencyScore / 30) * 100
        ) || 10,
    },
    {
      label: "Critical & High Severity Ratio",
      value: `${Math.round(
        severityRatio * 100
      )}% of total reports`,
      weight:
        Math.round(
          (severityScore / 35) * 100
        ) || 10,
    },
    {
      label: "Weekly Incident Growth Rate",
      value:
        trendDiff >= 0
          ? `+${trendDiff} vs last week`
          : `${trendDiff} vs last week`,
      weight:
        Math.round(
          (trendScore / 20) * 100
        ) || 10,
    },
    {
      label: "Disaster Impact & Affected Count",
      value: `${totalPeopleAffected} persons impacted`,
      weight:
        Math.round(
          (impactScore / 15) * 100
        ) || 10,
    },
  ];

  const explanation =
    `Overall district risk is rated as ${overallCategory} ` +
    `(${overallRisk}/100) calculated from ${totalCount} ` +
    `recorded incident(s). Primary contributors: ` +
    `${recentIncidents} recent reports in the last 7 days ` +
    `and ${criticalHighCount} high-severity emergency event(s).`;

  res.json({
    success: true,
    hasData: true,
    data: {
      overall: {
        areaLabel: "District Command Center",
        overallRisk,
        overallCategory,
        explanation,
        lastUpdated: new Date().toISOString(),
      },
      hazards: hazardRisks,
      factors,
      trend: riskTrend,
    },
  });
});

// POST /api/predictions/district
export const predictDistrictRisk = asyncHandler(
  async (req, res) => {
    const { district } = req.body;

    if (!district || typeof district !== "string") {
      return res.status(400).json({
        success: false,
        message: "District name is required.",
      });
    }

    const pythonProcess = spawn("python", ["../ml/predict.py", district.trim()], {
  cwd: process.cwd(),
  windowsHide: true,
});

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("error", (error) => {
      return res.status(500).json({
        success: false,
        message:
          "Unable to start the Python prediction process.",
        error: error.message,
      });
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: "ML prediction failed.",
          error: errorOutput.trim(),
        });
      }

      try {
        const result = JSON.parse(output.trim());

        if (!result.success) {
          return res.status(404).json(result);
        }

        return res.json(result);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message:
            "Invalid response received from the ML model.",
          error: error.message,
          rawOutput: output,
        });
      }
    });
  }
);

// GET /api/predictions/districts
export const getDistrictFloodRisks = asyncHandler(async (_req, res) => {
  const filePath = path.join(__dirname, "../data/district_flood_risk.json");
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    return res.json(JSON.parse(raw));
  }
  return res.status(404).json({
    success: false,
    message: "District risk dataset not found.",
  });
});