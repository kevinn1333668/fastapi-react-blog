import { getStoredToken } from "./auth";

const API_BASE = "http://127.0.0.1:8000";

export async function postsLoader() {
  const res = await fetch(`${API_BASE}/posts`);

  if (!res.ok) {
    const err = new Error("Failed to fetch posts");
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.items ?? [];
}

export async function createPost(content, isPublished = true, imageUrls = []) {
  const token = getStoredToken();

  const res = await fetch(`${API_BASE}/admin/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ← ключевой момент
    },
    body: JSON.stringify({
      content,
      image_urls: imageUrls,
      is_published: isPublished,
    }),
  });

  if (!res.ok) {
    const err = new Error("Failed to create post");
    err.status = res.status;
    if (res.status === 401) {
      err.detail = "Не авторизован. Пожалуйста, войдите снова.";
    } else {
      try {
        const data = await res.json();
        err.detail = data.detail;
      } catch {
        /* ignore */
      }
    }
    throw err;
  }

  return res.json();
}
