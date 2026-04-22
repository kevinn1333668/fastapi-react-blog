import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // или свои иконки

export default function CardContent({ content, images = [], date }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images],
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
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
    );
  };

  const goToImage = (index) => {
    if (!hasImages) return;
    const clampedIndex = Math.max(0, Math.min(index, sortedImages.length - 1));
    setCurrentIndex(clampedIndex);
  };

  return (
    <div className="mx-auto my-6 w-1/2">
      <div className="overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
        {hasImages && currentImage && (
          <div className="relative group">
            <div className="overflow-hidden bg-gray-100 aspect-video">
              <img
                src={`http://127.0.0.1:8000${currentImage.file_url}`}
                alt={`${content} - фото ${currentIndex + 1}`}
                className="object-contain w-full h-full"
              />
            </div>

            <div className="absolute right-0 bottom-0 left-0 p-4 bg-gradient-to-t to-transparent from-black/60">
              <div className="flex justify-between items-center text-white">
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
                  className="absolute left-3 top-1/2 p-2 text-white rounded-full opacity-0 transition-opacity -translate-y-1/2 bg-black/50 group-hover:opacity-100 hover:bg-black/70"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 p-2 text-white rounded-full opacity-0 transition-opacity -translate-y-1/2 bg-black/50 group-hover:opacity-100 hover:bg-black/70"
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
        </div>
      </div>
    </div>
  );
}
