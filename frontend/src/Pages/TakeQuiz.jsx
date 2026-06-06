import { useCallback, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import QuizPlayer from "../Components/QuizPlayer";
import QuizResult from "../Components/QuizResult";
import { submitQuiz } from "../api/quizzes";
import { AuthError, ForbiddenError } from "../api/client";
import { clearSession } from "../api/auth";
import { markAdminForbidden } from "../api/guards";

export default function TakeQuiz() {
  const quiz = useLoaderData();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = useCallback(
    async (answers) => {
      setIsSubmitting(true);
      setError("");
      try {
        const data = await submitQuiz(quiz.id, answers);
        setResult(data);
      } catch (err) {
        if (err instanceof AuthError || err?.code === "UNAUTHORIZED" || err.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        if (err instanceof ForbiddenError || err?.code === "FORBIDDEN" || err.status === 403) {
          markAdminForbidden();
          navigate("/", { replace: true });
          return;
        }
        setError(err.detail || "Не удалось отправить ответы");
      } finally {
        setIsSubmitting(false);
      }
    },
    [quiz.id, navigate],
  );

  if (result) {
    return (
      <div className="px-4 py-8">
        <QuizResult result={result} onBack={() => navigate("/quizzes")} />
      </div>
    );
  }

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="mt-2 text-gray-600">{quiz.description}</p>
        )}
      </div>

      {error && (
        <p className="mx-auto mb-4 max-w-2xl text-center text-sm text-red-600">{error}</p>
      )}

      {isSubmitting ? (
        <p className="text-center text-gray-500">Проверяем ответы...</p>
      ) : (
        <div className="mx-auto max-w-2xl">
          <QuizPlayer schema={quiz.quiz_schema} onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
}
