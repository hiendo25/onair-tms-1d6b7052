"use client";
import React, { useMemo } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import SurveySubmissionForm, { SurveySubmissionFormProps } from "@/modules/surveys/components/SurveySubmissionForm";
import { useSubmissionSurvey } from "@/modules/surveys/hooks/useSubmissionSurvey";
import { GetSurveyByIdResponse } from "@/repository/surveys";
interface SurveySubmissionFormClientProps {
  data: NonNullable<GetSurveyByIdResponse["data"]>;
}
const SurveySubmissionFormClient: React.FC<SurveySubmissionFormClientProps> = ({ data }) => {
  const router = useRouter();
  const [isTransition, startTransition] = useTransition();
  const { create: submitSurvey, isLoading } = useSubmissionSurvey();

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

        let questionItem: QuestionFormItem;
        switch (question.question_type) {
          case "text": {
            questionItem = {
              ...baseQuestion,
              type: "text",
              answer: { value: "" },
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
              answer: undefined,
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
          case "sort_rating": {
            questionItem = {
              type: "sort_rating",
              ...baseQuestion,
              options: options,
              answer: options.map((opt) => ({ optionId: opt.id, priority: opt.priority, optionText: opt.text })),
            };
            break;
          }
        }

        return questionItem ? [...questions, questionItem] : questions;
      }, []),
    };
  }, [data]);

  const handleSubmitForm: SurveySubmissionFormProps["onSubmit"] = (data) => {
    submitSurvey(
      { formData: data, targetId: undefined, targetType: undefined },
      {
        onSuccess(data) {
          startTransition(() => {
            enqueueSnackbar("Gửi khảo sát thành công", { variant: "success" });
            router.push(PATHS.SURVEYS.THANK_YOU(data.survey_id, { responseId: data.id }));
          });
        },
      },
    );
  };
  const handleCancel = () => {
    startTransition(() => {
      router.back();
    });
  };
  return (
    <SurveySubmissionForm
      initialData={surveyFormData}
      onSubmit={handleSubmitForm}
      onCancel={handleCancel}
      isLoading={isLoading || isTransition}
    />
  );
};
export default SurveySubmissionFormClient;
