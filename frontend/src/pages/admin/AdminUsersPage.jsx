import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../../services/userService";
import { timeAgo } from "../../utils/formatTime";
import "./AdminDashboard.css";

const ROLE_OPTIONS = ["citizen", "rescue", "volunteer", "hospital", "admin"];

const roleToneMap = {
  admin: "critical",
  rescue: "warning",
  hospital: "info",
  volunteer: "safe",
  citizen: "neutral",
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    role: "citizen",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to fetch user accounts. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      fullName: u.fullName || "",
      phone: u.phone || "",
      location: u.location || "",
      role: u.role || "citizen",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      await updateUser(editingUser.id, formData);
      closeModal();
      loadUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setFormError(err.response?.data?.message || "Failed to update user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete account for ${user.fullName}?`)) return;

    try {
      await deleteUser(user.id);
      loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(err.response?.data?.message || "Failed to delete user account.");
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.location || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const countByRole = (roleName) => users.filter((u) => u.role === roleName).length;

  if (loading) return <LoadingSpinner label="Loading system user accounts..." />;

  return (
    <div className="admin-page">
      <div className="admin-dashboard__head" style={{ marginBottom: "20px" }}>
        <div>
          <h1>User Account Management</h1>
          <p>Inspect registered platform users, manage system permissions, and update user roles.</p>
        </div>
        <button className="disaster-map-error__retry" onClick={loadUsers}>
          <RefreshCw size={14} /> Refresh Users
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={Users} label="Total Users" value={users.length} tone="info" />
        <StatCard icon={UserCheck} label="Citizens" value={countByRole("citizen")} tone="neutral" />
        <StatCard icon={ShieldCheck} label="Rescue Personnel" value={countByRole("rescue")} tone="warning" />
        <StatCard icon={UserCheck} label="Volunteers" value={countByRole("volunteer")} tone="safe" />
        <StatCard icon={ShieldCheck} label="Administrators" value={countByRole("admin")} tone="critical" />
      </div>

      {/* Search & Role Filter Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            type="text"
            placeholder="Search full name, email, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #d0d5dd" }}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #d0d5dd", background: "white", fontSize: "13px", fontWeight: "600" }}
        >
          <option value="all">All System Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>Role: {r.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#fef3f2", color: "#b42318", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No Users Found" message="No registered user accounts match your search or role filter." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Full Name</th>
                <th style={{ padding: "10px" }}>Email Address</th>
                <th style={{ padding: "10px" }}>Assigned Role</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Phone</th>
                <th style={{ padding: "10px" }}>Joined</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                  <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{u.fullName}</td>
                  <td style={{ padding: "10px", color: "#475467" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Mail size={13} /> {u.email}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <StatusBadge tone={roleToneMap[u.role] || "neutral"}>
                      {(u.role || "citizen").toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: "10px", color: "#475467" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} /> {u.location || "Default District"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", color: "#475467" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={13} /> {u.phone || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", color: "#667085", fontSize: "12px" }}>
                    {u.createdAt ? timeAgo(u.createdAt) : "Recently"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        onClick={() => openEditModal(u)}
                        style={{ background: "#f2f4f7", border: "1px solid #d0d5dd", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Edit2 size={12} /> Edit Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        style={{ background: "#fef3f2", border: "1px solid #fee4e2", color: "#b42318", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {modalOpen && editingUser && (
        <Modal open={modalOpen} onClose={closeModal} title={`Edit User Account: ${editingUser?.fullName || ""}`}>
          <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formError && <div style={{ color: "#b42318", fontSize: "13px" }}>{formError}</div>}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Assigned Platform Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>District / Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d0d5dd" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
              <button type="button" onClick={closeModal} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #d0d5dd", background: "white", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#1c3b6b", color: "white", fontWeight: "600", cursor: "pointer" }}>
                {submitting ? "Saving..." : "Save User Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminUsersPage;
