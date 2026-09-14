import { useEffect, useState } from "react";
import { FileText, MapPin, Users, Clock } from "lucide-react";
import IncidentCard from "../../components/common/IncidentCard";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import { getMyIncidents } from "../../services/incidentService";
import { INCIDENT_STAGES } from "../../data/mockIncidents";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./MyReportsPage.css";

const FILTERS = ["All", ...INCIDENT_STAGES];

function MyReportsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyIncidents().then((res) => {
      if (cancelled) return;
      setIncidents(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading your reports…" />;

  const filtered = filter === "All" ? incidents : incidents.filter((i) => i.status === filter);
  const activeCount = incidents.filter((i) => i.status !== "Resolved").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  return (
    <div className="my-reports">
      <div className="my-reports__head">
        <h1>My Reports</h1>
        <p>Track the status of every emergency you've reported.</p>
      </div>

      <div className="my-reports__summary">
        <div className="my-reports__summary-item">
          <span className="data-text">{incidents.length}</span>
          <span>Total reports</span>
        </div>
        <div className="my-reports__summary-item">
          <span className="data-text">{activeCount}</span>
          <span>In progress</span>
        </div>
        <div className="my-reports__summary-item">
          <span className="data-text">{resolvedCount}</span>
          <span>Resolved</span>
        </div>
      </div>

      <div className="my-reports__filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`my-reports__filter ${filter === f ? "my-reports__filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports here"
          message={
            filter === "All"
              ? "You haven't reported any emergencies yet."
              : `You have no reports with status "${filter}".`
          }
        />
      ) : (
        <div className="my-reports__list">
          {filtered.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} onView={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <IncidentDetail incident={selected} />
        </Modal>
      )}
    </div>
  );
}

function IncidentDetail({ incident }) {
  const { type, description, peopleAffected, severity, location, reportedAt, status, assignedTeam } =
    incident;
  const currentIndex = INCIDENT_STAGES.indexOf(status);

  return (
    <div className="incident-detail">
      <div className="incident-detail__badges">
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>
          {status}
        </StatusBadge>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>

      <h3>{type}</h3>
      <p className="incident-detail__desc">{description}</p>

      <div className="incident-detail__meta">
        <span>
          <MapPin size={14} /> {location}
        </span>
        <span>
          <Users size={14} /> {peopleAffected} affected
        </span>
        <span>
          <Clock size={14} /> Reported {timeAgo(reportedAt)}
        </span>
        {assignedTeam && <span className="data-text">Team {assignedTeam}</span>}
      </div>

      <div className="incident-detail__timeline">
        {INCIDENT_STAGES.map((stage, i) => (
          <div
            key={stage}
            className={`incident-detail__step ${i <= currentIndex ? "incident-detail__step--done" : ""} ${
              i === currentIndex ? "incident-detail__step--current" : ""
            }`}
          >
            <span className="incident-detail__dot" />
            <span>{stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReportsPage;
