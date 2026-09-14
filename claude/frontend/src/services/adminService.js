import {
  ADMIN_STATISTICS,
  INCIDENTS_OVER_TIME,
  DISASTER_TYPE_DISTRIBUTION,
  SEVERITY_DISTRIBUTION,
  RESCUE_RESPONSE_TIME,
} from "../data/mockAdminStats";
import { MOCK_HOSPITALS } from "../data/mockHospitals";
import { MOCK_SHELTERS } from "../data/mockShelters";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getAdminOverview() {
  return wait({
    statistics: { ...ADMIN_STATISTICS },
    incidentsOverTime: INCIDENTS_OVER_TIME,
    disasterTypes: DISASTER_TYPE_DISTRIBUTION,
    severityDistribution: SEVERITY_DISTRIBUTION,
    rescueResponseTime: RESCUE_RESPONSE_TIME,
    hospitalCapacity: MOCK_HOSPITALS.map((h) => ({ name: h.name.split(" ").slice(0, 2).join(" "), availableBeds: h.availableBeds })),
    shelterOccupancy: MOCK_SHELTERS.map((s) => ({
      name: s.name.split(" ").slice(0, 2).join(" "),
      occupancyPct: Math.round((s.occupied / s.capacity) * 100),
    })),
  });
}
