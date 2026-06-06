import { useState } from "react";
import { useRevalidator } from "react-router-dom";
import { createQuiz } from "../api/quizzes";
import { AuthError, ForbiddenError } from "../api/client";
import { clearSession } from "../api/auth";
import { markAdminForbidden } from "../api/guards";
import QuizFormFields from "./QuizFormFields";
import {
  buildSchemaJson,
  emptyQuestion,
  validateQuizForm,
} from "../utils/quizSchema";

export default function QuizComposer() {
  const revalidator = useRevalidator();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setTopic("");
    setDescription("");
    setIsPublished(false);
    setQuestions([emptyQuestion()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateQuizForm({ title, questions });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await createQuiz({
        title: title.trim(),
        topic: topic.trim() || null,
        description: description.trim() || "",
        schema_json: buildSchemaJson(questions),
        is_published: isPublished,
      });
      resetForm();
      revalidator.revalidate();
    } catch (err) {
      if (err instanceof AuthError || err?.code === "UNAUTHORIZED" || err.status === 401) {
        clearSession();
        window.location.href = "/login";
        return;
      }
      if (err instanceof ForbiddenError || err?.code === "FORBIDDEN" || err.status === 403) {
        markAdminForbidden();
        window.location.href = "/";
        return;
      }
      setError(err.detail || "Не удалось создать тест");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold">Новый тест</h2>

      <QuizFormFields
        title={title}
        topic={topic}
        description={description}
        isPublished={isPublished}
        questions={questions}
        onTitleChange={setTitle}
        onTopicChange={setTopic}
        onDescriptionChange={setDescription}
        onPublishedChange={setIsPublished}
        onQuestionsChange={setQuestions}
      />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? "Сохранение..." : "Создать тест"}
      </button>
    </form>
  );
}
