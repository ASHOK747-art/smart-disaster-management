import api from "../api/axiosClient";

/**
 * Real authService connecting to backend Express endpoints.
 */

export async function login({ identifier, password }) {
  const response = await api.post("/auth/login", { identifier, password });
  return response.data;
}

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return { success: true };
}
