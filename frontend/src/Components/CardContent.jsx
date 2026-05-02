import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CardContent({
  content,
  images = [],
  date,
  isAdmin = false,
  onDelete,
  onEdit,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images]
  );
  const hasImages = sortedImages.length > 0;
  const safeIndex = hasImages
    ? Math.min(currentIndex, sortedImages.length - 1)
    : 0;
  const currentImage = hasImages ? sortedImages[safeIndex] : null;
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nextImage = () => {
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    if (!hasImages) return;
    setCurrentIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length
    );
  };

  const goToImage = (index) => {
    if (!hasImages) return;
    const clampedIndex = Math.max(0, Math.min(index, sortedImages.length - 1));
    setCurrentIndex(clampedIndex);
  };

  return (
    <div className="w-1/2 mx-auto my-6">
      <div className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg hover:scale-105">
        {hasImages && currentImage && (
          <div className="relative group">
            <div className="overflow-hidden bg-gray-100 aspect-video">
              <img
                src={`http://127.0.0.1:8000${currentImage.file_url}`}
                alt={`${content} - фото ${currentIndex + 1}`}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t to-transparent from-black/60">
              <div className="flex items-center justify-between text-white">
                <span className="text-sm">
                  {safeIndex + 1} из {sortedImages.length}
                </span>

                {sortedImages.length <= 10 && (
                  <div className="flex gap-1">
                    {sortedImages.map((image, idx) => (
                      <button
                        key={image.id ?? image.file_url ?? idx}
                        onClick={() => goToImage(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === safeIndex
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute p-2 text-white transition-opacity -translate-y-1/2 rounded-full opacity-0 left-3 top-1/2 bg-black/50 group-hover:opacity-100 hover:bg-black/70"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute p-2 text-white transition-opacity -translate-y-1/2 rounded-full opacity-0 right-3 top-1/2 bg-black/50 group-hover:opacity-100 hover:bg-black/70"
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        <div className="p-6">
          <p className="mb-4 leading-relaxed text-gray-600">{content}</p>
          <p className="text-sm text-gray-400">{formattedDate}</p>

          {isAdmin && (
            <div className="flex gap-3 pt-4 mt-6 border-t border-gray-100">
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
              >
                🗑️ Удалить
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-white transition bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                ✏️ Редактировать
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
