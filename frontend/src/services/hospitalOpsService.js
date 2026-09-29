import api from "../api/axiosClient";
import { MOCK_EMERGENCY_REQUESTS, MOCK_MEDICAL_RESOURCES } from "../data/mockHospitalOps";

function normalizeHospital(h) {
  if (!h) return h;
  return {
    ...h,
    id: h.id || h._id,
  };
}

let mockResources = MOCK_MEDICAL_RESOURCES.map((r) => ({ ...r }));
let mockRequests = MOCK_EMERGENCY_REQUESTS.map((r) => ({ ...r }));

export async function getHospitalOverview() {
  try {
    const res = await api.get("/hospitals/my/profile");
    const hospital = normalizeHospital(res.data?.hospital);
    if (hospital) {
      const resources = hospital.resources && hospital.resources.length > 0 ? hospital.resources : mockResources;
      return {
        profile: hospital,
        resources,
        requests: mockRequests,
      };
    }
  } catch (err) {
    console.warn("Using fallback profile for hospital overview:", err);
  }

  // Fallback to list first item if profile endpoint fails or not assigned
  try {
    const resList = await api.get("/hospitals");
    const first = normalizeHospital(resList.data?.hospitals?.[0]);
    if (first) {
      return {
        profile: first,
        resources: first.resources && first.resources.length > 0 ? first.resources : mockResources,
        requests: mockRequests,
      };
    }
  } catch (err) {
    console.error("Failed to fetch hospital overview:", err);
  }

  return {
    profile: null,
    resources: [],
    requests: [],
  };
}

export async function updateHospitalProfile(id, updates) {
  const res = await api.put(`/hospitals/${id}`, updates);
  return normalizeHospital(res.data?.hospital);
}

export async function updateResourceQuantity(hospitalId, currentResources, resourceId, delta) {
  const updatedResources = currentResources.map((r) =>
    r.id === resourceId ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r
  );
  const res = await api.put(`/hospitals/${hospitalId}`, { resources: updatedResources });
  const hospital = normalizeHospital(res.data?.hospital);
  return hospital.resources;
}

export function respondToRequest(id, status) {
  mockRequests = mockRequests.map((r) => (r.id === id ? { ...r, status } : r));
  const updated = mockRequests.find((r) => r.id === id);
  return Promise.resolve(updated ? { ...updated } : null);
}
