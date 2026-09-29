import api from "../api/axiosClient";

export async function getRiskPredictionData() {
  const res = await api.get("/predictions/risk");
  return res.data;
}

export async function getOverallRisk() {
  const data = await getRiskPredictionData();
  if (!data.hasData) return null;
  return data.data.overall;
}

export async function getHazardRisks() {
  const data = await getRiskPredictionData();
  if (!data.hasData) return [];
  return data.data.hazards;
}

export async function getRiskFactors() {
  const data = await getRiskPredictionData();
  if (!data.hasData) return [];
  return data.data.factors;
}

export async function getRiskTrend() {
  const data = await getRiskPredictionData();
  if (!data.hasData) return [];
  return data.data.trend;
}
