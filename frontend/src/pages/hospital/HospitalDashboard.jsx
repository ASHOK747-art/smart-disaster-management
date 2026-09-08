import { useEffect, useState } from "react";
import {
  BedDouble,
  HeartPulse,
  Siren,
  Users,
  Boxes,
  Plus,
  Minus,
  Clock,
  MapPin,
  Stethoscope,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  getHospitalOverview,
  updateHospitalProfile,
  updateResourceQuantity,
  respondToRequest,
} from "../../services/hospitalOpsService";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import "./HospitalDashboard.css";

const STATUS_OPTIONS = ["OPEN", "LIMITED", "FULL"];

function HospitalDashboard() {
  const [profile, setProfile] = useState(null);
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getHospitalOverview().then((res) => {
      if (cancelled) return;
      setProfile(res.profile);
      setResources(res.resources);
      setRequests(res.requests);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading hospital dashboard…" />;

  async function setStatus(status) {
    const updated = await updateHospitalProfile({ status });
    setProfile(updated);
  }

  function adjustBeds(field, delta) {
    updateHospitalProfile({ [field]: Math.max(0, profile[field] + delta) }).then(setProfile);
  }

  function adjustResource(id, delta) {
    updateResourceQuantity(id, delta).then(setResources);
  }

  async function handleRespond(id, status) {
    const updated = await respondToRequest(id, status);
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    setSelected((prev) => (prev && prev.id === id ? updated : prev));
  }

  const incomingCount = requests.filter((r) => r.status === "Pending" || r.status === "Accepted").length;
  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const decidedRequests = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="hospital-dashboard">
      {/* ---- Identity + status ---- */}
      <div className="hospital-header">
        <div>
          <h1>{profile.name}</h1>
          <span className="hospital-header__location"><MapPin size={13} /> {profile.location}</span>
        </div>
        <div className="hospital-header__status">
          <span className="hospital-header__status-label">Status</span>
          <div className="hospital-header__status-options">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                className={`hospital-header__status-btn ${profile.status === s ? `hospital-header__status-btn--active hospital-header__status-btn--${statusTone(s)}` : ""}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Capacity cards ---- */}
      <div className="hospital-stat-grid">
        <StatCard icon={BedDouble} label="Available Beds" value={profile.availableBeds} tone="safe" />
        <StatCard icon={HeartPulse} label="ICU Beds" value={profile.icuBeds} tone="critical" />
        <StatCard icon={Siren} label="Emergency Capacity" value={profile.emergencyCapacity} tone="warning" />
        <StatCard icon={Users} label="Incoming Patients" value={incomingCount} tone="info" />
        <StatCard icon={Boxes} label="Medical Resources" value={resources.length} tone="neutral" />
      </div>

      {/* ---- Bed capacity controls ---- */}
      <div className="hospital-section">
        <h3>Update Capacity</h3>
        <div className="capacity-controls">
          <CapacityControl label="Available Beds" value={profile.availableBeds} onChange={(d) => adjustBeds("availableBeds", d)} />
          <CapacityControl label="ICU Beds" value={profile.icuBeds} onChange={(d) => adjustBeds("icuBeds", d)} />
          <CapacityControl label="Emergency Capacity" value={profile.emergencyCapacity} onChange={(d) => adjustBeds("emergencyCapacity", d)} />
        </div>
      </div>

      {/* ---- Medical resources ---- */}
      <div className="hospital-section">
        <h3>Medical Resources</h3>
        <div className="resource-list">
          {resources.map((r) => (
            <CapacityControl key={r.id} label={r.name} value={r.quantity} onChange={(d) => adjustResource(r.id, d)} />
          ))}
        </div>
      </div>

      {/* ---- Emergency requests ---- */}
      <div className="hospital-section">
        <h3>Emergency Requests</h3>

        {pendingRequests.length === 0 && decidedRequests.length === 0 ? (
          <EmptyState icon={Siren} title="No emergency requests" message="Incoming patient requests will appear here." />
        ) : (
          <div className="request-list">
            {pendingRequests.map((r) => (
              <RequestCard key={r.id} request={r} onView={setSelected} onRespond={handleRespond} />
            ))}
            {decidedRequests.map((r) => (
              <RequestCard key={r.id} request={r} onView={setSelected} onRespond={handleRespond} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={selected.id} onClose={() => setSelected(null)}>
          <RequestDetail request={selected} onRespond={handleRespond} />
        </Modal>
      )}
    </div>
  );
}

function CapacityControl({ label, value, onChange }) {
  return (
    <div className="capacity-control">
      <span className="capacity-control__label">{label}</span>
      <div className="capacity-control__stepper">
        <button onClick={() => onChange(-1)} aria-label={`Decrease ${label}`}>
          <Minus size={14} />
        </button>
        <span className="capacity-control__value data-text">{value}</span>
        <button onClick={() => onChange(1)} aria-label={`Increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function RequestCard({ request, onView, onRespond }) {
  const { id, incidentType, incidentLocation, patientCount, severity, etaMinutes, status } = request;
  const isPending = status === "Pending";

  return (
    <article className="request-card">
      <div className="request-card__head">
        <div>
          <span className="request-card__id data-text">{id}</span>
          <h4>{incidentType}</h4>
        </div>
        <StatusBadge tone={statusTone(status)} pulse={shouldPulse(status) || (isPending && severity === "Critical")}>
          {status}
        </StatusBadge>
      </div>

      <div className="request-card__meta">
        <span><MapPin size={13} /> {incidentLocation}</span>
        <span><Users size={13} /> {patientCount} patients</span>
        <span><Clock size={13} /> ETA {etaMinutes} min</span>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>

      <div className="request-card__actions">
        <button className="request-card__action" onClick={() => onView(request)}>
          View Details
        </button>
        {isPending && (
          <>
            <button
              className="request-card__action request-card__action--accept"
              onClick={() => onRespond(id, "Accepted")}
            >
              Accept
            </button>
            <button
              className="request-card__action request-card__action--reject"
              onClick={() => onRespond(id, "Rejected")}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function RequestDetail({ request, onRespond }) {
  const { id, incidentType, incidentLocation, patientCount, severity, etaMinutes, requiredTreatment, status } = request;
  const isPending = status === "Pending";

  return (
    <div className="request-detail">
      <div className="request-detail__badges">
        <StatusBadge tone={statusTone(status)}>{status}</StatusBadge>
        <StatusBadge tone={severityTone(severity)}>{severity}</StatusBadge>
      </div>

      <h3>{incidentType}</h3>

      <div className="request-detail__meta">
        <span><MapPin size={14} /> {incidentLocation}</span>
        <span><Users size={14} /> {patientCount} patients incoming</span>
        <span><Clock size={14} /> Estimated arrival in {etaMinutes} minutes</span>
      </div>

      <div className="request-detail__section">
        <h4><Stethoscope size={14} /> Required Treatment</h4>
        <p>{requiredTreatment}</p>
      </div>

      {isPending && (
        <div className="request-detail__actions">
          <button className="request-card__action request-card__action--accept" onClick={() => onRespond(id, "Accepted")}>
            Accept
          </button>
          <button className="request-card__action request-card__action--reject" onClick={() => onRespond(id, "Rejected")}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;
