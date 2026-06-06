import { redirect } from "react-router-dom";
import { deleteQuiz } from "../api/quizzes";
import { getStoredToken, clearSession } from "../api/auth";
import { AuthError, ForbiddenError } from "../api/client";
import { ensureAdminAccess, markAdminForbidden } from "../api/guards";

export async function deleteQuizAction({ request }) {
  ensureAdminAccess();

  if (!getStoredToken()) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const quizId = formData.get("quiz_id");

  const confirmed = confirm("Удалить этот тест?");
  if (!confirmed) {
    return redirect("/settings/quizzes");
  }

  try {
    await deleteQuiz(quizId);
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
    return { error: "Ошибка при удалении теста" };
  }
}
