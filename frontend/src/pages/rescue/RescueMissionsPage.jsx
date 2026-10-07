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
  RefreshCw,
  Search,
  Filter,
  Eye,
  Check,
  ShieldCheck,
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
import "./RescueMissionsPage.css";

const RESCUE_STATUS_OPTIONS = [
  "Verified",
  "In Progress",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
];

const SEVERITY_FILTERS = ["All", "Critical", "High", "Medium", "Low"];

const STATUS_FILTERS = [
  "All",
  "Active Only",
  "Rescue Assigned",
  "Rescue In Progress",
  "In Progress",
  "Verified",
  "Resolved",
];

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function RescueMissionsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active Only");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssignedIncidents();
      setIncidents(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("Failed to load rescue missions:", err);
      setError("Failed to fetch assigned rescue missions from database. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMission(null);
  };

  const openMissionModal = (mission) => {
    setSelectedMission(mission);
    setModalOpen(true);
  };

  const handleUpdate = async (id, status, extra = {}) => {
    try {
      setUpdatingId(id);
      const updated = await updateIncidentStatus(id, status, extra);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedMission && selectedMission.id === id) {
        setSelectedMission(updated);
      }
    } catch (err) {
      console.error("Failed to update incident:", err);
      alert(err.response?.data?.message || "Failed to update mission status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading assigned rescue missions..." />;

  // Computed Real Metrics
  const isInactive = (st) => ["Resolved", "Rejected"].includes(st);
  const activeMissions = incidents.filter((i) => !isInactive(i.status));
  const criticalMissions = activeMissions.filter((i) => i.severity === "Critical");
  const highMissions = activeMissions.filter((i) => i.severity === "High");
  const resolvedMissions = incidents.filter((i) => i.status === "Resolved");

  // Filtering
  const filtered = incidents.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (item.type || "").toLowerCase().includes(q) ||
      (item.location || "").toLowerCase().includes(q) ||
      (item.id || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q);

    const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;

    let matchesStatus = true;
    if (statusFilter === "Active Only") {
      matchesStatus = !isInactive(item.status);
    } else if (statusFilter !== "All") {
      matchesStatus = item.status === statusFilter;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="rescue-page missions-page">
      {/* Header */}
      <div className="admin-dashboard__head missions-head">
        <div>
          <div className="missions-head-title-row">
            <h1>Missions</h1>
            <StatusBadge tone="warning">Rescue Team Ops</StatusBadge>
          </div>
          <p>View and manage active emergency response missions assigned to your rescue squad.</p>
        </div>

        <div className="missions-head-actions">
          {lastUpdated && (
            <span className="missions-last-updated">
              <Clock size={13} /> Updated {timeAgo(lastUpdated)}
            </span>
          )}
          <button className="disaster-map-error__retry" onClick={loadMissions} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Refresh Missions
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={Ambulance} label="Active Missions" value={activeMissions.length} tone="warning" />
        <StatCard icon={AlertTriangle} label="Critical Missions" value={criticalMissions.length} tone="critical" />
        <StatCard icon={ShieldCheck} label="High Priority" value={highMissions.length} tone="critical" />
        <StatCard icon={CheckCircle2} label="Resolved Missions" value={resolvedMissions.length} tone="safe" />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="missions-filter-toolbar">
        <div className="missions-search-box">
          <Search size={16} className="missions-search-icon" />
          <input
            type="text"
            placeholder="Search mission ID, hazard type, location, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="missions-search-input"
          />
        </div>

        <div className="missions-select-group">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="missions-select"
          >
            <option value="All">Severity: All</option>
            {SEVERITY_FILTERS.filter((s) => s !== "All").map((s) => (
              <option key={s} value={s}>Severity: {s}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="missions-select"
          >
            <option value="Active Only">Filter: Active Missions Only</option>
            <option value="All">Filter: All Statuses</option>
            {STATUS_FILTERS.filter((st) => !["All", "Active Only"].includes(st)).map((st) => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="missions-error-box">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button className="disaster-map-error__retry" onClick={loadMissions}>
            Retry
          </button>
        </div>
      )}

      {/* Missions List */}
      {!error && filtered.length === 0 ? (
        <div className="missions-nodata-card">
          <EmptyState
            icon={Ambulance}
            title="No Missions Found"
            message={
              incidents.length === 0
                ? "No emergency rescue missions have been assigned to your team yet."
                : "No assigned missions match your current filter criteria."
            }
          />
        </div>
      ) : (
        <div className="rescue-dashboard__list">
          {filtered.map((incident) => (
            <MissionCardItem
              key={incident.id}
              incident={incident}
              onView={openMissionModal}
              onUpdate={handleUpdate}
              updating={updatingId === incident.id}
            />
          ))}
        </div>
      )}

      {/* Mission Detail Modal */}
      {modalOpen && selectedMission && (
        <Modal open={modalOpen} onClose={closeModal} title={`Mission ${selectedMission.id}: ${selectedMission.type}`}>
          <MissionDetailModalContent
            incident={selectedMission}
            onUpdate={handleUpdate}
            updating={updatingId === selectedMission.id}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

function MissionCardItem({ incident, onView, onUpdate, updating }) {
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
        <button className="mission-card__action mission-card__action--primary" onClick={() => onView(incident)}>
          <Eye size={13} /> View Mission Details
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
              Update: {st}
            </option>
          ))}
        </select>

        {hasCoords && (
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="mission-card__action">
            <Navigation size={13} /> Navigate (GPS)
          </a>
        )}
      </div>
    </article>
  );
}

function MissionDetailModalContent({ incident, onUpdate, updating, onClose }) {
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

          {incident.damageAssessment && (
            <div style={{ marginTop: "12px", padding: "10px 12px", background: "var(--bg-subtle, #f9fafb)", borderRadius: "8px", border: "1px solid var(--border-default, #e4e7ec)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <strong style={{ fontSize: "13px" }}>🤖 AI Scene Assessment</strong>
                <StatusBadge tone={severityTone(incident.damageAssessment.severity)}>
                  {incident.damageAssessment.category}
                </StatusBadge>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "12px" }}>
                <span><strong>Confidence:</strong> {incident.damageAssessment.confidence}%</span>
                <span><strong>Severity:</strong> {incident.damageAssessment.severity}</span>
              </div>
            </div>
          )}
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
        <span><MapPin size={14} /> Location: {location}</span>
        <span><Users size={14} /> Affected: {peopleAffected} persons</span>
        <span><Clock size={14} /> Reported: {timeAgo(reportedAt)}</span>
      </div>

      {reporter && (
        <div className="mission-detail__section">
          <h4>Citizen Reporter</h4>
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
        <h4>Rescue Squad Identifier</h4>
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
          onClick={async () => {
            await onUpdate(id, statusInput, { assignedTeam: teamInput });
            onClose();
          }}
        >
          {updating ? "Saving…" : "Save Mission Status"}
        </Button>
      </div>
    </div>
  );
}

export default RescueMissionsPage;
