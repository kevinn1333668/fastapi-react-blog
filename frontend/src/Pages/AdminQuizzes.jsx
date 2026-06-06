import { useMemo } from "react";
import { Form, useLoaderData, useNavigate } from "react-router-dom";
import PostActionsMenu from "../Components/PostActionsMenu";
import QuizComposer from "../Components/QuizComposer";

export default function AdminQuizzes() {
  const quizzes = useLoaderData();
  const navigate = useNavigate();

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort((a, b) => b.id - a.id),
    [quizzes],
  );

  return (
    <>
      <div className="px-4 pb-8">
        <h1 className="mb-6 text-3xl font-bold text-center">Тесты</h1>

        {sortedQuizzes.length === 0 ? (
          <p className="text-center text-gray-500">Тестов пока нет</p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-4">
            {sortedQuizzes.map((quiz) => (
              <li
                key={quiz.id}
                className="relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <PostActionsMenu
                  onEdit={() =>
                    navigate(`/settings/quizzes/change?quizId=${quiz.id}`)
                  }
                  onDelete={() => {
                    const form = document.getElementById(`delete-quiz-${quiz.id}`);
                    form?.requestSubmit();
                  }}
                />

                <div className="mb-1 flex flex-wrap items-center gap-2 pr-10">
                  <h2 className="text-lg font-semibold">{quiz.title}</h2>
                  {quiz.topic && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-800">
                      {quiz.topic}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs ${
                      quiz.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {quiz.is_published ? "Опубликован" : "Черновик"}
                  </span>
                </div>

                {quiz.description && (
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {new Date(quiz.created_at).toLocaleDateString("ru-RU")}
                </p>

                <Form
                  method="post"
                  id={`delete-quiz-${quiz.id}`}
                  style={{ display: "none" }}
                >
                  <input type="hidden" name="quiz_id" value={quiz.id} />
                </Form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QuizComposer />
    </>
  );
}
