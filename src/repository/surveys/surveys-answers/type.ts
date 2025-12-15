import { SurveyAnswer } from "@/model/survey";

export type CreateSurveyAnswers = Pick<SurveyAnswer, "option_id" | "question_id" | "response_id">;

export type UpdateSurveyAnswers = Pick<SurveyAnswer, "id" | "option_id" | "question_id" | "response_id">;

export type UpsertSurveyAnswers =
  | {
      action: "create";
      payload: CreateSurveyAnswers;
    }
  | {
      action: "update";
      payload: UpdateSurveyAnswers;
    };
