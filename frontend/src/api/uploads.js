import { apiFetch } from "./client";

export async function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);

  const res = await apiFetch("/admin/uploads/image", {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const err = new Error("Failed to upload image");
    err.status = res.status;
    try {
      const data = await res.json();
      err.detail = data.detail;
    } catch {
      /* ignore */
    }
    throw err;
  }

  const data = await res.json();
  return data.file_url;
}
