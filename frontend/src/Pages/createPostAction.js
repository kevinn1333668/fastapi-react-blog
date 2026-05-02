//createPostAction.js
import { redirect } from "react-router-dom";
import { createPost } from "../api/posts";
import { getStoredToken, clearToken } from "../api/auth";

export async function createPostAction({ request }) {
  const token = getStoredToken();

  if (!token) {
    return redirect("/admin");
  }

  const formData = await request.formData();
  const content = formData.get("content");
  const isPublished = formData.get("is_published") === "on";

  try {
    await createPost(content, isPublished);
    return redirect("/settings");
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      return redirect("/admin");
    }
    return { error: err.detail || "Ошибка при создании поста" };
  }
}
