import { redirect } from "react-router-dom";
import { deletePost } from "../api/posts";
import { getStoredToken, clearSession } from "../api/auth";
import { AuthError, ForbiddenError } from "../api/client";
import { ensureAdminAccess, markAdminForbidden } from "../api/guards";

export async function deletePostAction({ request }) {
  ensureAdminAccess();

  const token = getStoredToken();
  if (!token) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const postId = formData.get("post_id");

  const confirmed = confirm("Удалить этот пост?");
  if (!confirmed) {
    return redirect("/settings");
  }

  try {
    await deletePost(postId);
    return redirect("/settings");
  } catch (err) {
    if (err instanceof AuthError || err?.code === "UNAUTHORIZED" || err.status === 401) {
      clearSession();
      return redirect("/login");
    }
    if (err instanceof ForbiddenError || err?.code === "FORBIDDEN" || err.status === 403) {
      markAdminForbidden();
      return redirect("/");
    }
    return { error: "Ошибка при удалении поста" };
  }
}
