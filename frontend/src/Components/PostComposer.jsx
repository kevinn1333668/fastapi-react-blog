import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { ImagePlus, Paperclip, Send, Upload, X } from "lucide-react";
import { publishNewPost } from "../api/publishPost";
import { clearSession } from "../api/auth";
import { AuthError, ForbiddenError } from "../api/client";
import { markAdminForbidden } from "../api/guards";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Ширина бара; sheet чуть шире */
const COMPOSER_BAR_CLASS = "w-[min(100%,36rem)]";
const COMPOSER_SHEET_CLASS = "w-[min(100%,40rem)]";

function isAcceptedFile(file) {
  return ACCEPTED_TYPES.includes(file.type);
}

export default function PostComposer() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [barText, setBarText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetText, setSheetText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const previewUrls = useMemo(
    () => selectedFiles.map((file) => URL.createObjectURL(file)),
    [selectedFiles],
  );

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const handleClientError = useCallback(
    (err) => {
      if (
        err instanceof AuthError ||
        err?.code === "UNAUTHORIZED" ||
        err.status === 401
      ) {
        clearSession();
        navigate("/login", { replace: true });
        return true;
      }
      if (
        err instanceof ForbiddenError ||
        err?.code === "FORBIDDEN" ||
        err.status === 403
      ) {
        markAdminForbidden();
        navigate("/", { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  const resetSheet = () => {
    setSheetText("");
    setSelectedFiles([]);
    setIsDragOver(false);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    resetSheet();
    setError("");
  };

  const openSheet = () => {
    setSheetText(barText);
    setSheetOpen(true);
    setError("");
  };

  const refreshPosts = () => {
    revalidator.revalidate();
  };

  const submitPost = async ({ content, files }) => {
    setIsSubmitting(true);
    setError("");
    try {
      await publishNewPost({ content: content.trim(), files });
      setBarText("");
      closeSheet();
      refreshPosts();
    } catch (err) {
      if (!handleClientError(err)) {
        setError(err.detail || err.message || "Не удалось опубликовать пост");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSend = () => {
    const text = barText.trim();
    if (!text || isSubmitting) return;
    submitPost({ content: text, files: [] });
  };

  const handleBarKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuickSend();
    }
  };

  const handleSheetPublish = () => {
    const text = sheetText.trim();
    if (!text && selectedFiles.length === 0) {
      setError("Добавьте текст или хотя бы одно фото");
      return;
    }
    submitPost({ content: text, files: selectedFiles });
  };

  const addFiles = useCallback((incoming) => {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    const invalid = list.filter((f) => !isAcceptedFile(f));
    if (invalid.length > 0) {
      setError("Допустимы только JPEG, PNG и WebP");
      return;
    }

    setError("");
    setSelectedFiles((prev) => [...prev, ...list]);
  }, []);

  const canQuickSend = barText.trim().length > 0 && !isSubmitting;

  return (
    <>
      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          role="presentation"
          onClick={closeSheet}
        />
      )}

      {sheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="composer-sheet-title"
          className={`fixed bottom-0 left-1/2 z-50 flex flex-col max-h-[min(85vh,640px)] -translate-x-1/2 ${COMPOSER_SHEET_CLASS} bg-white rounded-t-2xl shadow-2xl`}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" aria-hidden />
          </div>

          <div className="overflow-y-auto flex-1 px-4 pb-4">
            <h3
              id="composer-sheet-title"
              className="mb-3 text-lg font-semibold"
            >
              Новый пост
            </h3>

            <textarea
              value={sheetText}
              onChange={(e) => setSheetText(e.target.value)}
              rows={5}
              disabled={isSubmitting}
              placeholder="Текст поста..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
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
              className={`mt-4 flex flex-col items-center justify-center w-full gap-2 px-4 py-6 border-2 border-dashed rounded-xl transition ${
                isDragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              } disabled:opacity-50`}
            >
              <div className="flex gap-2 text-gray-500">
                <ImagePlus size={20} />
                <Upload size={18} />
              </div>
              <span className="text-sm text-gray-600">Добавить фото</span>
            </button>

            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previewUrls.map((url, index) => (
                  <div
                    key={`${selectedFiles[index].name}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={url}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 text-white rounded-full bg-black/50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSheetPublish}
              disabled={isSubmitting}
              className="w-full py-3 font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Публикация…" : "Опубликовать"}
            </button>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 pointer-events-none">
        <div
          className={`pointer-events-auto flex items-center gap-2 ${COMPOSER_BAR_CLASS} px-3 py-2 bg-white border border-gray-200 rounded-2xl shadow-lg`}
        >
          <button
            type="button"
            onClick={openSheet}
            disabled={isSubmitting}
            aria-label="Добавить фото"
            className="flex shrink-0 justify-center items-center w-10 h-10 text-gray-500 rounded-full transition hover:bg-gray-100 disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>

          <input
            type="text"
            value={barText}
            onChange={(e) => setBarText(e.target.value)}
            onKeyDown={handleBarKeyDown}
            disabled={isSubmitting}
            placeholder="Написать пост..."
            className="flex-1 min-w-0 px-2 py-2 text-gray-800 bg-transparent focus:outline-none"
          />

          <button
            type="button"
            onClick={handleQuickSend}
            disabled={!canQuickSend}
            aria-label="Опубликовать"
            className="flex shrink-0 justify-center items-center w-10 h-10 text-white bg-blue-500 rounded-full transition hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {error && !sheetOpen && (
        <p className="fixed bottom-[4.5rem] left-1/2 z-30 px-3 py-1 text-sm text-red-600 bg-white rounded-lg shadow -translate-x-1/2">
          {error}
        </p>
      )}
    </>
  );
}
