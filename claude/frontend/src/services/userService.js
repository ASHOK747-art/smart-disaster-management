import { MOCK_PROFILE } from "../data/mockUser";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

// Held in module scope so edits persist for the rest of the session (mock only —
// resets on page reload since there's no backend yet).
let currentProfile = { ...MOCK_PROFILE };

export function getProfile() {
  return wait({ ...currentProfile });
}

export function updateProfile(updates) {
  currentProfile = { ...currentProfile, ...updates };
  return wait({ ...currentProfile });
}
