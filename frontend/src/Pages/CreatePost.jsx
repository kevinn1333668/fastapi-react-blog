// CreatePost.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { ImagePlus, Upload, X } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isAcceptedFile(file) {
  return ACCEPTED_TYPES.includes(file.type);
}

export default function CreatePost() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [clientError, setClientError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles]
  );

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

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

  const handleRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isSubmitting) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isSubmitting) return;
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const content = (form.content.value || "").trim();

    if (!content && selectedFiles.length === 0) {
      setClientError("Добавьте текст или хотя бы одно фото");
      return;
    }

    setClientError("");
    const fd = new FormData();
    fd.set("content", form.content.value);
    if (form.is_published.checked) {
      fd.set("is_published", "on");
    }
    selectedFiles.forEach((file) => fd.append("images", file));
    submit(fd, { method: "post", encType: "multipart/form-data" });
  };

  const displayError = clientError || actionData?.error;

  return (
    <div className="max-w-2xl p-6 mx-auto">
      <h2 className="mb-6 text-2xl font-bold">Создать пост</h2>

      <Form method="post" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2">Содержание</label>
          <textarea
            name="content"
            rows={6}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Введите текст поста..."
          />
        </div>

        <div>
          <label className="block mb-2">Фото</label>
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
            <>
              <p className="mt-3 text-sm text-gray-500">
                {selectedFiles.length} фото
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${selectedFiles[index].name}-${selectedFiles[index].lastModified}-${index}`}
                    className="relative overflow-hidden bg-gray-100 rounded-lg shadow-sm aspect-square group"
                  >
                    <img
                      src={url}
                      alt={`Превью ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={isSubmitting}
                      aria-label={`Удалить фото ${index + 1}`}
                      className="absolute top-1.5 right-1.5 flex items-center justify-center w-7 h-7 text-white transition bg-black/50 rounded-full opacity-90 hover:bg-black/70 disabled:opacity-50"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            defaultChecked
            className="w-4 h-4"
          />
          <label htmlFor="is_published">Опубликовать сразу</label>
        </div>

        {displayError && (
          <p className="text-red-500">{displayError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? "Создание..." : "Создать пост"}
        </button>
      </Form>
    </div>
  );
}
