import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Siren,
  ClipboardList,
  Ambulance,
  HeartHandshake,
  Building2,
  Home as HomeIcon,
  Users,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Activity,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Search,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getAdminOverview } from "../../services/adminService";
import { predictDistrictRisk } from "../../services/predictionService";
import { severityTone, statusTone } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./AdminDashboard.css";

// Keep in sync with styles/tokens.css — recharts needs literal color values,
// it can't resolve CSS custom properties for SVG fill.
const TONE_COLOR = {
  critical: "#e4402c",
  warning: "#f0a202",
  safe: "#1e9e6b",
  info: "#2f6690",
  neutral: "#98a2b3",
};

const SEVERITY_COLOR = {
  Critical: TONE_COLOR.critical,
  High: TONE_COLOR.critical,
  Medium: TONE_COLOR.warning,
  Low: TONE_COLOR.safe,
};

const PIE_COLORS = ["#0b1e3d", "#2f6690", "#6a9bc0", "#f0a202", "#e4402c"];

const axisTick = { fontSize: 12, fill: "#475467" };
const tooltipStyle = { borderRadius: 10, border: "1px solid #e4e7ec", fontSize: 13 };

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    getAdminOverview()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error("Failed to load admin analytics:", err);
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load dashboard analytics.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__head">
          <h1>District Overview</h1>
        </div>
        <p style={{ color: TONE_COLOR.critical }}>{error}</p>
      </div>
    );
  }

  if (!data) return <LoadingSpinner label="Loading district analytics…" />;

  const { statistics, incidentsOverTime, disasterTypes, severityDistribution, recentIncidents, rescueResponseTime, hospitalCapacity, shelterOccupancy } = data;
  const byStatus = statistics.byStatus || {};

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__head">
        <h1>District Overview</h1>
        <p>Real-time snapshot of disasters, response resources, and impact.</p>
      </div>

      {/* ---- Main statistics ---- */}
      <div className="admin-stat-grid">
        <StatCard icon={Siren} label="Total Incidents" value={statistics.totalIncidents ?? 0} tone="neutral" />
        <StatCard icon={ClipboardList} label="Active Incidents" value={statistics.activeIncidents ?? 0} tone="warning" />
        <StatCard icon={AlertTriangle} label="Critical / High" value={statistics.criticalActive ?? 0} tone="critical" />
        <StatCard icon={Clock} label="Pending" value={byStatus["Pending"] ?? 0} tone="warning" />
        <StatCard icon={ShieldCheck} label="Verified" value={byStatus["Verified"] ?? 0} tone="info" />
        <StatCard icon={Activity} label="In Progress" value={byStatus["In Progress"] ?? 0} tone="warning" />
        <StatCard icon={CheckCircle2} label="Resolved" value={byStatus["Resolved"] ?? 0} tone="safe" />
        <StatCard icon={XCircle} label="Rejected" value={byStatus["Rejected"] ?? 0} tone="neutral" />
        <StatCard icon={Ambulance} label="Rescue Teams" value={statistics.rescueTeams} tone="info" />
        <StatCard icon={HeartHandshake} label="Volunteers" value={statistics.volunteers} tone="info" />
        <StatCard icon={Building2} label="Hospitals" value={statistics.hospitals} tone="safe" />
        <StatCard icon={HomeIcon} label="Shelters" value={statistics.shelters} tone="safe" />
        <StatCard icon={Users} label="People Affected" value={statistics.peopleAffected} tone="neutral" />
      </div>

      {/* ---- Charts grid ---- */}
      <div className="admin-chart-grid">
        <ChartCard title="Incidents Over Time" span={2}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={incidentsOverTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" name="Incidents" stroke={TONE_COLOR.critical} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Disaster Types">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={disasterTypes}
                dataKey="count"
                nameKey="type"
                cx="38%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                isAnimationActive={false}
              >
                {disasterTypes.map((d, i) => (
                  <Cell key={d.type} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Incident Severity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={severityDistribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
              <XAxis dataKey="severity" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
                {severityDistribution.map((s) => (
                  <Cell key={s.severity} fill={SEVERITY_COLOR[s.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ML District Flood Risk Prediction" span={2}>
          <DistrictPredictionSection />
        </ChartCard>

        <ChartCard title="Recent Incidents" span={2}>
          {recentIncidents && recentIncidents.length > 0 ? (
            <div className="admin-recent-table-wrapper">
              <table className="admin-recent-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIncidents.map((inc) => (
                    <tr key={inc.id || inc._id}>
                      <td><strong>{inc.type}</strong></td>
                      <td>{inc.location}</td>
                      <td>
                        <StatusBadge tone={severityTone(inc.severity)}>{inc.severity}</StatusBadge>
                      </td>
                      <td>
                        <StatusBadge tone={statusTone(inc.status)}>{inc.status}</StatusBadge>
                      </td>
                      <td>{timeAgo(inc.reportedAt || inc.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-dashboard__empty-text">No recent incidents recorded.</p>
          )}
        </ChartCard>

        <ChartCard title="Rescue Response Time (avg min)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rescueResponseTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
              <XAxis dataKey="team" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="avgMinutes" name="Avg minutes" fill={TONE_COLOR.info} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hospital Capacity (beds free)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hospitalCapacity} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="availableBeds" name="Beds free" fill={TONE_COLOR.safe} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Shelter Occupancy (%)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={shelterOccupancy} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={axisTick} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Occupied"]} />
              <Bar dataKey="occupancyPct" name="Occupied" radius={[0, 6, 6, 0]}>
                {shelterOccupancy.map((s) => (
                  <Cell key={s.name} fill={s.occupancyPct >= 90 ? TONE_COLOR.critical : s.occupancyPct >= 70 ? TONE_COLOR.warning : TONE_COLOR.safe} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, span = 1, children }) {
  return (
    <div className="chart-card" style={{ gridColumn: `span ${span}` }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function DistrictPredictionSection() {
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    const trimmed = district.trim();
    if (!trimmed) {
      setError("Please enter or select a district name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await predictDistrictRisk(trimmed);
      if (res && res.success) {
        setResult(res);
      } else {
        setError(res?.message || "Failed to analyze district flood risk.");
      }
    } catch (err) {
      console.error("District prediction error:", err);
      setError(err.response?.data?.message || "District analysis request failed. Please check the district name and network connection.");
    } finally {
      setLoading(false);
    }
  };

  const riskToneMap = {
    High: "critical",
    Medium: "warning",
    Low: "safe",
  };

  return (
    <div className="district-prediction-section">
      <form className="district-prediction-form" onSubmit={handleAnalyze}>
        <div className="district-prediction-input-group">
          <input
            type="text"
            className="district-prediction-input"
            placeholder="Enter district name (e.g. Kota)"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className="district-prediction-btn"
            disabled={loading || !district.trim()}
          >
            <Search size={15} />
            {loading ? "Analyzing..." : "Analyze District Risk"}
          </button>
        </div>
      </form>

      {error && <div className="district-prediction-error">{error}</div>}

      {!result && !error && !loading && (
        <div className="district-prediction-placeholder">
          <BrainCircuit size={28} className="district-prediction-placeholder-icon" />
          <p>Select or enter a district above and click <strong>Analyze District Risk</strong> to run ML prediction.</p>
        </div>
      )}

      {result && (
        <div className="district-prediction-results">
          <div className="district-prediction-header">
            <div className="district-prediction-meta">
              <h4>{result.district}</h4>
              {result.state && <span className="district-prediction-state">{result.state}</span>}
            </div>
            <div className="district-prediction-badge-wrapper">
              <span className="district-prediction-label">Risk Level:</span>
              <StatusBadge tone={riskToneMap[result.riskLevel] || "info"}>
                {result.riskLevel?.toUpperCase()}
              </StatusBadge>
            </div>
          </div>

          {result.probabilities && (
            <div className="district-prediction-probabilities">
              <h5>Probability Breakdown</h5>
              <div className="district-prob-grid">
                <ProbabilityBar label="High Risk" percentage={result.probabilities.High} tone="critical" />
                <ProbabilityBar label="Medium Risk" percentage={result.probabilities.Medium} tone="warning" />
                <ProbabilityBar label="Low Risk" percentage={result.probabilities.Low} tone="safe" />
              </div>
            </div>
          )}

          {result.features && (
            <div className="district-prediction-features">
              <h5>Model Feature Breakdown</h5>
              <div className="district-features-grid">
                <FeatureCard label="Percent Flooded Area" value={`${Number(result.features.percentFloodedArea ?? 0).toFixed(2)}%`} />
                <FeatureCard label="Permanent Water" value={`${Number(result.features.permanentWater ?? 0).toFixed(2)}%`} />
                <FeatureCard label="Corrected Flooded Area" value={`${Number(result.features.correctedFloodedArea ?? 0).toFixed(2)}%`} />
                <FeatureCard label="Population Impacted" value={Number(result.features.population ?? 0).toLocaleString()} />
                <FeatureCard label="Mean Flood Duration" value={`${Number(result.features.meanFloodDuration ?? 0).toFixed(1)} days`} />
                <FeatureCard label="Historical Flood Count" value={Number(result.features.historicalFloodCount ?? 0).toLocaleString()} />
                <FeatureCard label="Historical Avg Duration" value={`${Number(result.features.historicalAverageDuration ?? 0).toFixed(1)} days`} />
                <FeatureCard label="Historical Total Duration" value={`${Number(result.features.historicalTotalDuration ?? 0).toLocaleString()} days`} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProbabilityBar({ label, percentage = 0, tone }) {
  const val = Number(percentage ?? 0).toFixed(2);
  const colorMap = {
    critical: "#e4402c",
    warning: "#f0a202",
    safe: "#1e9e6b",
  };

  return (
    <div className="district-prob-item">
      <div className="district-prob-head">
        <span>{label}</span>
        <strong className="data-text">{val}%</strong>
      </div>
      <div className="district-prob-track">
        <div
          className="district-prob-fill"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: colorMap[tone] || "#2f6690" }}
        />
      </div>
    </div>
  );
}

function FeatureCard({ label, value }) {
  return (
    <div className="district-feature-item">
      <span className="district-feature-label">{label}</span>
      <span className="district-feature-value data-text">{value}</span>
    </div>
  );
}

export default AdminDashboard;