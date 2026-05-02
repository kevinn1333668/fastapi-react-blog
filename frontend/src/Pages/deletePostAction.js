// Pages/deletePostAction.js
import { redirect } from "react-router-dom";
import { deletePost } from "../api/posts";
import { getStoredToken, clearToken } from "../api/auth";

export async function deletePostAction({ request }) {
  const token = getStoredToken();

  if (!token) {
    return redirect("/admin");
  }

  const formData = await request.formData();
  const postId = formData.get("post_id");

  // Подтверждение на клиенте
  const confirmed = confirm("Удалить этот пост?");
  if (!confirmed) {
    return redirect("/settings");
  }

  try {
    await deletePost(postId);
    return redirect("/settings");
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      return redirect("/admin");
    }
    return { error: "Ошибка при удалении поста" };
  }
}
