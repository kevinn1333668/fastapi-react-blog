import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // или свои иконки

export default function CardContent({ title, description, images = [], date }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Если фото нет — ничего не рендерим в блоке изображений
  if (images.length === 0) {
    return (
      <div className="mx-auto my-5 w-1/2">
        <div className="overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="p-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              {title}
            </h2>
            <p className="mb-4 leading-relaxed text-gray-600">{description}</p>
            <p className="text-sm text-gray-400">
              {new Date(date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Сортируем изображения по sort_order (если порядок важен)
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mx-auto my-5 w-1/2">
      <div className="overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
        {/* Блок с каруселью */}
        <div className="relative group">
          {/* Основное изображение */}
          <div className="overflow-hidden bg-gray-100 aspect-video">
            <img
              src={`http://127.0.0.1:8000${sortedImages[currentIndex].file_url}`}
              alt={`${title} - фото ${currentIndex + 1}`}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Информационная панель */}
          <div className="absolute right-0 bottom-0 left-0 p-4 bg-gradient-to-t to-transparent from-black/60">
            <div className="flex justify-between items-center text-white">
              <span className="text-sm">
                {currentIndex + 1} из {sortedImages.length}
              </span>

              {/* Точки для навигации (опционально, если фото > 10 - лучше убрать) */}
              {sortedImages.length <= 10 && (
                <div className="flex gap-1">
                  {sortedImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToImage(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Кнопки переключения (показываем только если фото > 1) */}
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

        {/* Контент */}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">{title}</h2>
          <p className="mb-4 leading-relaxed text-gray-600">{description}</p>
          <p className="text-sm text-gray-400">
            {new Date(date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
