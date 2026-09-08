export const MOCK_VOLUNTEER_PROFILE = {
  id: "vol-7001",
  name: "Demo Volunteer",
  location: "Adyar, Chennai",
  availability: "Full-time",
  skills: ["First aid", "Swimming", "Driving", "Crowd management"],
};

// PRIORITY follows the same vocabulary as incident severity so StatusBadge/severityTone
// colors stay consistent across the app.
export const MOCK_VOLUNTEER_TASKS = [
  {
    id: "VT-601",
    location: "Velachery, Chennai",
    latitude: 12.9791,
    longitude: 80.2211,
    requiredHelp: "Distributing food and water at the relief camp",
    peopleAffected: 40,
    priority: "Critical",
    distanceKm: 2.1,
    status: "Available",
  },
  {
    id: "VT-602",
    location: "T. Nagar, Chennai",
    latitude: 13.0418,
    longitude: 80.2341,
    requiredHelp: "Helping elderly residents evacuate to the shelter",
    peopleAffected: 8,
    priority: "High",
    distanceKm: 4.6,
    status: "Available",
  },
  {
    id: "VT-598",
    location: "Adyar, Chennai",
    latitude: 13.0012,
    longitude: 80.2565,
    requiredHelp: "Sorting donated clothing and supplies at the collection center",
    peopleAffected: 0,
    priority: "Medium",
    distanceKm: 1.2,
    status: "Accepted",
  },
  {
    id: "VT-590",
    location: "Anna Nagar, Chennai",
    latitude: 13.0850,
    longitude: 80.2101,
    requiredHelp: "Assisted with first aid station at the community shelter",
    peopleAffected: 15,
    priority: "Medium",
    distanceKm: 6.3,
    status: "Completed",
  },
];
