import { useEffect, useState } from "react";
import {
  Building2,
  RefreshCw,
  Search,
  Edit2,
  Bed,
  MapPin,
  Phone,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import {
  getNearbyHospitals,
  updateHospital,
} from "../../services/hospitalService";
import "./AdminDashboard.css";

const HOSPITAL_STATUS_OPTIONS = ["OPEN", "LIMITED", "FULL"];

function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    status: "OPEN",
    availableBeds: 0,
    icuBeds: 0,
    emergencyCapacity: 0,
    totalBeds: 100,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadHospitals = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getNearbyHospitals();
      setHospitals(list);
    } catch (err) {
      console.error("Failed to load hospitals:", err);
      setError("Failed to load hospitals. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const openEditModal = (h) => {
    setEditingHospital(h);
    setFormData({
      status: h.status || "OPEN",
      availableBeds: h.availableBeds ?? 0,
      icuBeds: h.icuBeds ?? 0,
      emergencyCapacity: h.emergencyCapacity ?? 0,
      totalBeds: h.totalBeds ?? 100,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingHospital(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      await updateHospital(editingHospital.id, formData);
      closeModal();
      loadHospitals();
    } catch (err) {
      console.error("Error updating hospital:", err);
      setFormError(err.response?.data?.message || "Failed to update hospital beds.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = hospitals.filter((h) => {
    const q = search.toLowerCase();
    return (
      (h.name || "").toLowerCase().includes(q) ||
      (h.location || "").toLowerCase().includes(q) ||
      (h.address || "").toLowerCase().includes(q) ||
      (h.status || "").toLowerCase().includes(q)
    );
  });

  const totalBeds = hospitals.reduce((acc, h) => acc + (Number(h.totalBeds) || 0), 0);
  const totalFreeBeds = hospitals.reduce((acc, h) => acc + (Number(h.availableBeds) || 0), 0);
  const totalICU = hospitals.reduce((acc, h) => acc + (Number(h.icuBeds) || 0), 0);
  const openCount = hospitals.filter((h) => h.status === "OPEN").length;

  if (loading) return <LoadingSpinner label="Loading hospital capacity data..." />;

  return (
    <div className="admin-page">
      <div className="admin-dashboard__head" style={{ marginBottom: "20px" }}>
        <div>
          <h1>Hospitals Management</h1>
          <p>Monitor medical centers, manage emergency bed capacity, and track ICU availability.</p>
        </div>
        <button className="disaster-map-error__retry" onClick={loadHospitals}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={Building2} label="Total Hospitals" value={hospitals.length} tone="info" />
        <StatCard icon={CheckCircle2} label="Open Facilities" value={openCount} tone="safe" />
        <StatCard icon={Bed} label="Total Free Beds" value={totalFreeBeds} tone="safe" />
        <StatCard icon={Activity} label="ICU Beds Free" value={totalICU} tone="warning" />
        <StatCard icon={Building2} label="Total Capacity" value={totalBeds} tone="neutral" />
      </div>

      {/* Search Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            type="text"
            placeholder="Search hospital name, location, or status..."
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

      {/* Hospitals Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No Hospitals Found" message="No hospital records match your search filter." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Hospital Name</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Available Beds</th>
                <th style={{ padding: "10px" }}>ICU Beds</th>
                <th style={{ padding: "10px" }}>Total Beds</th>
                <th style={{ padding: "10px" }}>Contact</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const statusTone = h.status === "OPEN" ? "safe" : h.status === "LIMITED" ? "warning" : "critical";
                return (
                  <tr key={h.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{h.name}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {h.location || h.address}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <StatusBadge tone={statusTone}>{h.status || "OPEN"}</StatusBadge>
                    </td>
                    <td style={{ padding: "10px", fontWeight: "600", color: h.availableBeds > 0 ? "#1e9e6b" : "#e4402c" }}>
                      {h.availableBeds} beds free
                    </td>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{h.icuBeds} ICU</td>
                    <td style={{ padding: "10px", color: "#475467" }}>{h.totalBeds || "N/A"}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={13} /> {h.contact || "N/A"}
                      </span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditModal(h)}
                        style={{ background: "#f2f4f7", border: "1px solid #d0d5dd", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={12} /> Manage Beds
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Hospital Capacity Modal */}
      {modalOpen && editingHospital && (
        <Modal open={modalOpen} onClose={closeModal} title={`Update Capacity: ${editingHospital.name}`}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formError && <div style={{ color: "#b42318", fontSize: "13px" }}>{formError}</div>}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Hospital Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              >
                {HOSPITAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Available General Beds</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.availableBeds}
                  onChange={(e) => setFormData({ ...formData, availableBeds: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Available ICU Beds</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.icuBeds}
                  onChange={(e) => setFormData({ ...formData, icuBeds: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Emergency ER Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.emergencyCapacity}
                  onChange={(e) => setFormData({ ...formData, emergencyCapacity: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Total Bed Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button type="button" onClick={closeModal} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #d0d5dd", background: "white", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#1c3b6b", color: "white", fontWeight: "600", cursor: "pointer" }}>
                {submitting ? "Updating..." : "Save Hospital Beds"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminHospitalsPage;
