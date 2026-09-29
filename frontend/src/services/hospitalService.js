import api from "../api/axiosClient";

function normalizeHospital(h) {
  if (!h) return h;
  return {
    ...h,
    id: h.id || h._id,
    distanceKm: h.distanceKm || 3.5, // Default distance calculation fallback
  };
}

export async function getNearbyHospitals() {
  const res = await api.get("/hospitals");
  const list = res.data?.hospitals || [];
  return list.map(normalizeHospital);
}

export async function getHospitalById(id) {
  const res = await api.get(`/hospitals/${id}`);
  return normalizeHospital(res.data?.hospital);
}

export async function updateHospital(id, updates) {
  const res = await api.put(`/hospitals/${id}`, updates);
  return normalizeHospital(res.data?.hospital);
}
