import {
  ADMIN_STATISTICS,
  RESCUE_RESPONSE_TIME,
} from "../data/mockAdminStats";
import { MOCK_HOSPITALS } from "../data/mockHospitals";
import { MOCK_SHELTERS } from "../data/mockShelters";
import { getAdminStats } from "./incidentService";

export async function getAdminOverview() {
  // Incident-derived numbers now come from the real MongoDB collection;
  // hospital/shelter/rescue-team resource data stays mocked until those
  // modules are built (out of scope for this task).
  const stats = await getAdminStats();

  return {
    statistics: {
      activeDisasters: stats.activeDisasters,
      activeIncidents: stats.activeIncidents,
      rescueTeams: ADMIN_STATISTICS.rescueTeams,
      volunteers: ADMIN_STATISTICS.volunteers,
      hospitals: MOCK_HOSPITALS.length,
      shelters: MOCK_SHELTERS.length,
      peopleAffected: stats.peopleAffected,
    },
    incidentsOverTime: stats.incidentsOverTime,
    disasterTypes: stats.disasterTypes,
    severityDistribution: stats.severityDistribution,
    rescueResponseTime: RESCUE_RESPONSE_TIME,
    hospitalCapacity: MOCK_HOSPITALS.map((h) => ({ name: h.name.split(" ").slice(0, 2).join(" "), availableBeds: h.availableBeds })),
    shelterOccupancy: MOCK_SHELTERS.map((s) => ({
      name: s.name.split(" ").slice(0, 2).join(" "),
      occupancyPct: Math.round((s.occupied / s.capacity) * 100),
    })),
  };
}