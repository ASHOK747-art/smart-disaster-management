import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import {
  Ambulance,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Users,
  Navigation,
  Phone,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getAssignedIncidents, updateIncidentStatus } from "../../services/incidentService";
import { INCIDENT_STAGES } from "../../data/mockIncidents";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "leaflet/dist/leaflet.css";
import "./RescueDashboard.css";

const FILTERS = ["All", ...INCIDENT_STAGES];

// Statuses a rescue user is allowed to move an incident to.
const RESCUE_STATUS_OPTIONS = [
  "Verified",
  "In Progress",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
];

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function RescueDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      setLoading(true);
      const data = await getAssignedIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id, status, extra = {}) {
    try {
      setUpdatingId(id);
      const updated = await updateIncidentStatus(id, status, extra);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      setSelected((prev) => (prev && prev.id === id ? updated : prev));
    } catch (err) {
      console.error("Failed to update incident:", err);
      alert(err.response?.data?.message || "Failed to update incident.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading active incidents…" />;

  const pendingCount = incidents.filter((i) => ["Pending", "Reported"].includes(i.status)).length;
  const activeCount = incidents.filter((i) =>
    ["Verified", "In Progress", "Rescue Assigned", "Rescue In Progress"].includes(i.status)
  ).length;
  const completedCount = incidents.filter((i) => i.status === "Resolved").length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "Critical" && i.status !== "Resolved"
  ).length;

  const filtered = filter === "All" ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <div className="rescue-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ marginBottom: "4px" }}>My Assigned Incidents</h2>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
            Incidents an admin has assigned to you for response.
          </p>
        </div>
        <Button variant="outline" onClick={loadIncidents}>
          Refresh
        </Button>
      </div>

      <div className="stat-grid">
        <StatCard icon={Ambulance} label="Active Incidents" value={activeCount} tone="warning" />
        <StatCard icon={Clock} label="Pending Requests" value={pendingCount} tone="info" />
        <StatCard icon={CheckCircle2} label="Resolved" value={completedCount} tone="safe" />
        <StatCard icon={AlertTriangle} label="Critical Incidents" value={criticalCount} tone="critical" />
      </div>

      <div className="rescue-dashboard__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`rescue-dashboard__filter ${filter === f ? "rescue-dashboard__filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Ambulance}
          title="No incidents here"
          message={
            incidents.length === 0
              ? "No incidents have been assigned to you yet."
              : "No incidents match this filter right now."
          }
        />
      ) : (
        <div className="rescue-dashboard__list">
          {filtered.map((incident) => (
            <IncidentMissionCard
              key={incident.id}
              incident={incident}
              onView={setSelected}
              onUpdate={handleUpdate}
              updating={updatingId === incident.id}
            />
          ))}
        </div>
      )}

      {selected && (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <IncidentMissionDetail incident={selected} onUpdate={handleUpdate} updating={updatingId === selected.id} />
        </Modal>
      )}
    </div>
  );
}

function IncidentMissionCard({ incident, onView, onUpdate, updating }) {
  const { id, type, severity, status, location, peopleAffected, reportedAt, latitude, longitude, assignedTeam } =
    incident;
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <article className="mission-card">
      <div className="mission-card__head">
        <div>
          <span className="mission-card__id data-text">{id}</span>
          <h3>{type}</h3>
        </div>
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>
          {status}
        </StatusBadge>
      </div>

      <div className="mission-card__meta">
        <span><MapPin size={13} /> {location}</span>
        <span><Users size={13} /> {peopleAffected} affected</span>
        <span><Clock size={13} /> {timeAgo(reportedAt)}</span>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
        {assignedTeam && <span className="data-text">Team {assignedTeam}</span>}
      </div>

      <div className="mission-card__actions">
        <button className="mission-card__action" onClick={() => onView(incident)}>
          View
        </button>
        <select
          className="mission-card__action"
          value={RESCUE_STATUS_OPTIONS.includes(status) ? status : ""}
          disabled={updating}
          onChange={(e) => onUpdate(id, e.target.value)}
          style={{ cursor: "pointer" }}
        >
          {!RESCUE_STATUS_OPTIONS.includes(status) && (
            <option value="" disabled>
              {status}
            </option>
          )}
          {RESCUE_STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
        {hasCoords && (
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="mission-card__action">
            <Navigation size={13} /> Navigate
          </a>
        )}
      </div>
    </article>
  );
}

function IncidentMissionDetail({ incident, onUpdate, updating }) {
  const {
    id,
    type,
    severity,
    status,
    description,
    location,
    peopleAffected,
    reportedAt,
    reporter,
    assignedTeam,
    latitude,
    longitude,
    images,
  } = incident;

  const [teamInput, setTeamInput] = useState(assignedTeam || "");
  const [statusInput, setStatusInput] = useState(
    RESCUE_STATUS_OPTIONS.includes(status) ? status : RESCUE_STATUS_OPTIONS[0]
  );
  const currentIndex = INCIDENT_STAGES.indexOf(status);
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";

  return (
    <div className="mission-detail">
      <div className="mission-detail__badges">
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>{status}</StatusBadge>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>

      <h3>{type}</h3>
      <p className="mission-detail__desc">{description}</p>

      {images && images.length > 0 && (
        <div className="mission-detail__section">
          <h4>Scene Photos</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <a key={idx} href={getImageUrl(img)} target="_blank" rel="noreferrer">
                <img
                  src={getImageUrl(img)}
                  alt="Scene"
                  style={{ maxHeight: "140px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-default, #e4e7ec)" }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {hasCoords && (
        <div className="mission-detail__map">
          <MapContainer
            center={[latitude, longitude]}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: "160px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} />
          </MapContainer>
        </div>
      )}

      <div className="mission-detail__meta">
        <span><MapPin size={14} /> {location}</span>
        <span><Users size={14} /> {peopleAffected} affected</span>
        <span><Clock size={14} /> Reported {timeAgo(reportedAt)}</span>
      </div>

      {reporter && (
        <div className="mission-detail__section">
          <h4>Citizen Information</h4>
          <div className="mission-detail__citizen">
            <span>{reporter.fullName}</span>
            {reporter.phone && (
              <a href={`tel:${reporter.phone.replace(/\s+/g, "")}`}>
                <Phone size={13} /> {reporter.phone}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mission-detail__section">
        <h4>Assign / Update Rescue Team</h4>
        <input
          type="text"
          value={teamInput}
          onChange={(e) => setTeamInput(e.target.value)}
          placeholder="e.g. RT-104"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-default, #e4e7ec)",
            fontSize: "14px",
          }}
        />
      </div>

      <div className="mission-detail__timeline">
        {INCIDENT_STAGES.map((stage, i) => (
          <div
            key={stage}
            className={`mission-detail__step ${i <= currentIndex ? "mission-detail__step--done" : ""} ${
              i === currentIndex ? "mission-detail__step--current" : ""
            }`}
          >
            <span className="mission-detail__dot" />
            <span>{stage}</span>
          </div>
        ))}
      </div>

      <div className="mission-detail__section" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <select
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-default, #e4e7ec)" }}
        >
          {RESCUE_STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          size="md"
          disabled={updating}
          onClick={() => onUpdate(id, statusInput, { assignedTeam: teamInput })}
        >
          {updating ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default RescueDashboard;