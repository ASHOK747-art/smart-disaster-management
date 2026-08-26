import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  FileText,
  Ambulance,
  Home as HomeIcon,
  Building2,
  Siren,
  MapPin,
  Map as MapIcon,
  CloudRain,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import AlertCard from "../../components/common/AlertCard";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getActiveAlerts, getRiskSummary } from "../../services/disasterService";
import { getMyIncidents } from "../../services/incidentService";
import "./CitizenDashboard.css";

function CitizenDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [risk, setRisk] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getActiveAlerts(), getRiskSummary(), getMyIncidents()]).then(
      ([alertsRes, riskRes, incidentsRes]) => {
        if (cancelled) return;
        setAlerts(alertsRes);
        setRisk(riskRes);
        setIncidents(incidentsRes);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />;

  const activeCount = alerts.filter((a) => a.status === "Active").length;
  const myReportsCount = incidents.length;
  const activeRescueCount = incidents.filter((i) =>
    ["Rescue Assigned", "Rescue In Progress"].includes(i.status)
  ).length;

  return (
    <div className="citizen-dashboard">
      {/* ---- Risk banner ---- */}
      <div className="risk-banner">
        <div className="risk-banner__location">
          <MapPin size={16} />
          <span>{risk.areaLabel}</span>
        </div>
        <div className="risk-banner__main">
          <div>
            <span className="risk-banner__label">Your Area Risk Level</span>
            <span className="risk-banner__value data-text">{risk.overallCategory.toUpperCase()}</span>
          </div>
          <div className="risk-banner__weather">
            <CloudRain size={16} />
            <span>{risk.weather}</span>
          </div>
        </div>
        <div className="risk-banner__track">
          <span className="risk-banner__fill" style={{ width: `${risk.overallRisk}%` }} />
        </div>
      </div>

      {/* ---- Stat cards ---- */}
      <div className="stat-grid">
        <StatCard icon={Bell} label="Active Alerts" value={activeCount} tone="critical" />
        <StatCard icon={FileText} label="My Reports" value={myReportsCount} tone="info" />
        <StatCard icon={Ambulance} label="Rescue Requests" value={activeRescueCount} tone="warning" />
        <StatCard icon={HomeIcon} label="Nearby Shelters" value={3} tone="safe" />
        <StatCard icon={Building2} label="Nearby Hospitals" value={4} tone="safe" />
      </div>

      <div className="citizen-dashboard__columns">
        {/* ---- Disaster alerts feed ---- */}
        <section className="citizen-dashboard__main">
          <div className="section-head">
            <h2>Disaster Alerts</h2>
            <Link to="/citizen/alerts" className="section-head__link">View all</Link>
          </div>

          {alerts.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts right now" message="You'll see disaster alerts for your area here." />
          ) : (
            <div className="alert-list">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </section>

        {/* ---- Quick actions ---- */}
        <aside className="citizen-dashboard__side">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Button as={Link} to="/report-emergency" variant="critical" size="lg" icon={Siren} fullWidth>
              Report Emergency
            </Button>
            <Button as={Link} to="/citizen/my-reports" variant="outline" size="lg" icon={Ambulance} fullWidth>
              Request Rescue
            </Button>
            <Button as={Link} to="/citizen/shelters" variant="outline" size="lg" icon={HomeIcon} fullWidth>
              Find Shelter
            </Button>
            <Button as={Link} to="/citizen/hospitals" variant="outline" size="lg" icon={Building2} fullWidth>
              Find Hospital
            </Button>
            <Button as={Link} to="/disaster-map" variant="outline" size="lg" icon={MapIcon} fullWidth>
              View Map
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CitizenDashboard;
