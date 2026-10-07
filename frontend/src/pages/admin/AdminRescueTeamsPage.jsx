import { useEffect, useState } from "react";
import {
  Ambulance,
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Users,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import {
  getRescueTeams,
  createRescueTeam,
  updateRescueTeam,
} from "../../services/rescueTeamService";
import "./AdminDashboard.css";

const AVAILABILITY_OPTIONS = ["Available", "Assigned", "On Mission"];

function AdminRescueTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    teamCode: "",
    location: "",
    latitude: 13.04,
    longitude: 80.23,
    specialization: "",
    membersCount: 5,
    contact: "",
    availability: "Available",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getRescueTeams();
      setTeams(list);
    } catch (err) {
      console.error("Failed to load rescue teams:", err);
      setError("Failed to load rescue teams. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingTeam(null);
  };

  const openAddModal = () => {
    setEditingTeam(null);
    setFormData({
      name: "",
      teamCode: `RT-${Math.floor(100 + Math.random() * 900)}`,
      location: "",
      latitude: 13.04,
      longitude: 80.23,
      specialization: "Flood & Water Search Rescue",
      membersCount: 5,
      contact: "",
      availability: "Available",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || "",
      teamCode: team.teamCode || "",
      location: team.location || "",
      latitude: team.latitude || 13.04,
      longitude: team.longitude || 80.23,
      specialization: team.specialization || "",
      membersCount: team.membersCount || 5,
      contact: team.contact || "",
      availability: team.availability || "Available",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      if (editingTeam) {
        await updateRescueTeam(editingTeam.id, formData);
      } else {
        await createRescueTeam(formData);
      }
      closeModal();
      loadTeams();
    } catch (err) {
      console.error("Error saving rescue team:", err);
      setFormError(err.response?.data?.message || "Failed to save rescue team details.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.name || "").toLowerCase().includes(q) ||
      (t.teamCode || "").toLowerCase().includes(q) ||
      (t.location || "").toLowerCase().includes(q) ||
      (t.specialization || "").toLowerCase().includes(q)
    );
  });

  const availableCount = teams.filter((t) => t.availability === "Available").length;
  const assignedCount = teams.filter((t) => t.availability === "Assigned").length;
  const onMissionCount = teams.filter((t) => t.availability === "On Mission").length;
  const totalMembers = teams.reduce((acc, t) => acc + (Number(t.membersCount) || 0), 0);

  if (loading) return <LoadingSpinner label="Loading emergency rescue teams..." />;

  return (
    <div className="admin-page">
      <div className="admin-dashboard__head" style={{ marginBottom: "20px" }}>
        <div>
          <h1>Rescue Teams Management</h1>
          <p>Deploy, register, and monitor emergency rescue operations and squads.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="disaster-map-error__retry" onClick={loadTeams}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="disaster-map-error__retry" style={{ background: "#1c3b6b" }} onClick={openAddModal}>
            <Plus size={14} /> Deploy New Team
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={Ambulance} label="Total Teams" value={teams.length} tone="info" />
        <StatCard icon={ShieldCheck} label="Available Teams" value={availableCount} tone="safe" />
        <StatCard icon={Ambulance} label="Assigned" value={assignedCount} tone="warning" />
        <StatCard icon={Ambulance} label="On Mission" value={onMissionCount} tone="critical" />
        <StatCard icon={Users} label="Total Rescuers" value={totalMembers} tone="neutral" />
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            type="text"
            placeholder="Search team name, code, location, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #d0d5dd" }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#fef3f2", color: "#b42318", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Rescue Teams Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Ambulance} title="No Rescue Teams Found" message="No rescue teams match your filter query." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Team Code</th>
                <th style={{ padding: "10px" }}>Team Name</th>
                <th style={{ padding: "10px" }}>Specialization</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Members</th>
                <th style={{ padding: "10px" }}>Availability</th>
                <th style={{ padding: "10px" }}>Contact</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const statusTone = t.availability === "Available" ? "safe" : t.availability === "On Mission" ? "critical" : "warning";
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{t.teamCode || t.id}</td>
                    <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{t.name}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>{t.specialization}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {t.location}
                      </span>
                    </td>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{t.membersCount} members</td>
                    <td style={{ padding: "10px" }}>
                      <StatusBadge tone={statusTone}>{t.availability}</StatusBadge>
                    </td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={13} /> {t.contact || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditModal(t)}
                        style={{ background: "#f2f4f7", border: "1px solid #d0d5dd", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {modalOpen && (
        <Modal open={modalOpen} onClose={closeModal} title={editingTeam ? "Edit Rescue Team" : "Deploy New Rescue Team"}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formError && <div style={{ color: "#b42318", fontSize: "13px" }}>{formError}</div>}
            
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Team Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Team Code</label>
              <input
                type="text"
                required
                value={formData.teamCode}
                onChange={(e) => setFormData({ ...formData, teamCode: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Specialization</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Location / Base</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Members Count</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.membersCount}
                  onChange={(e) => setFormData({ ...formData, membersCount: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Contact Phone</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button type="button" onClick={closeModal} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #d0d5dd", background: "white", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#1c3b6b", color: "white", fontWeight: "600", cursor: "pointer" }}>
                {submitting ? "Saving..." : "Save Team"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminRescueTeamsPage;
