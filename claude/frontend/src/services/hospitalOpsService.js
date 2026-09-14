import { MOCK_HOSPITAL_PROFILE, MOCK_MEDICAL_RESOURCES, MOCK_EMERGENCY_REQUESTS } from "../data/mockHospitalOps";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

let profile = { ...MOCK_HOSPITAL_PROFILE };
let resources = MOCK_MEDICAL_RESOURCES.map((r) => ({ ...r }));
let requests = MOCK_EMERGENCY_REQUESTS.map((r) => ({ ...r }));

export function getHospitalOverview() {
  return wait({
    profile: { ...profile },
    resources: resources.map((r) => ({ ...r })),
    requests: requests.map((r) => ({ ...r })),
  });
}

export function updateHospitalProfile(updates) {
  profile = { ...profile, ...updates };
  return wait({ ...profile });
}

export function updateResourceQuantity(id, delta) {
  resources = resources.map((r) => (r.id === id ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r));
  return wait(resources.map((r) => ({ ...r })));
}

export function respondToRequest(id, status) {
  requests = requests.map((r) => (r.id === id ? { ...r, status } : r));
  const updated = requests.find((r) => r.id === id);
  return wait(updated ? { ...updated } : null);
}
