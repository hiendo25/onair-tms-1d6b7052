import { Survey, SurveyQuestion, SurveyQuestionOption, SurveyResponse } from "@/model/survey";

export type CreateSurveyQuestionPayload = Pick<
  SurveyQuestion,
  "is_required" | "name" | "priority" | "question_type" | "survey_id"
>;

export type UpdateSurveyQuestionPayload = Pick<
  SurveyQuestion,
  "id" | "is_required" | "name" | "priority" | "question_type"
>;
export type UpsertSurveyQuestionPayload =
  | {
      action: "create";
      payload: CreateSurveyQuestionPayload;
    }
  | {
      action: "update";
      payload: UpdateSurveyQuestionPayload;
    };
