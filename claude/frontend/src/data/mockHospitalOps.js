export const MOCK_HOSPITAL_PROFILE = {
  id: "H-01",
  name: "Government General Hospital",
  location: "Park Town, Chennai",
  status: "OPEN", // OPEN | LIMITED | FULL
  availableBeds: 42,
  icuBeds: 6,
  emergencyCapacity: 15,
};

export const MOCK_MEDICAL_RESOURCES = [
  { id: "R-1", name: "Oxygen Cylinders", quantity: 38 },
  { id: "R-2", name: "Ventilators", quantity: 9 },
  { id: "R-3", name: "Blood Units (O+)", quantity: 24 },
  { id: "R-4", name: "IV Fluid Packs", quantity: 120 },
];

export const MOCK_EMERGENCY_REQUESTS = [
  {
    id: "ER-801",
    incidentType: "Flood Rescue",
    incidentLocation: "Velachery Main Road, Chennai",
    patientCount: 4,
    severity: "Critical",
    etaMinutes: 12,
    requiredTreatment: "Trauma care, hypothermia monitoring",
    status: "Pending",
  },
  {
    id: "ER-799",
    incidentType: "Building Collapse",
    incidentLocation: "T. Nagar, Chennai",
    patientCount: 2,
    severity: "High",
    etaMinutes: 25,
    requiredTreatment: "Orthopedic assessment, wound care",
    status: "Pending",
  },
  {
    id: "ER-795",
    incidentType: "Road Accident",
    incidentLocation: "Kathipara Junction, Chennai",
    patientCount: 3,
    severity: "Medium",
    etaMinutes: 8,
    requiredTreatment: "General trauma evaluation",
    status: "Accepted",
  },
  {
    id: "ER-788",
    incidentType: "Fire Injury",
    incidentLocation: "Anna Nagar, Chennai",
    patientCount: 1,
    severity: "Low",
    etaMinutes: 40,
    requiredTreatment: "Burn treatment",
    status: "Rejected",
  },
];
