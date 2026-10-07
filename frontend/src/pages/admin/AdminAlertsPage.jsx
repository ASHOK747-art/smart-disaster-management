import { useEffect, useState } from "react";
import {
  Siren,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Zap,
  Activity,
  XCircle,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import { getAdminAlerts, updateAlertStatus } from "../../services/alertService";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./AdminDashboard.css";
import "./AdminAlertsPage.css";

const SEVERITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"];
const INCIDENT_TYPES = [
  "All",
  "Flood",
  "Cyclone",
  "Landslide",
  "Heavy Rainfall",
  "Fire",
  "Building Collapse",
  "Accident",
  "Medical Emergency",
  "Other",
];
const STATUS_OPTIONS = [
  "All",
  "Active Only",
  "Reported",
  "Pending",
  "Verified",
  "In Progress",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
  "Rejected",
];

const UPDATE_STATUS_OPTIONS = [
  "Pending",
  "Reported",
  "Verified",
  "In Progress",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
  "Rejected",
];

function getHazardIcon(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("fire")) return Flame;
  if (t.includes("flood") || t.includes("water")) return Droplets;
  if (t.includes("storm") || t.includes("wind") || t.includes("cyclone")) return Wind;
  if (t.includes("power") || t.includes("electric")) return Zap;
  return Activity;
}

