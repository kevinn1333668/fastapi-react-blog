import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { getStoredUser } from "../api/auth";
import { updateComment, deleteComment } from "../api/comments";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isEdited(comment) {
  if (!comment.updated_at) return false;
  return new Date(comment.updated_at).getTime() !== new Date(comment.created_at).getTime();
}

export default function CommentItem({ comment, onUpdated, onDeleted, onError }) {
  const currentUser = getStoredUser();
  const canModify =
    comment.author.id === currentUser?.id || currentUser?.is_admin;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed.length > 2000) return;

    setIsSaving(true);
    try {
      const updated = await updateComment(comment.id, trimmed);
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      onError?.(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить этот комментарий?")) return;

    setIsDeleting(true);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      onError?.(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              @{comment.author.username}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.created_at)}
            </span>
            {isEdited(comment) && (
              <span className="text-xs text-gray-400">изменено</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={2000}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !editText.trim()}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}
        </div>

        {canModify && !isEditing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              aria-label="Редактировать комментарий"
              className="p-1.5 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Удалить комментарий"
              className="p-1.5 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
