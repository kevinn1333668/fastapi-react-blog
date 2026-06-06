import { redirect } from "react-router-dom";
import { apiFetch } from "./client";
import { ensureAdminAccess, handleApiGuardError, isAdminUser } from "./guards";
import { getStoredToken } from "./auth";

export async function fetchPublishedQuizzes() {
  const res = await apiFetch("/quizzes");
  if (!res.ok) {
    const err = new Error("Failed to fetch quizzes");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchQuizForUser(quizId) {
  const res = await apiFetch(`/quizzes/${quizId}`);
  if (!res.ok) {
    const err = new Error("Failed to fetch quiz");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function submitQuiz(quizId, answers) {
  const res = await apiFetch(`/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const err = new Error("Failed to submit quiz");
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

export async function fetchAdminQuizzes() {
  const res = await apiFetch("/admin/quizzes");
  if (!res.ok) {
    const err = new Error("Failed to fetch admin quizzes");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function fetchAdminQuizById(quizId) {
  const res = await apiFetch(`/admin/quizzes/${quizId}`, { method: "POST" });
  if (!res.ok) {
    const err = new Error("Failed to fetch quiz");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function createQuiz(payload) {
  const res = await apiFetch("/admin/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = new Error("Failed to create quiz");
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

export async function updateQuiz(quizId, payload) {
  const res = await apiFetch(`/admin/quizzes/${quizId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = new Error("Failed to update quiz");
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

export async function deleteQuiz(quizId) {
  const res = await apiFetch(`/admin/quizzes/${quizId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = new Error("Failed to delete quiz");
    err.status = res.status;
    throw err;
  }
  return true;
}

export async function quizzesLoader() {
  if (!getStoredToken()) {
    throw redirect("/login");
  }
  if (isAdminUser()) {
    throw redirect("/settings/quizzes");
  }
  try {
    return await fetchPublishedQuizzes();
  } catch (err) {
    handleApiGuardError(err);
  }
}

export async function quizTakeLoader({ params }) {
  if (!getStoredToken()) {
    throw redirect("/login");
  }
  if (isAdminUser()) {
    throw redirect("/settings/quizzes");
  }
  try {
    return await fetchQuizForUser(params.id);
  } catch (err) {
    if (err.status === 404) {
      throw redirect("/quizzes");
    }
    handleApiGuardError(err);
  }
}

export async function adminQuizzesLoader() {
  ensureAdminAccess();
  try {
    return await fetchAdminQuizzes();
  } catch (err) {
    handleApiGuardError(err);
  }
}

export async function changeQuizLoader({ request }) {
  ensureAdminAccess();
  const url = new URL(request.url);
  const quizId = url.searchParams.get("quizId");

  if (!quizId) {
    throw redirect("/settings/quizzes");
  }

  try {
    return await fetchAdminQuizById(quizId);
  } catch (err) {
    if (err.status === 404) {
      throw redirect("/settings/quizzes");
    }
    handleApiGuardError(err);
  }
}
