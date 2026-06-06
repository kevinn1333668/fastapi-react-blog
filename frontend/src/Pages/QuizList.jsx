import { Link, useLoaderData } from "react-router-dom";

export default function QuizList() {
  const quizzes = useLoaderData();

  return (
    <div className="px-4 pb-10">
      <h1 className="mb-6 text-3xl font-bold text-center">Тесты</h1>

      {quizzes.length === 0 ? (
        <p className="text-center text-gray-500">Пока нет опубликованных тестов</p>
      ) : (
        <ul className="mx-auto flex max-w-2xl flex-col gap-4">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                to={`/quizzes/${quiz.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">{quiz.title}</h2>
                  {quiz.topic && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-800">
                      {quiz.topic}
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
