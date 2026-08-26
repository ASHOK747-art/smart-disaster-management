import { MOCK_SHELTERS } from "../data/mockShelters";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getNearbyShelters() {
  return wait(MOCK_SHELTERS);
}
