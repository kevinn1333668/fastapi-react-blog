import { useMemo } from "react";
import { Model } from "survey-react-ui";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";
import {
  normalizeSubmitAnswers,
  preparePlayerSchema,
} from "../utils/quizSchema";

export default function QuizPlayer({ schema, onComplete }) {
  const survey = useMemo(() => {
    const playerSchema = preparePlayerSchema(schema);
    const model = new Model(playerSchema);
    model.showCompletedPage = false;
    model.completeText = "Отправить ответы";

    model.getAllQuestions().forEach((question) => {
      if (question.getType() !== "ranking" || question.value?.length) {
        return;
      }

      question.value = question.choices.map((choice) =>
        typeof choice === "object" && choice !== null && "value" in choice
          ? choice.value
          : choice,
      );
    });

    model.onComplete.add((sender) => {
      const data = {};
      sender.getAllQuestions().forEach((question) => {
        if (question.name) {
          data[question.name] = question.value;
        }
      });
      onComplete?.(normalizeSubmitAnswers(sender, data));
    });

    return model;
  }, [schema, onComplete]);

  return <Survey model={survey} />;
}
