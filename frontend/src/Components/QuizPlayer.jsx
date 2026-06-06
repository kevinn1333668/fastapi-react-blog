import { useMemo } from "react";
import { Model } from "survey-react-ui";
import { Survey } from "survey-react-ui";
import "survey-core/survey-core.min.css";

export default function QuizPlayer({ schema, onComplete }) {
  const survey = useMemo(() => {
    const model = new Model(schema);
    model.showCompletedPage = false;
    model.completeText = "Отправить ответы";
    model.onComplete.add((sender) => {
      onComplete?.(sender.data);
    });
    return model;
  }, [schema, onComplete]);

  return <Survey model={survey} />;
}
