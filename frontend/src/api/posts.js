import { redirect } from "react-router-dom";
import { API_BASE, getStoredToken } from "./auth";
import { apiFetch } from "./client";
import {
  ensureAdminAccess,
  handleApiGuardError,
  isAdminUser,
} from "./guards";

export { API_BASE };

export async function fetchPostsPage({ limit = 10, offset = 0 } = {}) {
  const url = new URL(`${API_BASE}/posts`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await apiFetch(url.pathname + url.search);
  if (!res.ok) {
    const err = new Error("Failed to fetch posts");
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function homePostsLoader() {
  if (!getStoredToken()) {
    throw redirect("/login");
  }
  if (isAdminUser()) {
    throw redirect("/settings");
  }
  try {
    return await fetchPostsPage({ limit: 10, offset: 0 });
  } catch (err) {
    handleApiGuardError(err);
  }
}

export async function adminPostsLoader() {
  ensureAdminAccess();
  try {
    const data = await fetchPostsPage({ limit: 50, offset: 0 });
    return data.items ?? [];
  } catch (err) {
    handleApiGuardError(err);
  }
}

/** @deprecated use adminPostsLoader for /settings */
export const postsLoader = adminPostsLoader;

export async function createPost(content, isPublished = true, imageUrls = []) {
  const res = await apiFetch("/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      image_urls: imageUrls,
      is_published: isPublished,
    }),
  });

  if (!res.ok) {
    const err = new Error("Failed to create post");
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

export async function fetchPostById(postId) {
  const res = await apiFetch(`/posts/${postId}`);
  if (!res.ok) {
    const err = new Error("Failed to fetch post");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function updatePost(
  postId,
  { content, isPublished, imageUrls },
) {
  const res = await apiFetch(`/admin/posts/${postId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      is_published: isPublished,
      image_urls: imageUrls,
    }),
  });

  if (!res.ok) {
    const err = new Error("Failed to update post");
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

export async function deletePost(postId) {
  const response = await apiFetch(`/admin/posts/${postId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = new Error("Failed to delete post");
    error.status = response.status;
    throw error;
  }

  return true;
}

export async function changePostLoader({ request }) {
  ensureAdminAccess();
  const url = new URL(request.url);
  const postId = url.searchParams.get("postId");

  if (!postId) {
    throw redirect("/settings");
  }

  try {
    return await fetchPostById(postId);
  } catch (err) {
    if (err.status === 404) {
      throw redirect("/settings");
    }
    handleApiGuardError(err);
  }
}
