import { useState } from "react";
import { consumeAdminForbidden } from "../api/guards";

export default function AdminForbiddenNotice() {
  const [visible, setVisible] = useState(() => consumeAdminForbidden());

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="px-4 py-3 mx-auto mb-4 max-w-2xl text-sm text-amber-900 bg-amber-100 rounded-lg border border-amber-300"
    >
      У вас нет прав администратора.
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="float-right font-medium text-amber-950 hover:underline"
        aria-label="Закрыть"
      >
        ×
      </button>
    </div>
  );
}
