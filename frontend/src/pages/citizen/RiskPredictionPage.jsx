import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  MapPin,
  Sparkles,
  CloudRain,
  Flame,
  Mountain,
  Wind,
  Search,
  BrainCircuit,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  getRiskPredictionData,
  predictDistrictRisk,
} from "../../services/predictionService";
import { severityTone } from "../../utils/severity";
import "./RiskPredictionPage.css";

// Keep in sync with the status colors in styles/tokens.css — recharts needs
// literal color values, it can't resolve CSS custom properties for SVG fill.
const TONE_COLOR = {
  critical: "#e4402c",
  warning: "#f0a202",
  safe: "#1e9e6b",
  info: "#2f6690",
  neutral: "#98a2b3",
};

const HAZARD_ICONS = {
  Flood: CloudRain,
  Fire: Flame,
  Cyclone: Wind,
  Landslide: Mountain,
};

const QUICK_DISTRICTS = [
  "Patna",
  "Chennai",
  "Cuttack",
  "Murshidabad",
  "Thane",
  "Guntur",
];

const riskToneMap = {
  High: "critical",
  Medium: "warning",
  Low: "safe",
};

function RiskPredictionPage() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getRiskPredictionData()
      .then((res) => {
        if (!cancelled) {
          setPredictionResult(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load risk prediction:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to calculate risk prediction."
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Running predictive risk analysis…" />;

  if (error) {
    return (
      <div className="risk-page">
        <div className="risk-page__head">
          <h1>AI Risk Prediction</h1>
        </div>
        <p style={{ color: TONE_COLOR.critical }}>{error}</p>
      </div>
    );
  }

  if (!predictionResult || !predictionResult.hasData) {
    return (
      <div className="risk-page">
        <div className="risk-page__head">
          <div>
            <h1>AI Risk Prediction</h1>
            <p>Forecasted disaster risk for your district, based on live conditions.</p>
          </div>
        </div>
        <EmptyState
          icon={Sparkles}
          title="Insufficient Historical Data"
          message={
            predictionResult?.message ||
            "No incident records exist in MongoDB yet. Submit incident reports to enable predictive risk scoring."
          }
        />
        <CitizenDistrictPredictor />
      </div>
    );
  }

  const { overall, hazards, factors, trend } = predictionResult.data;

  return (
    <div className="risk-page">
      <div className="risk-page__head">
        <div>
          <h1>AI Risk Prediction</h1>
          <p>Forecasted disaster risk for your district, computed from live database analytics and trained ML model.</p>
        </div>
        <span className="risk-page__demo-tag" style={{ borderColor: "var(--border-default)" }}>
          <Sparkles size={13} /> Live Predictive Risk Model
        </span>
      </div>

      {/* ---- Interactive Citizen District Predictor ---- */}
      <CitizenDistrictPredictor />

      {/* ---- Overall risk hero ---- */}
      <div className="risk-hero">
        <div className="risk-hero__location">
          <MapPin size={16} />
          <span>{overall.areaLabel}</span>
        </div>
        <div className="risk-hero__main">
          <div>
            <span className="risk-hero__label">Overall System Risk Score</span>
            <span className="risk-hero__value data-text">{overall.overallCategory.toUpperCase()}</span>
          </div>
          <span className="risk-hero__percent data-text">{overall.overallRisk}%</span>
        </div>
        <div className="risk-hero__track">
          <span className="risk-hero__fill" style={{ width: `${overall.overallRisk}%` }} />
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "12px", lineHeight: "1.5" }}>
          💡 <strong>Model Explanation:</strong> {overall.explanation}
        </p>
      </div>

      <div className="risk-page__columns">
        <div className="risk-page__main">
          {/* ---- Hazard breakdown ---- */}
          <section>
            <h2>Risk by Hazard Type</h2>
            <div className="hazard-grid">
              {hazards.map((h) => {
                const Icon = HAZARD_ICONS[h.type] || CloudRain;
                const tone = severityTone(h.category);
                return (
                  <div className="hazard-card" key={h.type}>
                    <div className="hazard-card__head">
                      <span className={`hazard-card__icon hazard-card__icon--${tone}`}>
                        <Icon size={18} />
                      </span>
                      <span className="hazard-card__type">{h.type}</span>
                    </div>
                    <span className="hazard-card__percent data-text">{h.risk}%</span>
                    <StatusBadge tone={tone}>{h.category}</StatusBadge>
                    <div className="hazard-card__track">
                      <span
                        className="hazard-card__fill"
                        style={{ width: `${h.risk}%`, background: TONE_COLOR[tone] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---- Bar chart ---- */}
          <section>
            <h2>Risk Comparison</h2>
            <div className="risk-chart-card">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hazards} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#475467" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475467" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Risk"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e4e7ec", fontSize: 13 }}
                  />
                  <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                    {hazards.map((h) => (
                      <Cell key={h.type} fill={TONE_COLOR[severityTone(h.category)]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ---- Trend line ---- */}
          <section>
            <h2>7-Day Risk Trend</h2>
            <div className="risk-chart-card">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#475467" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#475467" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Risk Score"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e4e7ec", fontSize: 13 }}
                  />
                  <Line type="monotone" dataKey="risk" stroke="#c62f1c" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* ---- Contributing factors ---- */}
        <aside className="risk-page__side">
          <h2>Contributing Factors</h2>
          <div className="factor-list">
            {factors.map((f) => (
              <div className="factor-row" key={f.label}>
                <div className="factor-row__head">
                  <span>{f.label}</span>
                  <span className="data-text">{f.value}</span>
                </div>
                <div className="factor-row__track">
                  <span className="factor-row__fill" style={{ width: `${f.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Interactive Citizen District Flood Risk ML Predictor
 */
function CitizenDistrictPredictor() {
  const [districtQuery, setDistrictQuery] = useState("");
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePredict = async (targetDistrict) => {
    const query = targetDistrict || districtQuery;
    if (!query || !query.trim()) return;

    setPredicting(true);
    setError("");

    try {
      const res = await predictDistrictRisk(query.trim());
      if (res && res.success) {
        setResult(res);
      } else {
        setError(res.message || `No ML model prediction found for '${query}'.`);
      }
    } catch (err) {
      console.error("ML district prediction error:", err);
      setError(
        err.response?.data?.message ||
          `District '${query}' not found in trained dataset. Please try a valid district name like Patna, Chennai, or Cuttack.`
      );
    } finally {
      setPredicting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handlePredict();
  };

  return (
    <section className="citizen-district-section">
      <div className="citizen-district-header">
        <div className="citizen-district-title">
          <BrainCircuit size={20} color="#1c3b6b" />
          <h2>District Flood Risk ML Predictor</h2>
        </div>
        <p>Query our trained Random Forest ML model for real-time flood risk predictions across 720+ Indian districts.</p>
      </div>

      <form className="citizen-district-form" onSubmit={handleFormSubmit}>
        <div className="citizen-district-input-wrap">
          <Search size={16} className="citizen-district-search-icon" />
          <input
            type="text"
            className="citizen-district-input"
            placeholder="Enter District Name (e.g., Patna, Chennai, Cuttack...)"
            value={districtQuery}
            onChange={(e) => setDistrictQuery(e.target.value)}
            disabled={predicting}
          />
        </div>
        <button
          type="submit"
          className="citizen-district-btn"
          disabled={predicting || !districtQuery.trim()}
        >
          {predicting ? (
            <>
              <Loader2 size={15} className="spinner-icon" />
              <span>Predicting...</span>
            </>
          ) : (
            <>
              <BrainCircuit size={15} />
              <span>Predict ML Risk</span>
            </>
          )}
        </button>
      </form>

      {/* Quick district selection chips */}
      <div className="citizen-district-chips">
        <span className="citizen-chips-label">Popular Districts:</span>
        {QUICK_DISTRICTS.map((d) => (
          <button
            key={d}
            type="button"
            className="citizen-chip"
            onClick={() => {
              setDistrictQuery(d);
              handlePredict(d);
            }}
            disabled={predicting}
          >
            {d}
          </button>
        ))}
      </div>

      {error && (
        <div className="citizen-district-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ML Prediction Result Card */}
      {result && (
        <div className="citizen-district-result-card">
          <div className="citizen-result-top">
            <div>
              <h3 className="citizen-result-district">{result.district} District</h3>
              {result.state && <span className="citizen-result-state">{result.state}</span>}
            </div>
            <div className="citizen-result-badge-wrap">
              <span className="citizen-badge-label">Predicted Risk Level:</span>
              <StatusBadge tone={riskToneMap[result.riskLevel] || "info"}>
                {result.riskLevel?.toUpperCase()} RISK
              </StatusBadge>
            </div>
          </div>

          {result.probabilities && (
            <div className="citizen-result-probabilities">
              <h4>ML Probability Distribution</h4>
              <div className="citizen-prob-grid">
                <ProbabilityBar label="High Risk" percentage={result.probabilities.High} tone="critical" />
                <ProbabilityBar label="Medium Risk" percentage={result.probabilities.Medium} tone="warning" />
                <ProbabilityBar label="Low Risk" percentage={result.probabilities.Low} tone="safe" />
              </div>
            </div>
          )}

          {result.features && (
            <div className="citizen-result-features">
              <h4>Model Input Feature Values</h4>
              <div className="citizen-features-grid">
                <FeatureItem label="Percent Flooded Area" value={`${Number(result.features.percentFloodedArea ?? 0).toFixed(2)}%`} />
                <FeatureItem label="Permanent Water" value={`${Number(result.features.permanentWater ?? 0).toFixed(2)}%`} />
                <FeatureItem label="Corrected Flooded Area" value={`${Number(result.features.correctedFloodedArea ?? 0).toFixed(2)}%`} />
                <FeatureItem label="Population Impacted" value={Number(result.features.population ?? 0).toLocaleString()} />
                <FeatureItem label="Mean Flood Duration" value={`${Number(result.features.meanFloodDuration ?? 0).toFixed(1)} days`} />
                <FeatureItem label="Historical Flood Count" value={Number(result.features.historicalFloodCount ?? 0).toLocaleString()} />
                <FeatureItem label="Historical Avg Duration" value={`${Number(result.features.historicalAverageDuration ?? 0).toFixed(1)} days`} />
                <FeatureItem label="Historical Total Duration" value={`${Number(result.features.historicalTotalDuration ?? 0).toLocaleString()} days`} />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
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
    <div className="citizen-prob-item">
      <div className="citizen-prob-head">
        <span>{label}</span>
        <strong className="data-text">{val}%</strong>
      </div>
      <div className="citizen-prob-track">
        <div
          className="citizen-prob-fill"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: colorMap[tone] || "#2f6690" }}
        />
      </div>
    </div>
  );
}

function FeatureItem({ label, value }) {
  return (
    <div className="citizen-feature-item">
      <span className="citizen-feature-label">{label}</span>
      <span className="citizen-feature-value data-text">{value}</span>
    </div>
  );
}

export default RiskPredictionPage;
