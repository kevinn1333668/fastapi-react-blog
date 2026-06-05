import { redirect } from "react-router-dom";
import { getStoredToken, getStoredUser, clearSession } from "./auth";
import { AuthError, ForbiddenError } from "./client";

export const ADMIN_FORBIDDEN_KEY = "admin_forbidden";

export function markAdminForbidden() {
  sessionStorage.setItem(ADMIN_FORBIDDEN_KEY, "1");
}

export function consumeAdminForbidden() {
  if (sessionStorage.getItem(ADMIN_FORBIDDEN_KEY)) {
    sessionStorage.removeItem(ADMIN_FORBIDDEN_KEY);
    return true;
  }
  return false;
}

export function isAdminUser() {
  return Boolean(getStoredUser()?.is_admin);
}

/** Для loaders/actions: нет токена → login, не админ → лента */
export function ensureAdminAccess() {
  if (!getStoredToken()) {
    throw redirect("/login");
  }
  if (!isAdminUser()) {
    markAdminForbidden();
    throw redirect("/");
  }
}

export function handleApiGuardError(err) {
  if (
    err instanceof AuthError ||
    err?.code === "NO_TOKEN" ||
    err?.code === "UNAUTHORIZED"
  ) {
    clearSession();
    throw redirect("/login");
  }

  if (err instanceof ForbiddenError || err?.code === "FORBIDDEN" || err?.status === 403) {
    markAdminForbidden();
    throw redirect("/");
  }

  throw err;
}
