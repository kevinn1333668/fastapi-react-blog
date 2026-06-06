import { Plus, Trash2 } from "lucide-react";
import { QUESTION_TYPES, emptyQuestion } from "../utils/quizSchema";

function ChoiceEditor({ question, index, onChange }) {
  const syncRankingAnswer = (choices) => {
    if (question.type !== "ranking") return question.correctAnswer;
    return choices;
  };

  const updateChoice = (choiceIndex, value) => {
    const choices = [...question.choices];
    choices[choiceIndex] = value;
    onChange(index, {
      ...question,
      choices,
      correctAnswer: syncRankingAnswer(choices),
    });
  };

  const addChoice = () => {
    const choices = [...question.choices, ""];
    onChange(index, {
      ...question,
      choices,
      correctAnswer: syncRankingAnswer(choices),
    });
  };

  const removeChoice = (choiceIndex) => {
    const removed = question.choices[choiceIndex];
    const choices = question.choices.filter((_, i) => i !== choiceIndex);
    let correctAnswer = question.correctAnswer;

    if (question.type === "checkbox" && Array.isArray(correctAnswer)) {
      correctAnswer = correctAnswer.filter((c) => c !== removed);
    } else if (question.type === "radiogroup" && correctAnswer === removed) {
      correctAnswer = "";
    } else if (question.type === "ranking") {
      correctAnswer = syncRankingAnswer(choices);
    }

    onChange(index, { ...question, choices, correctAnswer });
  };

  const toggleCheckboxCorrect = (choice) => {
    const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    const next = current.includes(choice)
      ? current.filter((c) => c !== choice)
      : [...current, choice];
    onChange(index, { ...question, correctAnswer: next });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Варианты ответа</p>
      {question.choices.map((choice, choiceIndex) => (
        <div key={choiceIndex} className="flex items-center gap-2">
          {question.type === "radiogroup" && (
            <input
              type="radio"
              name={`correct-${index}`}
              checked={question.correctAnswer === choice && choice.trim() !== ""}
              onChange={() => onChange(index, { ...question, correctAnswer: choice })}
            />
          )}
          {question.type === "checkbox" && (
            <input
              type="checkbox"
              checked={
                Array.isArray(question.correctAnswer) &&
                question.correctAnswer.includes(choice) &&
                choice.trim() !== ""
              }
              onChange={() => toggleCheckboxCorrect(choice)}
            />
          )}
          <input
            type="text"
            value={choice}
            onChange={(e) => updateChoice(choiceIndex, e.target.value)}
            placeholder={`Вариант ${choiceIndex + 1}`}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {question.choices.length > 2 && (
            <button
              type="button"
              onClick={() => removeChoice(choiceIndex)}
              className="p-1 text-gray-400 hover:text-red-600"
              aria-label="Удалить вариант"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addChoice}
        className="text-sm text-blue-700 hover:underline"
      >
        + вариант
      </button>
      {question.type === "radiogroup" && (
        <p className="text-xs text-gray-500">Отметьте правильный ответ</p>
      )}
      {question.type === "checkbox" && (
        <p className="text-xs text-gray-500">Отметьте все правильные ответы</p>
      )}
      {question.type === "ranking" && (
        <p className="text-xs text-gray-500">
          Порядок вариантов выше — правильная последовательность
        </p>
      )}
    </div>
  );
}

export default function QuizFormFields({
  title,
  topic,
  description,
  isPublished,
  questions,
  onTitleChange,
  onTopicChange,
  onDescriptionChange,
  onPublishedChange,
  onQuestionsChange,
}) {
  const updateQuestion = (index, next) => {
    const copy = [...questions];
    copy[index] = next;
    onQuestionsChange(copy);
  };

  const changeQuestionType = (index, type) => {
    updateQuestion(index, emptyQuestion(type));
  };

  const addQuestion = () => {
    onQuestionsChange([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Название теста
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Основы Python"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Тема</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="python"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Краткое описание теста"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => onPublishedChange(e.target.checked)}
        />
        Опубликовать (виден пользователям)
      </label>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Вопросы</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
          >
            <Plus size={16} />
            вопрос
          </button>
        </div>

        {questions.map((question, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">Вопрос {index + 1}</p>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Удалить
              </button>
            </div>

            <select
              value={question.type}
              onChange={(e) => changeQuestionType(index, e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={question.title}
              onChange={(e) =>
                updateQuestion(index, { ...question, title: e.target.value })
              }
              placeholder="Текст вопроса"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />

            {question.type === "boolean" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Правильный ответ</p>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`bool-${index}`}
                    checked={question.correctAnswer === true}
                    onChange={() =>
                      updateQuestion(index, { ...question, correctAnswer: true })
                    }
                  />
                  Да
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`bool-${index}`}
                    checked={question.correctAnswer === false}
                    onChange={() =>
                      updateQuestion(index, { ...question, correctAnswer: false })
                    }
                  />
                  Нет
                </label>
              </div>
            ) : (
              <ChoiceEditor
                question={question}
                index={index}
                onChange={updateQuestion}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
