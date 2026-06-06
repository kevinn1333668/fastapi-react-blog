import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  fetchComments,
  createComment,
} from "../api/comments";
import CommentItem from "./CommentItem";

function getErrorMessage(err) {
  if (err?.status === 404) return "Пост не найден";
  if (err?.status === 403) return "Нет прав для этого действия";
  return err?.message ?? "Произошла ошибка";
}

export default function CommentsPanel({ postId, open, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!open || !postId) return;
    loadComments();
    setNewComment("");
    setActionError(null);
  }, [open, postId, loadComments]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      await createComment(postId, trimmed);
      setNewComment("");
      await loadComments();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentError = (err) => {
    setActionError(getErrorMessage(err));
  };

  const handleUpdated = (updated) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setActionError(null);
  };

  const handleDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setActionError(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex flex-col w-full h-full max-w-lg mx-auto bg-white shadow-xl">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть комментарии"
            className="p-1.5 text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Комментарии</h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-8 text-sm text-center text-gray-500">
              Загрузка...
            </p>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 px-4 py-8">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadComments}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Повторить
              </button>
            </div>
          )}

          {!loading && !error && comments.length === 0 && (
            <p className="px-4 py-8 text-sm text-center text-gray-400">
              Пока нет комментариев
            </p>
          )}

          {!loading &&
            !error &&
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
                onError={handleCommentError}
              />
            ))}
        </div>

        {!error && (
          <footer className="px-4 py-3 border-t border-gray-200 shrink-0">
            {actionError && (
              <p className="mb-2 text-sm text-red-600">{actionError}</p>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                maxLength={2000}
                rows={2}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="self-end px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Отправить"}
              </button>
            </form>
          </footer>
        )}
      </div>
    </div>
  );
}
