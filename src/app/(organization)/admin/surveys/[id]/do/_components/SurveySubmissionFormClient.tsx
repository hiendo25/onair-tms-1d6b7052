"use client";
import React, { useMemo } from "react";

import SurveySubmissionForm, { SurveySubmissionFormProps } from "@/modules/surveys/components/SurveySubmitionForm";
import { GetSurveyByIdResponse } from "@/repository/surveys";
interface SurveySubmissionFormClientProps {
  data: NonNullable<GetSurveyByIdResponse["data"]>;
}
const SurveySubmissionFormClient: React.FC<SurveySubmissionFormClientProps> = ({ data }) => {
  console.log({ data });

  type QuestionFormItem = Exclude<SurveySubmissionFormProps["initialData"], undefined>["questions"][number];
  const surveyFormData = useMemo((): Exclude<SurveySubmissionFormProps["initialData"], undefined> => {
    const { id: surveyId, surveys_questions } = data;

    return {
      surveyId,
      questions: surveys_questions.reduce<QuestionFormItem[]>((questions, question) => {
        const baseQuestion = {
          questionId: question.id,
          isRequired: question.is_required,
          questionName: question.name || "",
        };
        const options = question.surveys_questions_options.map((opt) => ({
          id: opt.id,
          isOther: opt.is_other ?? false,
          text: opt.option_text ?? "",
          priority: opt.priority || 0,
        }));

        console.log({ options });

        let questionItem: QuestionFormItem;
        switch (question.question_type) {
          case "text": {
            questionItem = {
              ...baseQuestion,
              type: "text",
              answer: { text: "" },
            };
            break;
          }
          case "checkbox": {
            questionItem = {
              type: "checkbox",
              options: options,
              ...baseQuestion,
              answer: [],
            };
            break;
          }
          case "radio": {
            questionItem = {
              type: "radio",
              ...baseQuestion,
              options: options,
              answer: { isOther: false, text: "", value: "" },
            };
            break;
          }
          case "rating": {
            questionItem = {
              type: "rating",
              ...baseQuestion,
              options: options,
              answer: {
                value: undefined,
              },
            };
            break;
          }
          case "yes_no": {
            questionItem = {
              type: "yes_no",
              ...baseQuestion,
              answer: {
                value: undefined,
              },
            };
            break;
          }
          case "rating_sort": {
            questionItem = {
              type: "rating_sort",
              ...baseQuestion,
              options: options,
              answer: options.map((opt) => ({ value: opt.id, priority: opt.priority, text: opt.text })),
            };
            break;
          }
        }

        return questionItem ? [...questions, questionItem] : questions;
      }, []),
    };
  }, [data]);
  return <SurveySubmissionForm initialData={surveyFormData} onSubmit={() => {}} />;
};
export default SurveySubmissionFormClient;
