import api from "../api/axiosClient";

function normalizeShelter(s) {
  if (!s) return s;
  return {
    ...s,
    id: s.id || s._id,
  };
}

export async function getNearbyShelters() {
  const res = await api.get("/shelters");
  const list = res.data?.shelters || [];
  return list.map(normalizeShelter);
}

export async function getShelterById(id) {
  const res = await api.get(`/shelters/${id}`);
  return normalizeShelter(res.data?.shelter);
}

export async function updateShelter(id, updates) {
  const res = await api.put(`/shelters/${id}`, updates);
  return normalizeShelter(res.data?.shelter);
}
