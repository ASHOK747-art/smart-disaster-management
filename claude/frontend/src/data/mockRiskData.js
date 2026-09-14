// Per-hazard breakdown and contributing factors for the AI Risk Prediction page.
// The overall district risk score itself lives in mockAlerts.js (RISK_SUMMARY)
// so the dashboard banner and this page always agree on the headline number.

export const HAZARD_RISKS = [
  { type: "Flood", risk: 82, category: "Critical" },
  { type: "Cyclone", risk: 68, category: "High" },
  { type: "Landslide", risk: 35, category: "Medium" },
  { type: "Fire", risk: 18, category: "Low" },
];

export const RISK_FACTORS = [
  { label: "Rainfall (24h)", value: "96 mm", weight: 88 },
  { label: "River Water Level", value: "4.2 m", weight: 79 },
  { label: "Wind Speed", value: "42 km/h", weight: 61 },
  { label: "Historical Incidents (30d)", value: "12 events", weight: 54 },
  { label: "Temperature", value: "27°C", weight: 22 },
];

export const RISK_TREND = [
  { day: "Mon", risk: 41 },
  { day: "Tue", risk: 48 },
  { day: "Wed", risk: 52 },
  { day: "Thu", risk: 59 },
  { day: "Fri", risk: 66 },
  { day: "Sat", risk: 70 },
  { day: "Sun", risk: 74 },
];
