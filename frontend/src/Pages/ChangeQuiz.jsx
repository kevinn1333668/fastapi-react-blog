import { useState } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router-dom";
import QuizFormFields from "../Components/QuizFormFields";
import { emptyQuestion, parseQuestionsFromSchema } from "../utils/quizSchema";

export default function ChangeQuiz() {
  const quiz = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const parsedQuestions = parseQuestionsFromSchema(quiz.quiz_schema);
  const [title, setTitle] = useState(quiz.title);
  const [topic, setTopic] = useState(quiz.topic || "");
  const [description, setDescription] = useState(quiz.description || "");
  const [isPublished, setIsPublished] = useState(quiz.is_published);
  const [questions, setQuestions] = useState(
    parsedQuestions.length ? parsedQuestions : [emptyQuestion()],
  );

  return (
    <div className="px-4 pb-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/settings/quizzes"
          className="mb-4 inline-block text-sm text-blue-700 hover:underline"
        >
          ← К списку тестов
        </Link>

        <h1 className="mb-6 text-2xl font-bold">Редактирование теста</h1>

        <Form method="post" className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <input type="hidden" name="quiz_id" value={quiz.id} />
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="topic" value={topic} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="is_published" value={String(isPublished)} />
          <input type="hidden" name="questions_json" value={JSON.stringify(questions)} />

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

          {actionData?.error && (
            <p className="text-sm text-red-600">{actionData.error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </Form>
      </div>
    </div>
  );
}
