import Incident, { INCIDENT_TYPES, SEVERITY_LEVELS, INCIDENT_STATUSES } from "../models/Incident.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/analytics/overview
// Admin-only consolidated analytics computed directly from MongoDB Incident data.
export const getAnalyticsOverview = asyncHandler(async (_req, res) => {
  const totalIncidents = await Incident.countDocuments({});

  if (totalIncidents === 0) {
    return res.json({
      success: true,
      hasData: false,
      message: "No incident reports found in database to generate analytics.",
      data: null,
    });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    highSeverityIncidents,
    resolvedIncidents,
    activeIncidents,
    peopleAffectedAgg,
    typeCountsAgg,
    severityCountsAgg,
    statusCountsAgg,
    dailyCountsAgg,
    topLocationAgg,
  ] = await Promise.all([
    // High & Critical severity count
    Incident.countDocuments({ severity: { $in: ["Critical", "High"] } }),

    // Resolved incidents count
    Incident.countDocuments({ status: "Resolved" }),

    // Active incidents count (excluding Resolved & Rejected)
    Incident.countDocuments({ status: { $nin: ["Resolved", "Rejected"] } }),

    // People affected aggregations (total, max, average)
    Incident.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$peopleAffected" },
          max: { $max: "$peopleAffected" },
          avg: { $avg: "$peopleAffected" },
        },
      },
    ]),

    // Incidents grouped by disaster type
    Incident.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAffected: { $sum: "$peopleAffected" },
          highSeverityCount: {
            $sum: { $cond: [{ $in: ["$severity", ["Critical", "High"]] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Incidents grouped by severity level
    Incident.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 },
        },
      },
    ]),

    // Incidents grouped by status
    Incident.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // 30-day daily incident activity trend
    Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          peopleAffected: { $sum: "$peopleAffected" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Top disaster locations
    Incident.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $in: ["$severity", ["Critical", "High"]] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalPeopleAffected = peopleAffectedAgg[0]?.total || 0;
  const maxPeopleAffected = peopleAffectedAgg[0]?.max || 0;
  const avgPeopleAffected = totalIncidents > 0 ? parseFloat((totalPeopleAffected / totalIncidents).toFixed(1)) : 0;

  // Format type breakdown
  const typeMap = Object.fromEntries(typeCountsAgg.map((t) => [t._id, t]));
  const byType = INCIDENT_TYPES.map((type) => {
    const item = typeMap[type] || { count: 0, totalAffected: 0, highSeverityCount: 0 };
    return {
      type,
      count: item.count,
      percentage: parseFloat(((item.count / totalIncidents) * 100).toFixed(1)),
      totalAffected: item.totalAffected,
      highSeverityCount: item.highSeverityCount,
    };
  }).filter((t) => t.count > 0 || INCIDENT_TYPES.slice(0, 5).includes(t.type));

  // Format severity breakdown
  const severityMap = Object.fromEntries(severityCountsAgg.map((s) => [s._id, s.count]));
  const bySeverity = SEVERITY_LEVELS.map((severity) => {
    const count = severityMap[severity] || 0;
    return {
      severity,
      count,
      percentage: parseFloat(((count / totalIncidents) * 100).toFixed(1)),
    };
  });

  // Format status breakdown
  const statusMap = Object.fromEntries(statusCountsAgg.map((s) => [s._id, s.count]));
  const byStatus = INCIDENT_STATUSES.map((status) => {
    const count = statusMap[status] || 0;
    return {
      status,
      count,
      percentage: parseFloat(((count / totalIncidents) * 100).toFixed(1)),
    };
  });

  // Build 30-day continuous timeline
  const dailyMap = Object.fromEntries(dailyCountsAgg.map((d) => [d._id, d]));
  const trend = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    const dayLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayData = dailyMap[dateStr] || { count: 0, peopleAffected: 0 };

    trend.push({
      date: dateStr,
      day: dayLabel,
      count: dayData.count,
      peopleAffected: dayData.peopleAffected,
    });
  }

  // Calculate insights
  const mostFrequentTypeObj = typeCountsAgg[0] || null;
  const topLocationObj = topLocationAgg[0] || null;
  const criticalCount = bySeverity.find((s) => s.severity === "Critical")?.count || 0;

  res.json({
    success: true,
    hasData: true,
    data: {
      summary: {
        totalIncidents,
        highSeverityIncidents,
        peopleAffected: totalPeopleAffected,
        resolvedIncidents,
        activeIncidents,
        criticalCount,
        resolutionRate: parseFloat(((resolvedIncidents / totalIncidents) * 100).toFixed(1)),
      },
      byType,
      bySeverity,
      byStatus,
      trend,
      impact: {
        totalPeopleAffected,
        averagePeopleAffected: avgPeopleAffected,
        maxPeopleAffected,
      },
      topLocations: topLocationAgg.map((l) => ({
        location: l._id || "Unspecified Area",
        count: l.count,
        criticalCount: l.criticalCount,
      })),
      insights: {
        mostFrequentType: mostFrequentTypeObj ? mostFrequentTypeObj._id : "N/A",
        mostFrequentTypeCount: mostFrequentTypeObj ? mostFrequentTypeObj.count : 0,
        topLocationName: topLocationObj ? topLocationObj._id : "N/A",
        topLocationCount: topLocationObj ? topLocationObj.count : 0,
      },
      lastUpdated: new Date().toISOString(),
    },
  });
});
