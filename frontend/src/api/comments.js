import { apiFetch } from "./client";

function makeApiError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function fetchComments(postId) {
  const res = await apiFetch(`/posts/${postId}/comments`);
  if (!res.ok) {
    throw makeApiError("Failed to fetch comments", res.status);
  }
  return res.json();
}

export async function createComment(postId, content) {
  const res = await apiFetch(`/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw makeApiError("Failed to create comment", res.status);
  }

  return res.json();
}

export async function updateComment(commentId, content) {
  const res = await apiFetch(`/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw makeApiError("Failed to update comment", res.status);
  }

  return res.json();
}

export async function deleteComment(commentId) {
  const res = await apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw makeApiError("Failed to delete comment", res.status);
  }

  return true;
}
