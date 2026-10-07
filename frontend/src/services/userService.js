import api from "../api/axiosClient";
import { MOCK_PROFILE } from "../data/mockUser";

function normalizeUser(u) {
  if (!u) return u;
  return {
    ...u,
    id: u.id || u._id,
  };
}

// User Profile methods
let currentProfile = { ...MOCK_PROFILE };

export function getProfile() {
  return Promise.resolve({ ...currentProfile });
}

export function updateProfile(updates) {
  currentProfile = { ...currentProfile, ...updates };
  return Promise.resolve({ ...currentProfile });
}

// Admin User Management API methods
export async function getUsers() {
  const res = await api.get("/users");
  const list = res.data?.users || [];
  return list.map(normalizeUser);
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return normalizeUser(res.data?.user);
}

export async function updateUser(id, updates) {
  const res = await api.put(`/users/${id}`, updates);
  return normalizeUser(res.data?.user);
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}
