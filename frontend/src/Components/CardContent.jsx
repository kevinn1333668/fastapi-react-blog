export default function CardContent({ title, description, image, date }) {
  return (
    <div className="mx-auto my-5 w-1/2">
      <div className="overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
        {image && (
          <div className="overflow-hidden">
            <img
              src={image}
              alt={title}
              className="object-cover w-full h-48 transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">{title}</h2>
          <p className="mb-4 leading-relaxed text-gray-600">{description}</p>
          <p className="text-sm text-gray-400">{date}</p>
        </div>
      </div>
    </div>
  );
}
