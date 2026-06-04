import { useEffect, useRef, useState } from "react";
import { Menu, Pencil, Trash2 } from "lucide-react";

export default function PostActionsMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleEdit = () => {
    setOpen(false);
    onEdit?.();
  };

  const handleDelete = () => {
    setOpen(false);
    if (!window.confirm("Удалить этот пост?")) return;
    onDelete?.();
  };

  return (
    <div className="absolute top-3 right-3 z-10" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Действия с постом"
        className="flex items-center justify-center w-8 h-8 text-gray-500 transition rounded-full hover:bg-gray-100 hover:text-gray-700"
      >
        <Menu size={18} strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 py-1 mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleEdit}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-left text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil size={15} className="shrink-0 text-gray-400" />
            Редактировать
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-sm text-left text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={15} className="shrink-0" />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
