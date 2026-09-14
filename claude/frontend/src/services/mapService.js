import { MOCK_INCIDENTS } from "../data/mockIncidents";
import { MOCK_HOSPITALS } from "../data/mockHospitals";
import { MOCK_SHELTERS } from "../data/mockShelters";
import { MOCK_RESCUE_TEAMS, MOCK_VOLUNTEERS } from "../data/mockRescueTeams";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getMapData() {
  return wait({
    incidents: MOCK_INCIDENTS,
    hospitals: MOCK_HOSPITALS,
    shelters: MOCK_SHELTERS,
    rescueTeams: MOCK_RESCUE_TEAMS,
    volunteers: MOCK_VOLUNTEERS,
  });
}
