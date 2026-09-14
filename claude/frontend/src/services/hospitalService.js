import { MOCK_HOSPITALS } from "../data/mockHospitals";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getNearbyHospitals() {
  return wait(MOCK_HOSPITALS);
}
