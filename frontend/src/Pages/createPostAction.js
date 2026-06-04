//createPostAction.js
import { redirect } from "react-router-dom";
import { createPost } from "../api/posts";
import { uploadImage } from "../api/uploads";
import { getStoredToken, clearToken } from "../api/auth";

export async function createPostAction({ request }) {
  const token = getStoredToken();

  if (!token) {
    return redirect("/admin");
  }

  const formData = await request.formData();
  const content = (formData.get("content") || "").toString().trim();
  const isPublished = formData.get("is_published") === "on";
  const files = formData
    .getAll("images")
    .filter((f) => f instanceof Blob && f.size > 0);

  if (!content && files.length === 0) {
    return { error: "Добавьте текст или хотя бы одно фото" };
  }

  try {
    const imageUrls = [];
    for (const file of files) {
      const fileUrl = await uploadImage(file);
      imageUrls.push(fileUrl);
    }

    await createPost(content || null, isPublished, imageUrls);
    return redirect("/settings");
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      return redirect("/admin");
    }
    return { error: err.detail || "Ошибка при создании поста" };
  }
}
