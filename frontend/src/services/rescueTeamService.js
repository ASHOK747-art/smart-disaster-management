import api from "../api/axiosClient";

function normalizeRescueTeam(t) {
  if (!t) return t;
  return {
    ...t,
    id: t.id || t._id,
  };
}

export async function getRescueTeams() {
  const res = await api.get("/rescue-teams");
  const list = res.data?.rescueTeams || [];
  return list.map(normalizeRescueTeam);
}

export async function getRescueTeamById(id) {
  const res = await api.get(`/rescue-teams/${id}`);
  return normalizeRescueTeam(res.data?.rescueTeam);
}

export async function createRescueTeam(data) {
  const res = await api.post("/rescue-teams", data);
  return normalizeRescueTeam(res.data?.rescueTeam);
}

export async function updateRescueTeam(id, updates) {
  const res = await api.put(`/rescue-teams/${id}`, updates);
  return normalizeRescueTeam(res.data?.rescueTeam);
}

