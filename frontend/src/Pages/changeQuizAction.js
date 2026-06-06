import { redirect } from "react-router-dom";
import { updateQuiz } from "../api/quizzes";
import { getStoredToken, clearSession } from "../api/auth";
import { AuthError, ForbiddenError } from "../api/client";
import { ensureAdminAccess, markAdminForbidden } from "../api/guards";
import { buildSchemaJson, validateQuizForm } from "../utils/quizSchema";

export async function changeQuizAction({ request }) {
  ensureAdminAccess();

  if (!getStoredToken()) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const quizId = formData.get("quiz_id");

  if (!quizId) {
    return redirect("/settings/quizzes");
  }

  const title = (formData.get("title") || "").toString();
  const topic = (formData.get("topic") || "").toString();
  const description = (formData.get("description") || "").toString();
  const isPublished = formData.get("is_published") === "true";

  let questions = [];
  try {
    questions = JSON.parse(formData.get("questions_json") || "[]");
  } catch {
    return { error: "Некорректные данные вопросов" };
  }

  const validationError = validateQuizForm({ title, questions });
  if (validationError) {
    return { error: validationError };
  }

  try {
    await updateQuiz(quizId, {
      title: title.trim(),
      topic: topic.trim() || null,
      description: description.trim() || "",
      schema_json: buildSchemaJson(questions),
      is_published: isPublished,
    });

    return redirect("/settings/quizzes");
  } catch (err) {
    if (err instanceof AuthError || err?.code === "UNAUTHORIZED" || err.status === 401) {
      clearSession();
      return redirect("/login");
    }
    if (err instanceof ForbiddenError || err?.code === "FORBIDDEN" || err.status === 403) {
      markAdminForbidden();
      return redirect("/");
    }
    return { error: err.detail || "Ошибка при сохранении теста" };
  }
}
