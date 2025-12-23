"use client";
import React, { useMemo } from "react";

import SurveySubmissionForm, { SurveySubmissionFormProps } from "@/modules/surveys/components/SurveySubmitionForm";
import { GetSurveyByIdResponse } from "@/repository/surveys";
interface SurveySubmissionFormClientProps {
  data: NonNullable<GetSurveyByIdResponse["data"]>;
}
const SurveySubmissionFormClient: React.FC<SurveySubmissionFormClientProps> = ({ data }) => {
  console.log({ data });
  const surveyFormData = useMemo((): Exclude<SurveySubmissionFormProps["initialData"], undefined> => {
    const { id: surveyId, surveys_questions } = data;

    return {
      surveyId,
      questions: surveys_questions.reduce<Exclude<SurveySubmissionFormProps["initialData"], undefined>["questions"]>(
        (questions, question) => {
          let answer:
            | Exclude<SurveySubmissionFormProps["initialData"], undefined>["questions"][number]["answer"]
            | undefined;

          switch (question.question_type) {
            case "text": {
              answer = {
                type: "text",
                text: "",
              };
              break;
            }
            case "checkbox": {
              answer = {
                type: "checkbox",
                values: [],
              };
              break;
            }
            case "radio": {
              answer = {
                type: "radio",
                value: "",
                text: "",
                isOther: false,
              };
              break;
            }
            case "rating": {
              answer = {
                type: "rating",
                value: 0,
              };
              break;
            }
            case "yes_no": {
              answer = {
                type: "yes_no",
                value: "",
              };
              break;
            }
            case "rating_sort": {
              answer = {
                type: "rating_sort",
                values: [],
              };
              break;
            }
          }

          return answer
            ? [
                ...questions,
                {
                  id: question.id,
                  type: question.question_type,
                  name: question.name || "",
                  isRequred: question.is_required,
                  options: question.surveys_questions_options.map((opt) => ({
                    id: opt.id,
                    isOther: opt.is_other ?? false,
                    text: opt.option_text ?? "",
                  })),
                  answer: answer,
                },
              ]
            : questions;
        },
        [],
      ),
    };
  }, [data]);
  return (
    <>
      <SurveySubmissionForm initialData={surveyFormData} onSubmit={() => {}} />
    </>
  );
};
export default SurveySubmissionFormClient;
