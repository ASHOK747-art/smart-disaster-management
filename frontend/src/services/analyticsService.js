import api from "../api/axiosClient";

export async function getAnalyticsOverview() {
  const res = await api.get("/analytics/overview");
  return res.data;
}
