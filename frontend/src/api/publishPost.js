import { createPost } from "./posts";
import { uploadImage } from "./uploads";

export async function publishNewPost({ content, files = [] }) {
  const imageUrls = [];
  for (const file of files) {
    const fileUrl = await uploadImage(file);
    imageUrls.push(fileUrl);
  }

  return createPost(content || null, true, imageUrls);
}
