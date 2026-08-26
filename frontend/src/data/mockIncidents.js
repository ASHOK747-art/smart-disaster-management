export const INCIDENT_STAGES = [
  "Reported",
  "Verified",
  "Rescue Assigned",
  "Rescue In Progress",
  "Resolved",
];

// Used by the emergency reporting form's type selector.
export const INCIDENT_TYPES = [
  "Flood",
  "Fire",
  "Building Collapse",
  "Landslide",
  "Cyclone",
  "Accident",
  "Medical Emergency",
  "Other",
];

export const MOCK_INCIDENTS = [
  {
    id: "INC-1032",
    type: "Flood",
    description: "Ground floor of residential block flooded, family of 4 stranded on terrace.",
    peopleAffected: 4,
    severity: "Critical",
    location: "Velachery Main Road, Chennai",
    reportedAt: "2026-08-26T03:20:00+05:30",
    status: "Rescue In Progress",
    assignedTeam: "RT-104",
  },
  {
    id: "INC-1028",
    type: "Building Collapse",
    description: "Partial wall collapse after heavy rain, no injuries but structure unstable.",
    peopleAffected: 2,
    severity: "High",
    location: "T. Nagar, Chennai",
    reportedAt: "2026-08-25T22:05:00+05:30",
    status: "Rescue Assigned",
    assignedTeam: "RT-098",
  },
  {
    id: "INC-1019",
    type: "Fire",
    description: "Kitchen fire in apartment complex, spreading to neighboring unit.",
    peopleAffected: 6,
    severity: "Medium",
    location: "Anna Nagar, Chennai",
    reportedAt: "2026-08-25T14:40:00+05:30",
    status: "Verified",
    assignedTeam: null,
  },
  {
    id: "INC-0987",
    type: "Accident",
    description: "Multi-vehicle collision on flooded underpass.",
    peopleAffected: 3,
    severity: "High",
    location: "Kathipara Junction, Chennai",
    reportedAt: "2026-08-24T09:12:00+05:30",
    status: "Resolved",
    assignedTeam: "RT-071",
  },
];
