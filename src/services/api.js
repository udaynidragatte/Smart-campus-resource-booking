const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "campusfix_token";
const USER_KEY = "campusfix_user";

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) return null;

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const session = getStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  login(payload) {
    return request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  },
  register(payload) {
    return request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },
  me() {
    return request("/auth/me");
  },
  resources(params = {}) {
    const search = new URLSearchParams(params).toString();
    return request(`/resources${search ? `?${search}` : ""}`);
  },
  resourceSummary() {
    return request("/resources/summary");
  },
  bookings(params = {}) {
    const search = new URLSearchParams(params).toString();
    return request(`/bookings${search ? `?${search}` : ""}`);
  },
  createBooking(payload) {
    return request("/bookings", { method: "POST", body: JSON.stringify(payload) });
  },
  updateBookingStatus(id, payload) {
    return request(`/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  cancelBooking(id) {
    return request(`/bookings/${id}`, { method: "DELETE" });
  },
  analyticsOverview() {
    return request("/analytics/overview");
  },
  principal() {
    return request("/campus/principal");
