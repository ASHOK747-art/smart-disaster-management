export const MOCK_ALERTS = [
  {
    id: "AL-2041",
    type: "Flood",
    location: "Adyar, Chennai District",
    severity: "High",
    status: "Active",
    issuedAt: "2026-08-26T04:10:00+05:30",
    description: "Water levels in the Adyar river have crossed the danger mark following continuous rainfall.",
  },
  {
    id: "AL-2040",
    type: "Cyclone",
    location: "Nagapattinam Coastal Belt",
    severity: "Critical",
    status: "Active",
    issuedAt: "2026-08-26T02:40:00+05:30",
    description: "Cyclone Vardah tracking toward the coast, expected landfall within 18 hours.",
  },
  {
    id: "AL-2036",
    type: "Landslide",
    location: "Nilgiris Hills, Sector 4",
    severity: "Medium",
    status: "Monitoring",
    issuedAt: "2026-08-25T19:15:00+05:30",
    description: "Loose soil detected after prolonged rain; slopes under active monitoring.",
  },
  {
    id: "AL-2028",
    type: "Fire",
    location: "Guindy Industrial Estate",
    severity: "Low",
    status: "Resolved",
    issuedAt: "2026-08-24T11:05:00+05:30",
    description: "Warehouse fire contained by local fire services; no injuries reported.",
  },
];

export const RISK_SUMMARY = {
  areaLabel: "Chennai District",
  overallRisk: 74,
  overallCategory: "High",
  weather: "Heavy Rain, 27°C",
};
