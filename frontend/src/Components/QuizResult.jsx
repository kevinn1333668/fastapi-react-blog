export default function QuizResult({ result, onBack }) {
  const { score, max_score, passed, details } = result;
  const percent = max_score > 0 ? Math.round((score / max_score) * 100) : 0;

  return (
    <div className="mx-auto max-w-lg p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h2 className="mb-2 text-2xl font-bold text-center">
        {passed ? "Тест сдан!" : "Тест не сдан"}
      </h2>
      <p className="mb-6 text-center text-gray-600">
        Результат: {score} из {max_score} ({percent}%)
      </p>

      {details?.length > 0 && (
        <ul className="mb-6 space-y-2">
          {details.map((item) => (
            <li
              key={item.question}
              className={`flex justify-between px-3 py-2 rounded-lg text-sm ${
                item.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <span>{item.question}</span>
              <span>{item.correct ? "Верно" : "Неверно"}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        К списку тестов
      </button>
    </div>
  );
}
