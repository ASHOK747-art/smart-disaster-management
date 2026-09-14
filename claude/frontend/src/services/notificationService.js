import { MOCK_NOTIFICATIONS } from "../data/mockNotifications";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getNotifications() {
  // Return a fresh copy each time so callers can safely mutate read state locally.
  return wait(MOCK_NOTIFICATIONS.map((n) => ({ ...n })));
}
