import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Eye,
  Check,
} from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { getAllIncidents, updateIncidentStatus, assignResponder } from "../../services/incidentService";
import { getUsersByRole } from "../../services/authService";
import { severityTone, statusTone, shouldPulse } from "../../utils/severity";
import { timeAgo } from "../../utils/formatTime";
import "./AdminIncidentsPage.css";

const ADMIN_STATUS_OPTIONS = ["Pending", "Verified", "In Progress", "Resolved", "Rejected"];

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [responders, setResponders] = useState([]);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    loadIncidents();
    getUsersByRole("rescue")
      .then(setResponders)
      .catch((err) => console.error("Failed to load responders:", err));
  }, []);

  async function loadIncidents() {
    try {
      setLoading(true);
      const data = await getAllIncidents();
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      setUpdatingId(id);
      const updated = await updateIncidentStatus(id, newStatus);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(updated);
      }
      setActionSuccess(`Incident ${id} updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update incident status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAssign(id, responderId) {
    if (!responderId) return;
    try {
      setAssigningId(id);
      const updated = await assignResponder(id, responderId);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(updated);
      }
      setActionSuccess(`Incident ${id} assigned to ${updated.assignedResponder?.fullName || "responder"}`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to assign responder:", err);
      alert(err.response?.data?.message || "Failed to assign responder.");
    } finally {
      setAssigningId(null);
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus =
      statusFilter === "All" ||
      inc.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === "Pending" && inc.status === "Reported") ||
      (statusFilter === "In Progress" && ["Rescue Assigned", "Rescue In Progress"].includes(inc.status));

    const matchesSearch =
      !searchQuery.trim() ||
      inc.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = incidents.filter((i) => ["Pending", "Reported"].includes(i.status)).length;
  const verifiedCount = incidents.filter((i) => i.status === "Verified").length;
  const inProgressCount = incidents.filter((i) =>
    ["In Progress", "Rescue Assigned", "Rescue In Progress"].includes(i.status)
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  if (loading) return <LoadingSpinner label="Loading incidents list…" />;

  return (
    <div className="admin-incidents">
      <div className="admin-incidents__head">
        <div>
          <h1>Incident Management</h1>
          <p>Review incoming citizen reports, verify disaster details, and update response status.</p>
        </div>
        <Button variant="outline" onClick={loadIncidents}>
          Refresh
        </Button>
      </div>

      {actionSuccess && (
        <div className="admin-incidents__toast">
          <Check size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Summary counters */}
      <div className="admin-incidents__stats">
        <div className="admin-incidents__stat-item">
          <span className="data-text">{incidents.length}</span>
          <span>Total Reports</span>
        </div>
        <div className="admin-incidents__stat-item admin-incidents__stat-item--warning">
          <span className="data-text">{pendingCount}</span>
          <span>Pending</span>
        </div>
        <div className="admin-incidents__stat-item admin-incidents__stat-item--info">
          <span className="data-text">{verifiedCount}</span>
          <span>Verified</span>
        </div>
        <div className="admin-incidents__stat-item admin-incidents__stat-item--critical">
          <span className="data-text">{inProgressCount}</span>
          <span>In Progress</span>
        </div>
        <div className="admin-incidents__stat-item admin-incidents__stat-item--safe">
          <span className="data-text">{resolvedCount}</span>
          <span>Resolved</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-incidents__toolbar">
        <div className="admin-incidents__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by ID, type, location, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-incidents__filters">
          <Filter size={16} />
          {["All", "Pending", "Verified", "In Progress", "Resolved"].map((status) => (
            <button
              key={status}
              type="button"
              className={`admin-incidents__filter-btn ${
                statusFilter === status ? "admin-incidents__filter-btn--active" : ""
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      {filteredIncidents.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No incidents found"
          message={
            searchQuery
              ? "No incident reports matched your search criteria."
              : "No reports found under this status."
          }
        />
      ) : (
        <div className="admin-incidents__table-wrapper">
          <table className="admin-incidents__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Affected</th>
                <th>Reported</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Responder</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => {
                const isUpdating = updatingId === incident.id;
                return (
                  <tr key={incident.id}>
                    <td className="data-text">{incident.id}</td>
                    <td>
                      <strong>{incident.type}</strong>
                    </td>
                    <td>
                      <StatusBadge tone={severityTone(incident.severity)}>
                        {incident.severity}
                      </StatusBadge>
                    </td>
                    <td>
                      <span className="admin-incidents__location" title={incident.location}>
                        <MapPin size={13} /> {incident.location}
                      </span>
                    </td>
                    <td>
                      <Users size={13} /> {incident.peopleAffected}
                    </td>
                    <td className="admin-incidents__time">
                      <Clock size={13} /> {timeAgo(incident.reportedAt)}
                    </td>
                    <td>
                      <StatusBadge
                        tone={statusTone(incident.status)}
                        pulse={shouldPulse(incident.status)}
                      >
                        {incident.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <select
                        className="admin-incidents__select"
                        value={incident.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                      >
                        {ADMIN_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-incidents__select"
                        value={incident.assignedResponder?._id || incident.assignedResponder || ""}
                        disabled={assigningId === incident.id}
                        onChange={(e) => handleAssign(incident.id, e.target.value)}
                      >
                        <option value="" disabled>
                          {incident.assignedResponder?.fullName || "Unassigned"}
                        </option>
                        {responders.map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.fullName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => setSelectedIncident(incident)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <Modal title={`Incident ${selectedIncident.id}`} onClose={() => setSelectedIncident(null)}>
          <div className="admin-incident-modal">
            <div className="admin-incident-modal__badges">
              <StatusBadge
                tone={statusTone(selectedIncident.status)}
                pulse={shouldPulse(selectedIncident.status)}
              >
                {selectedIncident.status}
              </StatusBadge>
              <StatusBadge tone={severityTone(selectedIncident.severity)}>
                {selectedIncident.severity}
              </StatusBadge>
            </div>

            <h2>{selectedIncident.type} Emergency</h2>
            <p className="admin-incident-modal__desc">{selectedIncident.description}</p>

            {selectedIncident.images && selectedIncident.images.length > 0 && (
              <div className="admin-incident-modal__images">
                <h4>Scene Photos</h4>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  {selectedIncident.images.map((img, idx) => (
                    <a key={idx} href={getImageUrl(img)} target="_blank" rel="noreferrer">
                      <img
                        src={getImageUrl(img)}
                        alt="Scene photo"
                        style={{
                          maxHeight: "180px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid var(--border-default, #e4e7ec)",
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-incident-modal__meta">
              <div>
                <strong>Location:</strong> {selectedIncident.location}
              </div>
              {selectedIncident.latitude && (
                <div>
                  <strong>GPS:</strong> {selectedIncident.latitude.toFixed(5)},{" "}
                  {selectedIncident.longitude.toFixed(5)}
                </div>
              )}
              <div>
                <strong>People Affected:</strong> {selectedIncident.peopleAffected}
              </div>
              <div>
                <strong>Reported:</strong> {new Date(selectedIncident.reportedAt).toLocaleString()}
              </div>
              {selectedIncident.reporter && (
                <div>
                  <strong>Reporter:</strong> {selectedIncident.reporter.fullName} (
                  {selectedIncident.reporter.email || selectedIncident.reporter.phone})
                </div>
              )}
              <div>
                <strong>Assigned Responder:</strong>{" "}
                {selectedIncident.assignedResponder?.fullName || "Unassigned"}
              </div>
            </div>

            <div className="admin-incident-modal__actions">
              <label>Assign Responder:</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <select
                  className="admin-incidents__select"
                  style={{ flex: 1 }}
                  value=""
                  disabled={assigningId === selectedIncident.id}
                  onChange={(e) => handleAssign(selectedIncident.id, e.target.value)}
                >
                  <option value="" disabled>
                    {responders.length ? "Choose a responder…" : "No rescue users found"}
                  </option>
                  {responders.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <label>Update Status:</label>
              <div className="admin-incident-modal__status-btns">
                {["Pending", "Verified", "In Progress", "Resolved"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`admin-incident-modal__status-btn ${
                      selectedIncident.status.toLowerCase() === st.toLowerCase()
                        ? "admin-incident-modal__status-btn--active"
                        : ""
                    }`}
                    onClick={() => handleStatusChange(selectedIncident.id, st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminIncidentsPage;