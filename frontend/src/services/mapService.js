import { getPublicIncidents } from "./incidentService";
import { getNearbyHospitals } from "./hospitalService";
import { getNearbyShelters } from "./shelterService";
import { getRescueTeams } from "./rescueTeamService";
import { MOCK_INCIDENTS } from "../data/mockIncidents";
import { MOCK_HOSPITALS } from "../data/mockHospitals";
import { MOCK_SHELTERS } from "../data/mockShelters";
import { MOCK_RESCUE_TEAMS, MOCK_VOLUNTEERS } from "../data/mockRescueTeams";

export async function getMapData() {
  let liveIncidents = [];
  let liveHospitals = [];
  let liveShelters = [];
  let liveRescueTeams = [];

  try {
    liveIncidents = await getPublicIncidents();
  } catch (err) {
    console.warn("Could not fetch live incidents from backend, using fallback:", err);
  }

  try {
    liveHospitals = await getNearbyHospitals();
  } catch (err) {
    console.warn("Could not fetch live hospitals from backend, using fallback:", err);
  }

  try {
    liveShelters = await getNearbyShelters();
  } catch (err) {
    console.warn("Could not fetch live shelters from backend, using fallback:", err);
  }

  try {
    liveRescueTeams = await getRescueTeams();
  } catch (err) {
    console.warn("Could not fetch live rescue teams from backend, using fallback:", err);
  }

  const validLiveIncidents = liveIncidents.filter(
    (i) =>
      typeof i.latitude === "number" &&
      !isNaN(i.latitude) &&
      typeof i.longitude === "number" &&
      !isNaN(i.longitude)
  );

  const incidents = validLiveIncidents.length > 0 ? validLiveIncidents : MOCK_INCIDENTS;
  const hospitals = liveHospitals.length > 0 ? liveHospitals : MOCK_HOSPITALS;
  const shelters = liveShelters.length > 0 ? liveShelters : MOCK_SHELTERS;
  const rescueTeams = liveRescueTeams.length > 0 ? liveRescueTeams : MOCK_RESCUE_TEAMS;

  return {
    incidents,
    hospitals,
    shelters,
    rescueTeams,
    volunteers: MOCK_VOLUNTEERS,
  };
}
