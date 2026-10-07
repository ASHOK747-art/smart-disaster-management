import { useEffect, useState } from "react";
import {
  BrainCircuit,
  RefreshCw,
  AlertTriangle,
  Activity,
  Flame,
  Droplets,
  Wind,
  Zap,
  Clock,
  ShieldAlert,
  Layers,
  TrendingUp,
  Info,
  CheckCircle2,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getRiskPredictionData } from "../../services/predictionService";
import { timeAgo } from "../../utils/formatTime";
import "./AdminDashboard.css";
import "./AdminRiskMonitoringPage.css";

const CATEGORY_COLOR = {
  Critical: "#e4402c",
  High: "#e4402c",
  Medium: "#f0a202",
  Low: "#1e9e6b",
};

function getCategoryTone(category) {
  if (!category) return "neutral";
  const cat = String(category).toLowerCase();
  if (cat === "critical" || cat === "high") return "critical";
  if (cat === "medium") return "warning";
  if (cat === "low") return "safe";
  return "info";
}

function getHazardIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("fire")) return Flame;
  if (t.includes("flood") || t.includes("water")) return Droplets;
  if (t.includes("storm") || t.includes("wind") || t.includes("cyclone")) return Wind;
  if (t.includes("power") || t.includes("electric")) return Zap;
  return Activity;
}

function AdminRiskMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [riskData, setRiskData] = useState(null);

  const fetchRiskData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRiskPredictionData();
      setRiskData(res);
    } catch (err) {
      console.error("Failed to load risk prediction data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch predictive risk monitoring data. Please check server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading predictive risk monitoring intelligence..." />;
  }

  const hasData = Boolean(riskData && riskData.hasData && riskData.data);
  const overall = riskData?.data?.overall;
  const hazards = riskData?.data?.hazards || [];
  const factors = riskData?.data?.factors || [];
  const trend = riskData?.data?.trend || [];

  const maxHazard = hazards.reduce(
    (prev, current) => ((current.risk || 0) > (prev.risk || 0) ? current : prev),
    { risk: 0, type: "None", category: "Low" }
  );

  return (
    <div className="admin-page risk-monitoring-page">
      {/* Header */}
      <div className="admin-dashboard__head risk-monitoring-head">
        <div>
          <div className="risk-monitoring-title-row">
            <h1>Risk Monitoring</h1>
            <StatusBadge tone="info">ML Predictive Intelligence</StatusBadge>
          </div>
          <p>
            Monitor live disaster risk levels, predictive hazard indicators, and key vulnerability metrics across the district.
          </p>
        </div>

        <div className="risk-monitoring-actions">
          {overall?.lastUpdated && (
            <span className="risk-last-updated">
              <Clock size={13} /> Updated {timeAgo(overall.lastUpdated)}
            </span>
          )}
          <button
            className="disaster-map-error__retry"
            onClick={fetchRiskData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="risk-monitoring-error-box">
          <AlertTriangle size={18} />
          <div className="risk-monitoring-error-content">
            <strong>Unable to Load Risk Intelligence</strong>
            <p>{error}</p>
          </div>
          <button className="disaster-map-error__retry" onClick={fetchRiskData}>
            Retry Connection
          </button>
        </div>
      )}

      {/* No Data State */}
      {!error && !hasData && (
        <div className="risk-monitoring-nodata-card">
          <EmptyState
            icon={BrainCircuit}
            title="No Risk Data Available"
            message={
              riskData?.message ||
              "Insufficient historical incident data in database to calculate predictive risk scores."
            }
          />
          {riskData?.missingData && (
            <div className="risk-monitoring-nodata-detail">
              <Info size={15} />
              <span>{riskData.missingData}</span>
            </div>
          )}
        </div>
      )}

      {/* Normal Data State */}
      {!error && hasData && (
        <div className="risk-monitoring-content">
          {/* Top Summary Stat Grid */}
          <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
            <StatCard
              icon={BrainCircuit}
              label="Overall District Risk"
              value={`${overall?.overallRisk || 0} / 100`}
              tone={getCategoryTone(overall?.overallCategory)}
            />
            <StatCard
              icon={ShieldAlert}
              label="Risk Classification"
              value={overall?.overallCategory || "N/A"}
              tone={getCategoryTone(overall?.overallCategory)}
            />
            <StatCard
              icon={Layers}
              label="Monitored Hazards"
              value={hazards.length}
              tone="info"
            />
            <StatCard
              icon={Flame}
              label="Highest Risk Hazard"
              value={maxHazard.type}
              tone={getCategoryTone(maxHazard.category)}
            />
            <StatCard
              icon={Activity}
              label="Key Risk Factors"
              value={factors.length}
              tone="neutral"
            />
          </div>

          {/* Overall Disaster Risk Featured Banner */}
          <div className="risk-overall-card">
            <div className="risk-overall-header">
              <div className="risk-overall-badge">
                <BrainCircuit size={20} />
                <span>{overall?.areaLabel || "District Command Center"}</span>
              </div>
              <StatusBadge tone={getCategoryTone(overall?.overallCategory)}>
                {overall?.overallCategory?.toUpperCase()} RISK
              </StatusBadge>
            </div>

            <div className="risk-overall-body">
              <div className="risk-overall-score-section">
                <div className="risk-overall-score-display">
                  <span
                    className="risk-overall-number"
                    style={{ color: CATEGORY_COLOR[overall?.overallCategory] || "#1c3b6b" }}
                  >
                    {overall?.overallRisk || 0}
                  </span>
                  <span className="risk-overall-denom">/ 100</span>
                </div>
                <div className="risk-overall-gauge-track">
                  <div
                    className="risk-overall-gauge-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, overall?.overallRisk || 0))}%`,
                      backgroundColor: CATEGORY_COLOR[overall?.overallCategory] || "#2f6690",
                    }}
                  />
                </div>
              </div>

              <div className="risk-overall-explanation">
                <h4>Predictive Assessment Summary</h4>
                <p>{overall?.explanation}</p>
              </div>
            </div>
          </div>

          {/* Grid: Hazard Risk & Risk Factors */}
          <div className="risk-sections-grid">
            {/* Hazard Risk Section */}
            <div className="chart-card risk-card">
              <div className="risk-card-title-bar">
                <Layers size={18} className="risk-card-icon" />
                <h3>Hazard Risk Breakdown</h3>
              </div>

              <div className="risk-hazards-list">
                {hazards.map((h) => {
                  const IconComponent = getHazardIcon(h.type);
                  const tone = getCategoryTone(h.category);
                  const color = CATEGORY_COLOR[h.category] || "#2f6690";
                  return (
                    <div key={h.type} className="risk-hazard-item">
                      <div className="risk-hazard-head">
                        <div className="risk-hazard-meta">
                          <span className="risk-hazard-icon" style={{ color }}>
                            <IconComponent size={16} />
                          </span>
                          <span className="risk-hazard-name">{h.type}</span>
                          <StatusBadge tone={tone}>{h.category}</StatusBadge>
                        </div>

                        <div className="risk-hazard-score-info">
                          <span className="risk-hazard-count">{h.incidentCount} incidents</span>
                          <strong className="risk-hazard-score" style={{ color }}>
                            {h.risk} / 100
                          </strong>
                        </div>
                      </div>

                      <div className="risk-progress-track">
                        <div
                          className="risk-progress-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, h.risk))}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Factors Section */}
            <div className="chart-card risk-card">
              <div className="risk-card-title-bar">
                <Activity size={18} className="risk-card-icon" />
                <h3>Predictive Risk Factors & Weighting</h3>
              </div>

              <div className="risk-factors-list">
                {factors.map((f, idx) => {
                  const weightVal = Math.min(100, Math.max(0, f.weight || 0));
                  return (
                    <div key={f.label || idx} className="risk-factor-item">
                      <div className="risk-factor-head">
                        <div>
                          <div className="risk-factor-label">{f.label}</div>
                          <div className="risk-factor-value">{f.value}</div>
                        </div>
                        <span className="risk-factor-weight">{weightVal}% weight</span>
                      </div>

                      <div className="risk-progress-track">
                        <div
                          className="risk-progress-fill"
                          style={{
                            width: `${weightVal}%`,
                            backgroundColor: "#2f6690",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7-Day Risk Trend Chart */}
          <div className="chart-card risk-card risk-trend-card">
            <div className="risk-card-title-bar">
              <TrendingUp size={18} className="risk-card-icon" />
              <div>
                <h3>7-Day Disaster Risk Trend</h3>
                <span className="risk-card-subtitle">
                  Daily risk score trajectory calculated from incident frequency and reported severity
                </span>
              </div>
            </div>

            {trend.length === 0 ? (
              <p className="admin-dashboard__empty-text">No 7-day risk trend data recorded.</p>
            ) : (
              <div className="risk-trend-chart-wrapper">
                <div className="risk-trend-chart-grid">
                  {trend.map((t, idx) => {
                    const score = t.risk || 0;
                    const tone =
                      score >= 75
                        ? "critical"
                        : score >= 50
                        ? "warning"
                        : score >= 25
                        ? "safe"
                        : "info";
                    const color = CATEGORY_COLOR[score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Medium" : "Low"] || "#2f6690";

                    return (
                      <div key={t.day || idx} className="risk-trend-column">
                        <span className="risk-trend-score-badge" style={{ color }}>
                          {score}
                        </span>

                        <div className="risk-trend-bar-track">
                          <div
                            className="risk-trend-bar-fill"
                            style={{
                              height: `${Math.min(100, Math.max(12, score))}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>

                        <span className="risk-trend-count-tag">{t.count} inc</span>
                        <strong className="risk-trend-day-label">{t.day}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRiskMonitoringPage;