function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active Only");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [formData, setFormData] = useState({
    status: "Verified",
    severity: "High",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getAdminAlerts();
      setAlerts(list);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError("Failed to fetch disaster alerts from database. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAlert(null);
    setFormError("");
  };

  const openManageModal = (alertItem) => {
    setSelectedAlert(alertItem);
    setFormData({
      status: alertItem.status || "Verified",
      severity: alertItem.severity || "High",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setSubmitting(true);
    setFormError("");
    try {
      await updateAlertStatus(selectedAlert.id, formData);
      closeModal();
      loadAlerts();
    } catch (err) {
      console.error("Error updating alert status:", err);
      setFormError(err.response?.data?.message || "Failed to update alert status.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metric computations from real database documents
  const isInactive = (st) => ["Resolved", "Rejected"].includes(st);
  const activeAlerts = alerts.filter((a) => !isInactive(a.status));
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "Critical");
  const highAlerts = activeAlerts.filter((a) => a.severity === "High");
  const resolvedAlerts = alerts.filter((a) => isInactive(a.status));

  // Filter logic
  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (a.title || "").toLowerCase().includes(q) ||
      (a.location || "").toLowerCase().includes(q) ||
      (a.type || "").toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q);

    const matchesSeverity = severityFilter === "All" || a.severity === severityFilter;
    const matchesType = typeFilter === "All" || a.type === typeFilter;

    let matchesStatus = true;
    if (statusFilter === "Active Only") {
      matchesStatus = !isInactive(a.status);
    } else if (statusFilter !== "All") {
      matchesStatus = a.status === statusFilter;
    }

    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  if (loading) return <LoadingSpinner label="Loading emergency disaster alerts..." />;

  return (
    <div className="admin-page alerts-management-page">
      {/* Page Header */}
      <div className="admin-dashboard__head alerts-management-head">
        <div>
          <div className="alerts-head-title-row">
            <h1>Alerts</h1>
            <StatusBadge tone="critical">Disaster Alert Center</StatusBadge>
          </div>
          <p>Monitor and manage disaster alerts generated from incidents and risk conditions.</p>
        </div>

        <div className="alerts-head-actions">
          {lastUpdated && (
            <span className="alerts-last-updated">
              <Clock size={13} /> Updated {timeAgo(lastUpdated)}
            </span>
          )}
          <button className="disaster-map-error__retry" onClick={loadAlerts} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} /> Refresh Alerts
          </button>
        </div>
      </div>

      {/* Real Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard
          icon={Siren}
          label="Active Alerts"
          value={activeAlerts.length}
          tone="warning"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Alerts"
          value={criticalAlerts.length}
          tone="critical"
        />
        <StatCard
          icon={ShieldCheck}
          label="High Priority Alerts"
          value={highAlerts.length}
          tone="critical"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved / Expired"
          value={resolvedAlerts.length}
          tone="safe"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="alerts-filter-toolbar">
        <div className="alerts-search-box">
          <Search size={16} className="alerts-search-icon" />
          <input
            type="text"
            placeholder="Search alert title, location, type, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="alerts-search-input"
          />
        </div>

        <div className="alerts-select-group">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="alerts-select"
          >
            <option value="All">Severity: All</option>
            {SEVERITY_OPTIONS.filter((s) => s !== "All").map((s) => (
              <option key={s} value={s}>Severity: {s}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="alerts-select"
          >
            <option value="All">Type: All Hazards</option>
            {INCIDENT_TYPES.filter((t) => t !== "All").map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="alerts-select"
          >
            <option value="Active Only">Filter: Active Alerts Only</option>
            <option value="All">Filter: All Statuses</option>
            {STATUS_OPTIONS.filter((st) => !["All", "Active Only"].includes(st)).map((st) => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alerts-error-box">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button className="disaster-map-error__retry" onClick={loadAlerts}>
            Retry
          </button>
        </div>
      )}

      {/* Active Alerts Table / List */}
      {!error && filtered.length === 0 ? (
        <div className="alerts-nodata-card">
          <EmptyState
            icon={Siren}
            title="No Active Alerts"
            message="There are currently no active disaster alerts matching your filter criteria."
          />
        </div>
      ) : (
        <div className="admin-recent-table-wrapper alerts-table-card">
          <table className="admin-recent-table">
            <thead>
              <tr>
                <th>Alert / Disaster Event</th>
                <th>Hazard Type</th>
                <th>Severity</th>
                <th>Location / Area</th>
                <th>Status</th>
                <th>Impact</th>
                <th>Reported</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alertItem) => {
                const IconComp = getHazardIcon(alertItem.type);
                const sTone = severityTone(alertItem.severity);
                const stTone = statusTone(alertItem.status);
                const pulse = shouldPulse(alertItem.severity);

                return (
                  <tr key={alertItem.id}>
                    <td>
                      <div className="alert-table-title-cell">
                        <span className="alert-table-icon" style={{ color: sTone === "critical" ? "#e4402c" : "#2f6690" }}>
                          <IconComp size={16} />
                        </span>
                        <div>
                          <strong>{alertItem.title}</strong>
                          <span className="alert-table-desc-preview">
                            {alertItem.description?.slice(0, 60)}
                            {alertItem.description?.length > 60 ? "..." : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="alert-type-tag">{alertItem.type}</span>
                    </td>

                    <td>
                      <StatusBadge tone={sTone} pulse={pulse}>
                        {alertItem.severity}
                      </StatusBadge>
                    </td>

                    <td>
                      <span className="alert-location-tag">
                        <MapPin size={13} /> {alertItem.location}
                      </span>
                    </td>

                    <td>
                      <StatusBadge tone={stTone}>
                        {alertItem.status}
                      </StatusBadge>
                    </td>

                    <td>
                      <span className="alert-impact-tag">
                        <Users size={13} /> {alertItem.peopleAffected ?? 1} affected
                      </span>
                    </td>

                    <td>
                      <span className="alert-time-tag">
                        {timeAgo(alertItem.reportedAt)}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        className="alert-manage-btn"
                        onClick={() => openManageModal(alertItem)}
                      >
                        <Edit2 size={13} /> Manage Alert
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Alert Details & Status Management Modal */}
      {modalOpen && selectedAlert && (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={`Alert Details: ${selectedAlert.type} - ${selectedAlert.location}`}
        >
          <div className="alert-modal-content">
            <div className="alert-modal-badges">
              <StatusBadge tone={severityTone(selectedAlert.severity)} pulse={shouldPulse(selectedAlert.severity)}>
                Severity: {selectedAlert.severity}
              </StatusBadge>
              <StatusBadge tone={statusTone(selectedAlert.status)}>
                Status: {selectedAlert.status}
              </StatusBadge>
            </div>

            <div className="alert-modal-meta-grid">
              <div className="alert-modal-meta-item">
                <span className="alert-modal-label">Disaster Hazard</span>
                <strong className="alert-modal-val">{selectedAlert.type}</strong>
              </div>

              <div className="alert-modal-meta-item">
                <span className="alert-modal-label">Location / Area</span>
                <strong className="alert-modal-val">{selectedAlert.location}</strong>
              </div>

              <div className="alert-modal-meta-item">
                <span className="alert-modal-label">People Impacted</span>
                <strong className="alert-modal-val">{selectedAlert.peopleAffected ?? 1} persons</strong>
              </div>

              <div className="alert-modal-meta-item">
                <span className="alert-modal-label">Reported Time</span>
                <strong className="alert-modal-val">{timeAgo(selectedAlert.reportedAt)}</strong>
              </div>
            </div>

            <div className="alert-modal-section">
              <span className="alert-modal-label">Event Description</span>
              <p className="alert-modal-description">{selectedAlert.description}</p>
            </div>

            {selectedAlert.assignedResponder && (
              <div className="alert-modal-section">
                <span className="alert-modal-label">Assigned Responder</span>
                <p className="alert-modal-description">
                  Responder ID: {selectedAlert.assignedResponder.fullName || selectedAlert.assignedResponder._id || selectedAlert.assignedResponder}
                </p>
              </div>
            )}

            {/* Admin Status & Severity Management Form */}
            <form onSubmit={handleStatusUpdate} className="alert-modal-form">
              <h4>Administrative Alert Management</h4>
              {formError && <div className="alerts-form-error">{formError}</div>}

              <div className="alert-form-row">
                <div style={{ flex: 1 }}>
                  <label className="alert-modal-label">Update Lifecycle Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="alerts-select"
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {UPDATE_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="alert-modal-label">Update Severity Classification</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="alerts-select"
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {SEVERITY_OPTIONS.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="alert-modal-actions">
                <button
                  type="button"
                  className="alerts-btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="alerts-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Saving Changes..." : "Save Alert Update"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminAlertsPage;
