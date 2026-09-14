import { MOCK_VOLUNTEER_PROFILE, MOCK_VOLUNTEER_TASKS } from "../data/mockVolunteer";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

let tasks = MOCK_VOLUNTEER_TASKS.map((t) => ({ ...t }));

export function getVolunteerProfile() {
  return wait({ ...MOCK_VOLUNTEER_PROFILE });
}

export function getVolunteerTasks() {
  return wait(tasks.map((t) => ({ ...t })));
}

export function updateTaskStatus(id, status) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, status } : t));
  const updated = tasks.find((t) => t.id === id);
  return wait(updated ? { ...updated } : null);
}
