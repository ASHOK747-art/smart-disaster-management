import { MapPin, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./AlertCard.css";

function AlertCard({ alert }) {
  const { type, location, severity, status, issuedAt, description } = alert;

  return (
    <article className="alert-card">
      <div className="alert-card__head">
        <h3>{type} Alert</h3>
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status)}>
          {status}
        </StatusBadge>
      </div>

      <p className="alert-card__desc">{description}</p>

      <div className="alert-card__meta">
        <span><MapPin size={13} /> {location}</span>
        <span><Clock size={13} /> {timeAgo(issuedAt)}</span>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>
    </article>
  );
}

export default AlertCard;
