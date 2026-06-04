import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { ImagePlus, Upload, X } from "lucide-react";
import { API_BASE } from "../api/posts";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isAcceptedFile(file) {
  return ACCEPTED_TYPES.includes(file.type);
}

export default function ChangePost() {
  const post = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const sortedInitialImages = useMemo(
    () => [...(post.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [post.images],
  );

  const [keptUrls, setKeptUrls] = useState(() =>
    sortedInitialImages.map((img) => img.file_url),
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [clientError, setClientError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setKeptUrls(sortedInitialImages.map((img) => img.file_url));
  }, [post.id, sortedInitialImages]);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  );

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const removeKeptUrl = (url) => {
    setKeptUrls((prev) => prev.filter((u) => u !== url));
  };

  const addFiles = useCallback((incoming) => {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const invalid = list.filter((f) => !isAcceptedFile(f));
    if (invalid.length > 0) {
      setClientError("Допустимы только JPEG, PNG и WebP");
      return;
    }

    setClientError("");
    setSelectedFiles((prev) => [...prev, ...list]);
  }, []);

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleRemoveNew = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = (form.content.value || "").trim();

    if (!content && keptUrls.length === 0 && selectedFiles.length === 0) {
      setClientError("Добавьте текст или хотя бы одно фото");
      return;
    }

    setClientError("");
    const fd = new FormData();
    fd.set("post_id", String(post.id));
    fd.set("content", form.content.value);
    fd.set("image_urls", JSON.stringify(keptUrls));
    if (form.is_published.checked) {
      fd.set("is_published", "on");
    }
    selectedFiles.forEach((file) => fd.append("images", file));
    submit(fd, { method: "post", encType: "multipart/form-data" });
  };

  const displayError = clientError || actionData?.error;

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Редактировать пост</h2>
        <Link
          to="/settings"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Назад к постам
        </Link>
      </div>

      <Form method="post" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2">Содержание</label>
          <textarea
            name="content"
            rows={6}
            defaultValue={post.content ?? ""}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Введите текст поста..."
          />
        </div>

        <div>
          <label className="block mb-2">Текущие фото</label>
          {keptUrls.length === 0 ? (
            <p className="text-sm text-gray-500">Нет сохранённых фото</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {keptUrls.map((url) => (
                <div
                  key={url}
                  className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square"
                >
                  <img
                    src={`${API_BASE}${url}`}
                    alt="Фото поста"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeptUrl(url)}
                    disabled={isSubmitting}
                    aria-label="Убрать фото из поста"
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-7 h-7 text-white bg-black/50 rounded-full hover:bg-black/70 disabled:opacity-50"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2">Добавить фото</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isSubmitting) setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (!isSubmitting) addFiles(e.dataTransfer.files);
            }}
            disabled={isSubmitting}
            className={`flex flex-col items-center justify-center w-full gap-2 px-4 py-8 transition border-2 border-dashed rounded-xl ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 text-gray-500">
              <ImagePlus size={22} strokeWidth={2} />
              <Upload size={20} strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-600">
              Нажмите или перетащите фото сюда
            </span>
            <span className="text-xs text-gray-400">JPEG, PNG, WebP</span>
          </button>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3">
              {previewUrls.map((url, index) => (
                <div
                  key={`${selectedFiles[index].name}-${index}`}
                  className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square"
                >
                  <img
                    src={url}
                    alt={`Новое фото ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(index)}
                    disabled={isSubmitting}
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-7 h-7 text-white bg-black/50 rounded-full hover:bg-black/70 disabled:opacity-50"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            defaultChecked={post.is_published}
            className="w-4 h-4"
          />
          <label htmlFor="is_published">Опубликован</label>
        </div>

        {displayError && <p className="text-red-500">{displayError}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
          <Link
            to="/settings"
            className="px-4 py-2 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Отмена
          </Link>
        </div>
      </Form>
    </div>
  );
}
