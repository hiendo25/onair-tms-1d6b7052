import { SurveyAnswer } from "@/model/survey";

export type CreateSurveyAnswersPayload = Pick<
  SurveyAnswer,
  "answer_value" | "question_id" | "response_id" | "question_text" | "question_type"
>;

export type UpdateSurveyAnswers = Pick<SurveyAnswer, "id" | "answer_value" | "question_id" | "response_id">;

export type UpsertSurveyAnswers =
  | {
      action: "create";
      payload: CreateSurveyAnswersPayload;
    }
  | {
      action: "update";
      payload: UpdateSurveyAnswers;
    };
