export const API_BASE = "http://127.0.0.1:8000";

export const ACCESS_TOKEN_KEY = "access_token";
export const USER_KEY = "user";

export function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession({ access_token, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** @deprecated use setSession */
export function setStoredToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** @deprecated use clearSession */
export function clearToken() {
  clearSession();
}

export function authHeaders() {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!res.ok) {
    const err = new Error("Login failed");
    err.status = res.status;
    try {
      const data = await res.json();
      err.detail = data.detail;
    } catch {
      /* ignore */
    }
    throw err;
  }

  return res.json();
}

export async function register(username, password) {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = new Error("Register failed");
    err.status = res.status;
    try {
      const data = await res.json();
      err.detail = data.detail;
    } catch {
      /* ignore */
    }
    throw err;
  }

  return res.json();
}

export async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = new Error("fetchMe failed");
    err.status = res.status;
    throw err;
  }

  return res.json();
}
