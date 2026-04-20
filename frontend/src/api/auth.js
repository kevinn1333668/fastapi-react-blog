const API_BASE = "http://127.0.0.1:8000";

export const ACCESS_TOKEN_KEY = "access_token";

export function getStoredToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
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
