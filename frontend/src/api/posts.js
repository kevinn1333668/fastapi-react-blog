import { getStoredToken } from "./auth";

export const API_BASE = "http://127.0.0.1:8000";

export async function fetchPostsPage({ limit = 10, offset = 0 } = {}) {
  const url = new URL(`${API_BASE}/posts`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error("Failed to fetch posts");
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function homePostsLoader() {
  return fetchPostsPage({ limit: 10, offset: 0 });
}

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

export async function deletePost(postId) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE}/admin/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error("Failed to delete post");
    error.status = response.status;
    throw error;
  }

  return true;
}
