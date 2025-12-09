import { Survey, SurveyQuestionOption, SurveyResponse } from "@/model/survey";

export type CreateSurveyQuestionOptionPayload = Pick<
  SurveyQuestionOption,
  "is_other" | "option_text" | "priority" | "survey_question_id"
>;

export type UpdateSurveyQuestionOptionPayload = Pick<
  SurveyQuestionOption,
  "id" | "is_other" | "option_text" | "priority" | "survey_question_id"
>;

export type UpsertSurveyQuestionOptionPayload =
  | {
      action: "create";
      payload: CreateSurveyQuestionOptionPayload;
    }
  | {
      action: "update";
      payload: UpdateSurveyQuestionOptionPayload;
    };
