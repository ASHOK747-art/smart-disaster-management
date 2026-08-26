/**
 * authService
 * MOCK implementation. Every function returns a Promise so call sites don't
 * need to change when this is swapped for real API calls (see README).
 */

const MOCK_DELAY = 500;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY));
}

export function login({ identifier, password, role }) {
  if (!identifier || !password) {
    return Promise.reject(new Error("Email/phone and password are required."));
  }
  return delay({
    user: {
      id: "u-1001",
      name: "Demo User",
      identifier,
      role,
    },
    token: "mock-token",
  });
}

export function register(payload) {
  if (!payload.email || !payload.password) {
    return Promise.reject(new Error("Email and password are required."));
  }
  return delay({
    user: {
      id: "u-1002",
      name: payload.fullName,
      email: payload.email,
      role: payload.role,
    },
    token: "mock-token",
  });
}

export function logout() {
  return delay({ success: true });
}
