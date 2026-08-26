import { HAZARD_RISKS, RISK_FACTORS, RISK_TREND } from "../data/mockRiskData";
import { RISK_SUMMARY } from "../data/mockAlerts";

const DELAY = 400;
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), DELAY));

export function getOverallRisk() {
  return wait(RISK_SUMMARY);
}

export function getHazardRisks() {
  return wait(HAZARD_RISKS);
}

export function getRiskFactors() {
  return wait(RISK_FACTORS);
}

export function getRiskTrend() {
  return wait(RISK_TREND);
}
