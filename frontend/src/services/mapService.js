import { getPublicIncidents } from "./incidentService";
import { MOCK_INCIDENTS } from "../data/mockIncidents";
import { MOCK_HOSPITALS } from "../data/mockHospitals";
import { MOCK_SHELTERS } from "../data/mockShelters";
import { MOCK_RESCUE_TEAMS, MOCK_VOLUNTEERS } from "../data/mockRescueTeams";

export async function getMapData() {
  let liveIncidents = [];
  try {
    liveIncidents = await getPublicIncidents();
  } catch (err) {
    console.warn("Could not fetch live incidents from backend, using fallback:", err);
  }

  const validLiveIncidents = liveIncidents.filter(
    (i) =>
      typeof i.latitude === "number" &&
      !isNaN(i.latitude) &&
      typeof i.longitude === "number" &&
      !isNaN(i.longitude)
  );

  const incidents = validLiveIncidents.length > 0 ? validLiveIncidents : MOCK_INCIDENTS;

  return {
    incidents,
    hospitals: MOCK_HOSPITALS,
    shelters: MOCK_SHELTERS,
    rescueTeams: MOCK_RESCUE_TEAMS,
    volunteers: MOCK_VOLUNTEERS,
  };
}
