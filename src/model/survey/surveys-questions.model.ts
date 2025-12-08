import { Tables } from "@/types/supabase.types";
export type SurveyQuestion = Tables<"surveys_questions">;
export type SurveyQuestionOption = Tables<"surveys_questions_options">;
export type SurveyQuestionType = Required<SurveyQuestion["question_type"]>;
