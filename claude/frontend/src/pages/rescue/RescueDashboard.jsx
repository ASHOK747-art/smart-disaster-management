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
  Boxes,
  Building2,
  Home as HomeIcon,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getMissions, updateMissionStatus } from "../../services/rescueService";
import { MISSION_STAGES } from "../../data/mockMissions";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "leaflet/dist/leaflet.css";
import "./RescueDashboard.css";

const FILTERS = ["All", ...MISSION_STAGES];

function RescueDashboard() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMissions().then((res) => {
      if (cancelled) return;
      setMissions(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your missions…" />;

  async function handleAccept(mission) {
    const updated = await updateMissionStatus(mission.id, "Accepted");
    setMissions((prev) => prev.map((m) => (m.id === mission.id ? updated : m)));
  }

  async function handleAdvance(mission) {
    const currentIndex = MISSION_STAGES.indexOf(mission.status);
    const next = MISSION_STAGES[currentIndex + 1];
    if (!next) return;
    const updated = await updateMissionStatus(mission.id, next);
    setMissions((prev) => prev.map((m) => (m.id === mission.id ? updated : m)));
    setSelected((prev) => (prev && prev.id === mission.id ? updated : prev));
  }

  const pendingCount = missions.filter((m) => m.status === "Assigned").length;
  const activeCount = missions.filter((m) => ["Accepted", "En Route", "On Scene"].includes(m.status)).length;
  const completedCount = missions.filter((m) => m.status === "Rescue Completed").length;
  const criticalCount = missions.filter(
    (m) => m.severity === "Critical" && m.status !== "Rescue Completed"
  ).length;

  const filtered = filter === "All" ? missions : missions.filter((m) => m.status === filter);

  return (
    <div className="rescue-dashboard">
      <div className="stat-grid">
        <StatCard icon={Ambulance} label="Active Missions" value={activeCount} tone="warning" />
        <StatCard icon={Clock} label="Pending Requests" value={pendingCount} tone="info" />
        <StatCard icon={CheckCircle2} label="Completed Missions" value={completedCount} tone="safe" />
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
        <EmptyState icon={Ambulance} title="No missions here" message="No missions match this filter right now." />
      ) : (
        <div className="rescue-dashboard__list">
          {filtered.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onView={setSelected}
              onAccept={handleAccept}
              onAdvance={handleAdvance}
            />
          ))}
        </div>
      )}

      {selected && (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <MissionDetail mission={selected} onAdvance={handleAdvance} />
        </Modal>
      )}
    </div>
  );
}

function MissionCard({ mission, onView, onAccept, onAdvance }) {
  const { id, type, severity, status, location, peopleAffected, reportedAt, latitude, longitude } = mission;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const isAssigned = status === "Assigned";
  const isCompleted = status === "Rescue Completed";

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
      </div>

      <div className="mission-card__actions">
        <button className="mission-card__action" onClick={() => onView(mission)}>
          View
        </button>
        {isAssigned && (
          <button className="mission-card__action mission-card__action--primary" onClick={() => onAccept(mission)}>
            Accept
          </button>
        )}
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="mission-card__action">
          <Navigation size={13} /> Navigate
        </a>
        {!isAssigned && !isCompleted && (
          <button className="mission-card__action" onClick={() => onAdvance(mission)}>
            Update Status
          </button>
        )}
      </div>
    </article>
  );
}

function MissionDetail({ mission, onAdvance }) {
  const {
    type,
    severity,
    status,
    description,
    location,
    peopleAffected,
    reportedAt,
    citizenName,
    citizenPhone,
    requiredResources,
    nearestHospital,
    nearestShelter,
    latitude,
    longitude,
  } = mission;

  const currentIndex = MISSION_STAGES.indexOf(status);
  const isCompleted = status === "Rescue Completed";

  return (
    <div className="mission-detail">
      <div className="mission-detail__badges">
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>{status}</StatusBadge>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>

      <h3>{type}</h3>
      <p className="mission-detail__desc">{description}</p>

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

      <div className="mission-detail__meta">
        <span><MapPin size={14} /> {location}</span>
        <span><Users size={14} /> {peopleAffected} affected</span>
        <span><Clock size={14} /> Reported {timeAgo(reportedAt)}</span>
      </div>

      <div className="mission-detail__section">
        <h4>Citizen Information</h4>
        <div className="mission-detail__citizen">
          <span>{citizenName}</span>
          <a href={`tel:${citizenPhone.replace(/\s+/g, "")}`}>
            <Phone size={13} /> {citizenPhone}
          </a>
        </div>
      </div>

      <div className="mission-detail__section">
        <h4><Boxes size={14} /> Required Resources</h4>
        <ul className="mission-detail__resources">
          {requiredResources.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mission-detail__section">
        <h4>Nearby Support</h4>
        <div className="mission-detail__support">
          <span><Building2 size={14} /> {nearestHospital}</span>
          <span><HomeIcon size={14} /> {nearestShelter}</span>
        </div>
      </div>

      <div className="mission-detail__timeline">
        {MISSION_STAGES.map((stage, i) => (
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

      {!isCompleted && status !== "Assigned" && (
        <Button variant="primary" size="md" fullWidth onClick={() => onAdvance(mission)}>
          Advance to {MISSION_STAGES[currentIndex + 1]}
        </Button>
      )}
    </div>
  );
}

export default RescueDashboard;
