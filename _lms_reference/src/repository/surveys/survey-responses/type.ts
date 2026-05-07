import { SurveyAnswer, SurveyResponse } from "@/model/survey";
import { SurveyQuestionType } from "@/model/survey";

export type SurveyResponseAnswerValueType<K extends SurveyQuestionType = SurveyQuestionType> = K extends "text"
  ? { value: string }
  : K extends "rating"
  ? { value: number }
  : K extends "sort_rating"
  ? { optionId: string; optionText: string; priority: number }[]
  : K extends "checkbox"
  ? { optionId: string; optionText: string; otherText: string; isOther: boolean }[]
  : K extends "radio"
  ? { optionId: string; optionText: string; otherText: string; isOther: boolean }
  : K extends "yes_no"
  ? { value: "yes" | "no" }
  : never;

export type AnswerByQuestionType = {
  [K in SurveyQuestionType]: {
    question_type: K;
    answer_value: SurveyResponseAnswerValueType<K>;
  };
}[SurveyQuestionType];
export type CreateSurveyResponsePayload = Pick<
  SurveyResponse,
  "employee_id" | "survey_id" | "target_id" | "target_type"
>;

export type CreateAnswerResponsePayload = Pick<
  SurveyAnswer,
  "question_id" | "question_text" | "question_type" | "response_id"
> & {
  answer_value: SurveyResponseAnswerValueType | null;
};
