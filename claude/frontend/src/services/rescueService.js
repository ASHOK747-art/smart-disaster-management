import { MOCK_MISSIONS } from "../data/mockMissions";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

// Held in module scope so status changes persist for the rest of the session
// (mock only — resets on page reload since there's no backend yet).
let missions = MOCK_MISSIONS.map((m) => ({ ...m }));

export function getMissions() {
  return wait(missions.map((m) => ({ ...m })));
}

export function updateMissionStatus(id, status) {
  missions = missions.map((m) => (m.id === id ? { ...m, status } : m));
  const updated = missions.find((m) => m.id === id);
  return wait(updated ? { ...updated } : null);
}
