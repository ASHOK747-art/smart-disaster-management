import { MOCK_ALERTS, RISK_SUMMARY } from "../data/mockAlerts";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getActiveAlerts() {
  return wait(MOCK_ALERTS);
}

export function getRiskSummary() {
  return wait(RISK_SUMMARY);
}
