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
    // checkbox: number[] — indices of correct choices
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
      choices: Array.isArray(el.choices)
        ? el.choices.map((c) =>
            typeof c === "object" && c !== null
              ? String(c.text ?? c.value ?? "")
              : String(c),
          )
        : [],
      correctAnswer:
        type === "checkbox"
          ? textsToCorrectIndices(
              el.correctAnswer,
              Array.isArray(el.choices) ? el.choices : [],
            )
          : (el.correctAnswer ??
            (type === "boolean" ? true : "")),
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
            if (q.type === "ranking") {
              element.correctAnswer = choices;
            } else if (q.type === "checkbox") {
              let indices = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
              if (indices.length > 0 && typeof indices[0] === "string") {
                indices = textsToCorrectIndices(indices, q.choices);
              }
              element.correctAnswer = indices
                .filter((i) => Number.isInteger(i) && i >= 0 && i < choices.length)
                .map((i) => choices[i]);
            } else {
              element.correctAnswer = q.correctAnswer;
            }
          }

          return element;
        }),
      },
    ],
  };
}

function choiceToValue(choice) {
  return typeof choice === "object" && choice !== null && "value" in choice
    ? String(choice.value)
    : String(choice);
}

function choiceToText(choice) {
  if (typeof choice === "object" && choice !== null) {
    if ("text" in choice && choice.text != null) return String(choice.text).trim();
    if ("value" in choice) return String(choice.value).trim();
  }
  return String(choice).trim();
}

function textsToCorrectIndices(correctTexts, rawChoices) {
  const choices = rawChoices.map((c) => String(c).trim());
  const texts = Array.isArray(correctTexts) ? correctTexts : [];
  const indices = [];

  for (const text of texts) {
    const trimmed = String(text).trim();
    const idx = choices.indexOf(trimmed);
    if (idx >= 0 && !indices.includes(idx)) {
      indices.push(idx);
    }
  }

  return indices;
}

function mapCheckboxValuesToTexts(question, values) {
  const rawList = normalizeChoiceList(values);
  const items = question.choices ?? [];

  return rawList
    .map((v) => {
      for (const item of items) {
        const itemValue =
          typeof item === "object" && item !== null && "value" in item
            ? String(item.value)
            : choiceToValue(item);
        if (itemValue === String(v)) {
          return choiceToText(item);
        }
      }
      return v;
    })
    .filter(Boolean);
}

function normalizeChoiceList(values) {
  if (values == null) return [];
  const list = Array.isArray(values) ? values : [values];
  return list
    .map((item) => {
      if (typeof item === "object" && item !== null && "value" in item) {
        return String(item.value).trim();
      }
      return String(item).trim();
    })
    .filter(Boolean);
}

export function preparePlayerSchema(schema) {
  const prepared = structuredClone(schema);
  const elements = prepared.pages?.[0]?.elements ?? prepared.elements ?? [];

  for (const element of elements) {
    if (element.type === "ranking" && Array.isArray(element.choices)) {
      const choices = element.choices.map(choiceToValue).filter(Boolean);
      element.choices = choices;
      element.selectToRankEnabled = false;
      element.defaultValue = [...choices];
      continue;
    }

    if (element.type === "checkbox" && Array.isArray(element.choices)) {
      const texts = element.choices.map(choiceToValue).filter(Boolean);
      element.choices = texts.map((text, i) => ({
        value: String(i),
        text,
      }));
    }
  }

  return prepared;
}

export function normalizeSubmitAnswers(survey, rawData) {
  const normalized = { ...rawData };

  survey.getAllQuestions().forEach((question) => {
    const name = question.name;
    if (!name) return;

    const value = question.value ?? normalized[name];
    const type = question.getType();

    if (type === "checkbox") {
      normalized[name] = mapCheckboxValuesToTexts(question, value);
      return;
    }

    if (type === "ranking") {
      normalized[name] = normalizeChoiceList(value);
    }
  });

  return normalized;
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
      const marked = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.filter(
            (i) => Number.isInteger(i) && i >= 0 && i < choices.length,
          )
        : [];
      if (marked.length === 0) {
        return `Вопрос ${n}: отметьте хотя бы один правильный ответ`;
      }
      const texts = choices.map((c) => c.toLowerCase());
      if (new Set(texts).size !== texts.length) {
        return `Вопрос ${n}: варианты ответа должны быть уникальными`;
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
