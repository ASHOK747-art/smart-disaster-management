import { MapPin, Users, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./IncidentCard.css";

function IncidentCard({ incident, onView }) {
  const { id, type, description, peopleAffected, severity, location, reportedAt, status, assignedTeam } = incident;

  return (
    <article className="incident-card">
      <div className="incident-card__head">
        <div>
          <span className="incident-card__id data-text">{id}</span>
          <h3>{type}</h3>
        </div>
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>
          {status}
        </StatusBadge>
      </div>

      <p className="incident-card__desc">{description}</p>

      <div className="incident-card__meta">
        <span><MapPin size={13} /> {location}</span>
        <span><Users size={13} /> {peopleAffected} affected</span>
        <span><Clock size={13} /> {timeAgo(reportedAt)}</span>
      </div>

      <div className="incident-card__footer">
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
        {assignedTeam && <span className="incident-card__team data-text">Team {assignedTeam}</span>}
        {onView && (
          <button className="incident-card__view" onClick={() => onView(incident)}>
            View
          </button>
        )}
      </div>
    </article>
  );
}

export default IncidentCard;
