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
