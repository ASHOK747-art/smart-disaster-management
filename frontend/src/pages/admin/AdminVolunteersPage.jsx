import { useEffect, useState } from "react";
import {
  HeartHandshake,
  RefreshCw,
  Search,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ListChecks,
} from "lucide-react";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { getVolunteerTasks } from "../../services/volunteerService";
import { MOCK_VOLUNTEERS } from "../../data/mockRescueTeams";
import "./AdminDashboard.css";

function AdminVolunteersPage() {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const taskList = await getVolunteerTasks();
      setTasks(taskList || []);
      setVolunteers(MOCK_VOLUNTEERS || []);
    } catch (err) {
      console.error("Failed to load volunteer tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredVolunteers = volunteers.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.name || "").toLowerCase().includes(q) ||
      (v.location || "").toLowerCase().includes(q)
    );
  });

  const totalVolunteers = volunteers.reduce((acc, v) => acc + (Number(v.availableCount) || 0), 0);
  const openTasksCount = tasks.filter((t) => t.status === "OPEN" || t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "ASSIGNED" || t.status === "In Progress").length;
  const completedTasksCount = tasks.filter((t) => t.status === "COMPLETED" || t.status === "Completed").length;

  if (loading) return <LoadingSpinner label="Loading volunteer clusters and tasks..." />;

  return (
    <div className="admin-page">
      <div className="admin-dashboard__head" style={{ marginBottom: "16px" }}>
        <div>
          <h1>Volunteers & Task Operations</h1>
          <p>Track regional volunteer clusters, community support groups, and field task assignments.</p>
        </div>
        <button className="disaster-map-error__retry" onClick={loadData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Notice Banner regarding Volunteer Data Source */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#eff8ff", border: "1px solid #b2ddff", borderRadius: "8px", color: "#175cd3", fontSize: "13px", marginBottom: "20px" }}>
        <AlertCircle size={18} />
        <span>
          <strong>Data Notice:</strong> Volunteer clusters and community task pipelines are currently driven by regional squad profiles and task dispatch workflows.
        </span>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: "20px" }}>
        <StatCard icon={HeartHandshake} label="Volunteer Clusters" value={volunteers.length} tone="info" />
        <StatCard icon={Users} label="Active Volunteers" value={totalVolunteers} tone="safe" />
        <StatCard icon={ListChecks} label="Open Tasks" value={openTasksCount} tone="warning" />
        <StatCard icon={ListChecks} label="In Progress" value={inProgressCount} tone="info" />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasksCount} tone="safe" />
      </div>

      {/* Search Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#667085" }} />
          <input
            type="text"
            placeholder="Search volunteer cluster name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid #d0d5dd" }}
          />
        </div>
      </div>

      {/* Volunteer Clusters Table */}
      <h2 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "700" }}>Regional Volunteer Clusters</h2>
      {filteredVolunteers.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No Volunteer Clusters" message="No volunteer clusters match your search query." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px", marginBottom: "24px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Cluster ID</th>
                <th style={{ padding: "10px" }}>Volunteer Cluster Name</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Available Members</th>
                <th style={{ padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                  <td style={{ padding: "10px", fontWeight: "600" }}>{v.id}</td>
                  <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{v.name}</td>
                  <td style={{ padding: "10px", color: "#475467" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} /> {v.location}
                    </span>
                  </td>
                  <td style={{ padding: "10px", fontWeight: "600", color: "#1e9e6b" }}>
                    <Users size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {v.availableCount} volunteers ready
                  </td>
                  <td style={{ padding: "10px" }}>
                    <StatusBadge tone="safe">ACTIVE CLUSTER</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Volunteer Community Tasks List */}
      <h2 style={{ fontSize: "16px", marginBottom: "12px", fontWeight: "700" }}>Volunteer Task Pipeline</h2>
      {tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No Tasks Found" message="No volunteer tasks are currently assigned." />
      ) : (
        <div className="admin-recent-table-wrapper" style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #eaecf0", padding: "16px" }}>
          <table className="admin-recent-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eaecf0" }}>
                <th style={{ padding: "10px" }}>Task Title</th>
                <th style={{ padding: "10px" }}>Category</th>
                <th style={{ padding: "10px" }}>Location</th>
                <th style={{ padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const isDone = t.status === "COMPLETED" || t.status === "Completed";
                const isProgress = t.status === "ASSIGNED" || t.status === "In Progress";
                const tone = isDone ? "safe" : isProgress ? "warning" : "info";
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "10px", fontWeight: "600", color: "#101828" }}>{t.title || t.description}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>{t.category || "Relief Distribution"}</td>
                    <td style={{ padding: "10px", color: "#475467" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {t.location || "Sector 4"}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <StatusBadge tone={tone}>{t.status || "OPEN"}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminVolunteersPage;
