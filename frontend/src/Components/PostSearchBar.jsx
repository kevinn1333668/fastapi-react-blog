import { Search, X } from "lucide-react";

export default function PostSearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Поиск по тексту постов…",
}) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-gray-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        aria-label="Поиск постов"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Очистить поиск"
        >
          <X size={18} />
        </button>
      ) : null}
    </div>
  );
}
