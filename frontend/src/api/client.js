import { API_BASE, getStoredToken, clearSession } from "./auth";

export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
    this.name = "ForbiddenError";
    this.code = "FORBIDDEN";
  }
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  if (!token) {
    throw new AuthError("NO_TOKEN");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearSession();
    throw new AuthError("UNAUTHORIZED");
  }

  if (res.status === 403) {
    throw new ForbiddenError();
  }

  return res;
}
