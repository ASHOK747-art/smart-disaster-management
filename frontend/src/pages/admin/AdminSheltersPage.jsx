import { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  RefreshCw,
  Search,
  Edit2,
  Users,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import {
  getNearbyShelters,
  updateShelter,
} from "../../services/shelterService";
import "./AdminDashboard.css";

const SHELTER_STATUS_OPTIONS = ["AVAILABLE", "FILLING UP", "NEARLY FULL", "FULL"];

function AdminSheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [formData, setFormData] = useState({
    capacity: 500,
    occupied: 0,
    food: true,
    water: true,
    medical: true,
    status: "AVAILABLE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadShelters = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getNearbyShelters();
      setShelters(list);
    } catch (err) {
      console.error("Failed to load shelters:", err);
      setError("Failed to load shelters. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingShelter(null);
  };

  const openEditModal = (s) => {
    setEditingShelter(s);
    setFormData({
      capacity: s.capacity ?? 500,
      occupied: s.occupied ?? s.currentOccupancy ?? 0,
      food: Boolean(s.food),
      water: Boolean(s.water),
      medical: Boolean(s.medical),
      status: s.status || "AVAILABLE",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      await updateShelter(editingShelter.id, formData);
      closeModal();
      loadShelters();
    } catch (err) {
      console.error("Error updating shelter:", err);
      setFormError(err.response?.data?.message || "Failed to update shelter occupancy.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = shelters.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.location || "").toLowerCase().includes(q) ||
      (s.address || "").toLowerCase().includes(q) ||
      (s.status || "").toLowerCase().includes(q)
    );
  });

  const totalCapacity = shelters.reduce((acc, s) => acc + (Number(s.capacity) || 0), 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + (Number(s.occupied || s.currentOccupancy) || 0), 0);
  const totalFree = Math.max(0, totalCapacity - totalOccupied);
  const availableCount = shelters.filter((s) => s.status === "AVAILABLE").length;

  if (loading) return <LoadingSpinner label="Loading relief shelter data..." />;

  return (
    <div className="admin-page">
      <div className="admin-dashboard__head" style={{ marginBottom: "20px" }}>
        <div>
          <h1>Relief Shelters Management</h1>
          <p>Monitor emergency evacuation centers, manage occupancy levels, and track essential supplies.</p>
        </div>
        <button className="disaster-map-error__retry" onClick={loadShelters}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={HomeIcon} label="Total Shelters" value={shelters.length} tone="info" />
        <StatCard icon={CheckCircle2} label="Available Shelters" value={availableCount} tone="safe" />
        <StatCard icon={Users} label="Total Occupied" value={totalOccupied} tone="warning" />
        <StatCard icon={HomeIcon} label="Available Spaces" value={totalFree} tone="safe" />
        <StatCard icon={Users} label="Total Capacity" value={totalCapacity} tone="neutral" />
      </div>

      {/* Search Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            type="text"
            placeholder="Search shelter name, location, or status..."
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

      {/* Shelters Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={HomeIcon} title="No Shelters Found" message="No relief shelter records match your search filter." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Shelter Name</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Occupancy / Capacity</th>
                <th style={{ padding: "10px" }}>Available Spaces</th>
                <th style={{ padding: "10px" }}>Supplies</th>
                <th style={{ padding: "10px" }}>Contact</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const cap = s.capacity || 100;
                const occ = s.occupied ?? s.currentOccupancy ?? 0;
                const free = Math.max(0, cap - occ);
                const statusTone = s.status === "AVAILABLE" ? "safe" : s.status === "FILLING UP" ? "warning" : "critical";
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{s.name}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {s.location || s.address}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <StatusBadge tone={statusTone}>{s.status || "AVAILABLE"}</StatusBadge>
                    </td>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{occ} / {cap}</td>
                    <td style={{ padding: "10px", fontWeight: "600", color: free > 0 ? "#1e9e6b" : "#e4402c" }}>
                      {free} spaces free
                    </td>
                    <td style={{ padding: "10px", fontSize: "12px", color: "#475467" }}>
                      {[s.food && "🍱 Food", s.water && "💧 Water", s.medical && "🩺 Medical"].filter(Boolean).join(" • ") || "Basic"}
                    </td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={13} /> {s.contact || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditModal(s)}
                        style={{ background: "#f2f4f7", border: "1px solid #d0d5dd", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={12} /> Manage Occupancy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Shelter Modal */}
      {modalOpen && editingShelter && (
        <Modal open={modalOpen} onClose={closeModal} title={`Update Occupancy: ${editingShelter?.name || "Shelter"}`}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formError && <div style={{ color: "#b42318", fontSize: "13px" }}>{formError}</div>}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Shelter Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              >
                {SHELTER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Current Occupied People</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.occupied}
                  onChange={(e) => setFormData({ ...formData, occupied: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Total Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Essential Relief Supplies Available</label>
              <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <input type="checkbox" checked={formData.food} onChange={(e) => setFormData({ ...formData, food: e.target.checked })} />
                  Food Supplies
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <input type="checkbox" checked={formData.water} onChange={(e) => setFormData({ ...formData, water: e.target.checked })} />
                  Drinking Water
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                  <input type="checkbox" checked={formData.medical} onChange={(e) => setFormData({ ...formData, medical: e.target.checked })} />
                  Medical Aid
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button type="button" onClick={closeModal} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #d0d5dd", background: "white", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#1c3b6b", color: "white", fontWeight: "600", cursor: "pointer" }}>
                {submitting ? "Updating..." : "Save Occupancy"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminSheltersPage;
