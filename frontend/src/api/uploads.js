import { getStoredToken } from "./auth";
import { API_BASE } from "./posts";

export async function uploadImage(file) {
  const token = getStoredToken();
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE}/admin/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  if (!res.ok) {
    const err = new Error("Failed to upload image");
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

  const data = await res.json();
  return data.file_url;
}
