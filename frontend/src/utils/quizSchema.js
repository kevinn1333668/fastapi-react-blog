export const QUESTION_TYPES = [
  { value: "radiogroup", label: "Один правильный ответ" },
  { value: "checkbox", label: "Несколько правильных" },
  { value: "boolean", label: "Да / Нет" },
  { value: "ranking", label: "Расставить по порядку" },
];

export function emptyQuestion(type = "radiogroup") {
  return {
    type,
    title: "",
    choices: type === "boolean" ? [] : ["", ""],
    correctAnswer: type === "checkbox" ? [] : type === "boolean" ? true : "",
  };
}

export function parseQuestionsFromSchema(schema) {
  const elements = schema?.pages?.[0]?.elements ?? schema?.elements ?? [];
  return elements.map((el) => {
    const type = el.type || "radiogroup";
    return {
      type,
      title: el.title || "",
      choices: Array.isArray(el.choices) ? [...el.choices] : [],
      correctAnswer:
        el.correctAnswer ??
        (type === "checkbox" ? [] : type === "boolean" ? true : ""),
    };
  });
}

export function buildSchemaJson(questions) {
  return {
    pages: [
      {
        elements: questions.map((q, index) => {
          const element = {
            type: q.type,
            name: `q${index + 1}`,
            title: q.title.trim(),
          };

          if (q.type === "boolean") {
            element.correctAnswer = Boolean(q.correctAnswer);
          } else {
            const choices = q.choices.map((c) => c.trim()).filter(Boolean);
            element.choices = choices;
            element.correctAnswer =
              q.type === "ranking" ? choices : q.correctAnswer;
          }

          return element;
        }),
      },
    ],
  };
}

export function validateQuizForm({ title, questions }) {
  if (!title.trim()) {
    return "Укажите название теста";
  }

  if (!questions.length) {
    return "Добавьте хотя бы один вопрос";
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const n = i + 1;

    if (!q.title.trim()) {
      return `Вопрос ${n}: укажите текст`;
    }

    if (q.type === "boolean") {
      continue;
    }

    const choices = q.choices.map((c) => c.trim()).filter(Boolean);
    if (choices.length < 2) {
      return `Вопрос ${n}: нужно минимум 2 варианта ответа`;
    }

    if (q.type === "checkbox") {
      if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
        return `Вопрос ${n}: отметьте хотя бы один правильный ответ`;
      }
    } else if (q.type === "ranking") {
      if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length !== choices.length) {
        return `Вопрос ${n}: укажите правильный порядок для всех вариантов`;
      }
    } else if (!q.correctAnswer) {
      return `Вопрос ${n}: выберите правильный ответ`;
    }
  }

  return null;
}
