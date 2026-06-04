import { redirect } from "react-router-dom";
import { updatePost } from "../api/posts";
import { uploadImage } from "../api/uploads";
import { getStoredToken, clearSession } from "../api/auth";
import { AuthError, ForbiddenError } from "../api/client";
import { ensureAdminAccess, markAdminForbidden } from "../api/guards";

export async function changePostAction({ request }) {
  ensureAdminAccess();

  if (!getStoredToken()) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const postId = formData.get("post_id");

  if (!postId) {
    return redirect("/settings");
  }

  const content = (formData.get("content") || "").toString().trim();
  const isPublished = formData.get("is_published") === "on";

  let keptUrls = [];
  try {
    keptUrls = JSON.parse(formData.get("image_urls") || "[]");
  } catch {
    keptUrls = [];
  }

  if (!Array.isArray(keptUrls)) {
    keptUrls = [];
  }

  const files = formData
    .getAll("images")
    .filter((f) => f instanceof Blob && f.size > 0);

  if (!content && keptUrls.length === 0 && files.length === 0) {
    return { error: "Добавьте текст или хотя бы одно фото" };
  }

  try {
    const newUrls = [];
    for (const file of files) {
      const fileUrl = await uploadImage(file);
      newUrls.push(fileUrl);
    }

    await updatePost(postId, {
      content: content || null,
      isPublished,
      imageUrls: [...keptUrls, ...newUrls],
    });

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
    return { error: err.detail || "Ошибка при сохранении поста" };
  }
}
