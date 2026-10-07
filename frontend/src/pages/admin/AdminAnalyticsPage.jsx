import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Siren,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getAnalyticsOverview } from "../../services/analyticsService";
import { timeAgo } from "../../utils/formatTime";
import "./AdminDashboard.css";
import "./AdminAnalyticsPage.css";

const COLOR_MAP = {
  critical: "#e4402c",
  warning: "#f0a202",
  safe: "#1e9e6b",
  info: "#2f6690",
  neutral: "#98a2b3",
};

const SEVERITY_COLORS = {
  Critical: "#e4402c",
  High: "#e4402c",
  Medium: "#f0a202",
  Low: "#1e9e6b",
};

const PIE_COLORS = ["#1c3b6b", "#2f6690", "#6a9bc0", "#f0a202", "#e4402c", "#98a2b3"];
const axisTick = { fontSize: 12, fill: "#475467" };
const tooltipStyle = { borderRadius: 8, border: "1px solid #eaecf0", fontSize: 13 };

function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAnalyticsOverview();
      setAnalyticsData(res);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load analytics data from server. Please check database connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Analyzing disaster management database..." />;
  }

  const hasData = Boolean(analyticsData && analyticsData.hasData && analyticsData.data);
  const {
    summary,
    byType = [],
    bySeverity = [],
    byStatus = [],
    trend = [],
    impact,
    topLocations = [],
    insights,
    lastUpdated,
  } = analyticsData?.data || {};

  return (
    <div className="admin-page analytics-page">
      {/* Header */}
      <div className="admin-dashboard__head analytics-head">
        <div>
          <div className="analytics-title-row">
            <h1>Analytics</h1>
            <StatusBadge tone="info">Live MongoDB Analytics</StatusBadge>
          </div>
          <p>Analyze disaster incidents, severity, impact, and response trends.</p>
        </div>

        <div className="analytics-actions">
          {lastUpdated && (
            <span className="analytics-last-updated">
              <Clock size={13} /> Updated {timeAgo(lastUpdated)}
            </span>
          )}
          <button
            className="disaster-map-error__retry"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="analytics-error-box">
          <AlertTriangle size={18} />
          <div className="analytics-error-content">
            <strong>Unable to Load Analytics</strong>
            <p>{error}</p>
          </div>
          <button className="disaster-map-error__retry" onClick={fetchAnalytics}>
            Retry Request
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && !hasData && (
        <div className="analytics-nodata-card">
          <EmptyState
            icon={BarChart3}
            title="No Analytics Data Available"
            message={
              analyticsData?.message ||
              "Analytics metrics and trend visualizations will appear once incident reports exist in the database."
            }
          />
        </div>
      )}

      {/* Normal Data State */}
      {!error && hasData && (
        <div className="analytics-content">
          {/* Summary Stat Cards */}
          <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
            <StatCard
              icon={Siren}
              label="Total Incidents"
              value={summary?.totalIncidents || 0}
              tone="neutral"
            />
            <StatCard
              icon={AlertTriangle}
              label="Critical / High Incidents"
              value={summary?.highSeverityIncidents || 0}
              tone="critical"
            />
            <StatCard
              icon={Users}
              label="People Affected"
              value={summary?.peopleAffected || 0}
              tone="warning"
            />
            <StatCard
              icon={CheckCircle2}
              label="Resolved Incidents"
              value={summary?.resolvedIncidents || 0}
              tone="safe"
            />
            <StatCard
              icon={ShieldCheck}
              label="Resolution Rate"
              value={`${summary?.resolutionRate || 0}%`}
              tone="safe"
            />
          </div>

          {/* Highlights & Top Insights Banner */}
          <div className="analytics-insights-banner">
            <div className="analytics-insight-item">
              <span className="analytics-insight-icon">
                <Flame size={18} />
              </span>
              <div>
                <span className="analytics-insight-label">Most Frequent Disaster</span>
                <strong className="analytics-insight-val">{insights?.mostFrequentType || "N/A"}</strong>
                <span className="analytics-insight-sub">({insights?.mostFrequentTypeCount || 0} reported cases)</span>
              </div>
            </div>

            <div className="analytics-insight-item">
              <span className="analytics-insight-icon" style={{ color: "#e4402c" }}>
                <MapPin size={18} />
              </span>
              <div>
                <span className="analytics-insight-label">Top Location Hotspot</span>
                <strong className="analytics-insight-val">{insights?.topLocationName || "N/A"}</strong>
                <span className="analytics-insight-sub">({insights?.topLocationCount || 0} incidents)</span>
              </div>
            </div>

            <div className="analytics-insight-item">
              <span className="analytics-insight-icon" style={{ color: "#1e9e6b" }}>
                <Award size={18} />
              </span>
              <div>
                <span className="analytics-insight-label">Average Impact per Event</span>
                <strong className="analytics-insight-val">{impact?.averagePeopleAffected || 0} persons</strong>
                <span className="analytics-insight-sub">(Max single event: {impact?.maxPeopleAffected || 0})</span>
              </div>
            </div>
          </div>

          {/* 30-Day Activity Trend Chart */}
          <div className="chart-card analytics-card" style={{ marginBottom: "20px" }}>
            <div className="analytics-card-title">
              <TrendingUp size={18} className="analytics-icon-brand" />
              <div>
                <h3>30-Day Incident Trend & Activity</h3>
                <span className="analytics-card-sub">Daily report volume over the last 30 calendar days</span>
              </div>
            </div>

            <div style={{ width: "100%", height: 260, marginTop: "12px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                  <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Incidents"
                    stroke="#1c3b6b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#1c3b6b" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="peopleAffected"
                    name="People Affected"
                    stroke="#f0a202"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid: Disaster Type & Severity Charts */}
          <div className="admin-chart-grid" style={{ marginBottom: "20px" }}>
            {/* Disaster Type Analysis */}
            <div className="chart-card analytics-card">
              <div className="analytics-card-title">
                <Siren size={18} className="analytics-icon-brand" />
                <h3>Incidents by Disaster Type</h3>
              </div>

              <div style={{ width: "100%", height: 220, marginTop: "12px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {byType.map((d, idx) => (
                        <Cell key={d.type} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-type-list">
                {byType.map((item) => (
                  <div key={item.type} className="analytics-type-row">
                    <div className="analytics-type-meta">
                      <span className="analytics-type-name">{item.type}</span>
                      <span className="analytics-type-count">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="analytics-track">
                      <div
                        className="analytics-fill"
                        style={{ width: `${item.percentage}%`, backgroundColor: "#2f6690" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Level Analysis */}
            <div className="chart-card analytics-card">
              <div className="analytics-card-title">
                <AlertTriangle size={18} className="analytics-icon-brand" />
                <h3>Incident Severity Distribution</h3>
              </div>

              <div style={{ width: "100%", height: 220, marginTop: "12px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySeverity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                    <XAxis dataKey="severity" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
                      {bySeverity.map((s) => (
                        <Cell key={s.severity} fill={SEVERITY_COLORS[s.severity] || COLOR_MAP.neutral} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="analytics-severity-list">
                {bySeverity.map((s) => {
                  const tone = s.severity === "Critical" || s.severity === "High" ? "critical" : s.severity === "Medium" ? "warning" : "safe";
                  return (
                    <div key={s.severity} className="analytics-severity-item">
                      <StatusBadge tone={tone}>{s.severity}</StatusBadge>
                      <span className="analytics-severity-val">{s.count} incidents ({s.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident Status Analysis */}
            <div className="chart-card analytics-card">
              <div className="analytics-card-title">
                <Activity size={18} className="analytics-icon-brand" />
                <h3>Incident Lifecycle Status</h3>
              </div>

              <div className="analytics-status-list" style={{ marginTop: "16px" }}>
                {byStatus.map((st) => (
                  <div key={st.status} className="analytics-status-row">
                    <div className="analytics-status-meta">
                      <span className="analytics-status-label">{st.status}</span>
                      <strong className="analytics-status-num">{st.count}</strong>
                    </div>
                    <div className="analytics-track">
                      <div
                        className="analytics-fill"
                        style={{
                          width: `${st.percentage}%`,
                          backgroundColor:
                            st.status === "Resolved"
                              ? COLOR_MAP.safe
                              : st.status === "Rejected"
                              ? COLOR_MAP.neutral
                              : COLOR_MAP.warning,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* High-Risk Locations & Impact Section */}
          <div className="risk-sections-grid">
            <div className="chart-card analytics-card">
              <div className="analytics-card-title">
                <MapPin size={18} className="analytics-icon-brand" />
                <h3>Top High-Incidence Locations</h3>
              </div>

              {topLocations.length === 0 ? (
                <p className="admin-dashboard__empty-text">No location hotspots recorded.</p>
              ) : (
                <div className="analytics-location-table-wrapper">
                  <table className="admin-recent-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Location / Area</th>
                        <th>Total Reports</th>
                        <th>Critical / High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLocations.map((loc) => (
                        <tr key={loc.location}>
                          <td><strong>{loc.location}</strong></td>
                          <td>{loc.count} reports</td>
                          <td>
                            <StatusBadge tone={loc.criticalCount > 0 ? "critical" : "neutral"}>
                              {loc.criticalCount} critical
                            </StatusBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="chart-card analytics-card">
              <div className="analytics-card-title">
                <Users size={18} className="analytics-icon-brand" />
                <h3>Disaster Impact Assessment</h3>
              </div>

              <div className="analytics-impact-grid">
                <div className="analytics-impact-box">
                  <span className="analytics-impact-num">{impact?.totalPeopleAffected || 0}</span>
                  <span className="analytics-impact-lbl">Total People Impacted</span>
                </div>
                <div className="analytics-impact-box">
                  <span className="analytics-impact-num">{impact?.averagePeopleAffected || 0}</span>
                  <span className="analytics-impact-lbl">Avg Persons per Incident</span>
                </div>
                <div className="analytics-impact-box">
                  <span className="analytics-impact-num">{impact?.maxPeopleAffected || 0}</span>
                  <span className="analytics-impact-lbl">Max Single Incident Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalyticsPage;
