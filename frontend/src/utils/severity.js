/**
 * Maps domain severity/status strings to the StatusBadge "tone" prop,
 * so every card in the app shows consistent color semantics.
 */
// Used by the emergency reporting form's severity selector, in ascending order.
export const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

const SEVERITY_TONE = {
  critical: "critical",
  high: "critical",
  medium: "warning",
  low: "safe",
};

const STATUS_TONE = {
  active: "critical",
  "rescue in progress": "critical",
  "rescue assigned": "warning",
  verified: "warning",
  monitoring: "warning",
  reported: "info",
  resolved: "safe",
  open: "safe",
  available: "safe",
  limited: "warning",
  full: "critical",
  // Rescue team mission pipeline (distinct from the citizen-facing incident pipeline above)
  assigned: "info",
  accepted: "warning",
  "en route": "warning",
  "on scene": "critical",
  "rescue completed": "safe",
};

export function severityTone(severity) {
  return SEVERITY_TONE[(severity || "").toLowerCase()] || "neutral";
}

export function statusTone(status) {
  return STATUS_TONE[(status || "").toLowerCase()] || "neutral";
}

export function shouldPulse(severityOrStatus) {
  const v = (severityOrStatus || "").toLowerCase();
  return v === "critical" || v === "active" || v === "rescue in progress" || v === "on scene";
}
