import { MOCK_INCIDENTS } from "../data/mockIncidents";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getMyIncidents() {
  return wait(MOCK_INCIDENTS);
}

export function getIncidentById(id) {
  const incident = MOCK_INCIDENTS.find((i) => i.id === id);
  return incident ? wait(incident) : Promise.reject(new Error("Incident not found."));
}

export function submitIncident(payload) {
  const newIncident = {
    id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "Reported",
    assignedTeam: null,
    reportedAt: new Date().toISOString(),
    ...payload,
  };
  return wait(newIncident);
}
