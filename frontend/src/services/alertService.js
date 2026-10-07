import api from "../api/axiosClient";

function normalizeAlert(inc) {
  if (!inc) return inc;
  return {
    ...inc,
    id: inc.id || inc._id,
    reportedAt: inc.reportedAt || inc.createdAt,
    title: `${inc.severity || "Disaster"} Alert: ${inc.type || "Emergency"}`,
  };
}

// Fetch all incident-based alerts for admin monitoring
export async function getAdminAlerts(params = {}) {
  const res = await api.get("/incidents", { params });
  const list = res.data?.incidents || [];
  return list.map(normalizeAlert);
}

// Update alert/incident status and severity
export async function updateAlertStatus(id, payload) {
  const body = typeof payload === "string" ? { status: payload } : payload;
  const res = await api.put(`/incidents/${id}`, body);
  return normalizeAlert(res.data?.incident);
}
