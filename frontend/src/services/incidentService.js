import api from "../api/axiosClient";

function normalizeIncident(incident) {
  if (!incident) return incident;
  return {
    ...incident,
    id: incident.id || incident._id,
    reportedAt: incident.reportedAt || incident.createdAt,
  };
}

export async function submitIncident(payload) {
  let res;
  if (payload instanceof FormData) {
    res = await api.post("/incidents", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else if (payload.photo || payload.image) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "photo" || key === "image") {
        if (value instanceof File || value instanceof Blob) {
          formData.append("image", value);
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    res = await api.post("/incidents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    res = await api.post("/incidents", payload);
  }

  return normalizeIncident(res.data?.incident);
}

export async function getMyIncidents(params = {}) {
  const res = await api.get("/incidents", { params });
  const list = res.data?.incidents || [];
  return list.map(normalizeIncident);
}

export async function getAllIncidents(params = {}) {
  const res = await api.get("/incidents", { params });
  const list = res.data?.incidents || [];
  return list.map(normalizeIncident);
}

export async function getIncidentById(id) {
  const res = await api.get(`/incidents/${id}`);
  return normalizeIncident(res.data?.incident);
}

export async function updateIncidentStatus(id, status, extra = {}) {
  const res = await api.put(`/incidents/${id}`, { status, ...extra });
  return normalizeIncident(res.data?.incident);
}

// Rescue user's own worklist — only incidents assigned to them.
export async function getAssignedIncidents() {
  const res = await api.get("/incidents/assigned");
  const list = res.data?.incidents || [];
  return list.map(normalizeIncident);
}

// Admin-only: assign a rescue-role user to handle this incident.
export async function assignResponder(id, responderId) {
  const res = await api.put(`/incidents/${id}/assign`, { responderId });
  return normalizeIncident(res.data?.incident);
}

// Admin-only dashboard analytics computed from live Incident data.
export async function getAdminStats() {
  const res = await api.get("/incidents/admin/stats");
  return res.data?.stats;
}

export async function getPublicIncidents() {
  const res = await api.get("/incidents/public");
  const list = res.data?.incidents || [];
  return list.map(normalizeIncident);
}