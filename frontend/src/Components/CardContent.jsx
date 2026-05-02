import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { API_BASE } from "../api/posts";

export default function CardContent({
  content,
  images = [],
  date,
  isAdmin = false,
  onDelete,
  onEdit,
}) {
  const PREVIEW_LIMIT = 4;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images]
  );
  const hasImages = sortedImages.length > 0;
  const formattedDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const previewImages = useMemo(
    () => sortedImages.slice(0, PREVIEW_LIMIT),
    [sortedImages]
  );
  const previewCount = previewImages.length;

  const gridClassName = useMemo(() => {
    if (previewCount <= 1) return "grid-cols-1";
    if (previewCount === 2) return "grid-cols-2";
    return "grid-cols-2 grid-rows-2";
  }, [previewCount]);

  const slides = useMemo(
    () =>
      sortedImages.map((img) => ({
        src: `${API_BASE}${img.file_url}`,
      })),
    [sortedImages]
  );

  const openLightboxAt = (index) => {
    if (!hasImages) return;
    const clampedIndex = Math.max(0, Math.min(index, sortedImages.length - 1));
    setLightboxIndex(clampedIndex);
    setIsLightboxOpen(true);
  };

  return (
    <div className="w-1/2 mx-auto my-6">
      <div className="overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-lg hover:scale-105">
        {hasImages && (
          <div className="p-4">
            <div
              className={`grid ${gridClassName} gap-1 overflow-hidden bg-gray-100 rounded-lg`}
            >
              {previewImages.map((image, idx) => {
                const isLastPreview =
                  idx === PREVIEW_LIMIT - 1 && sortedImages.length > PREVIEW_LIMIT;
                const remainingCount = sortedImages.length - PREVIEW_LIMIT;
                const key = image.id ?? image.file_url ?? idx;
                const src = `${API_BASE}${image.file_url}`;
                const isSingle = previewCount === 1;
                const isThreeFirst = previewCount === 3 && idx === 0;
                const tileClassName = isSingle
                  ? "aspect-video"
                  : isThreeFirst
                    ? "row-span-2 h-full"
                    : "aspect-square";
                const imageClassName = isSingle ? "object-contain" : "object-cover";

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => openLightboxAt(idx)}
                    className={`relative overflow-hidden bg-gray-200 ${tileClassName}`}
                    aria-label={`Открыть фото ${idx + 1} из ${sortedImages.length}`}
                  >
                    <img
                      src={src}
                      alt={`${content} - фото ${idx + 1}`}
                      className={`${imageClassName} w-full h-full`}
                      loading="lazy"
                    />

                    {isLastPreview && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                        <span className="text-3xl font-semibold text-white">
                          +{remainingCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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

      {hasImages && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={slides}
          index={lightboxIndex}
          on={{
            view: ({ index }) => setLightboxIndex(index),
          }}
        />
      )}
    </div>
  );
}
