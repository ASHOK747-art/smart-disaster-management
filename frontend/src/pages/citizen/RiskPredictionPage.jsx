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
import { MapPin, Sparkles, CloudRain, Flame, Mountain, Wind } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getRiskPredictionData } from "../../services/predictionService";
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
          setError(err.response?.data?.message || "Failed to calculate risk prediction.");
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
      </div>
    );
  }

  const { overall, hazards, factors, trend } = predictionResult.data;

  return (
    <div className="risk-page">
      <div className="risk-page__head">
        <div>
          <h1>AI Risk Prediction</h1>
          <p>Forecasted disaster risk for your district, computed from live database analytics.</p>
        </div>
        <span className="risk-page__demo-tag" style={{ borderColor: "var(--border-default)" }}>
          <Sparkles size={13} /> Live Predictive Risk Model
        </span>
      </div>

      {/* ---- Overall risk hero ---- */}
      <div className="risk-hero">
        <div className="risk-hero__location">
          <MapPin size={16} />
          <span>{overall.areaLabel}</span>
        </div>
        <div className="risk-hero__main">
          <div>
            <span className="risk-hero__label">Overall Risk Score</span>
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

export default RiskPredictionPage;
