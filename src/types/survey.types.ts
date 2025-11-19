export type QuestionType = "text" | "radio" | "checkbox" | "rating" | "select";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  is_required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  total_submissions: number;
  created_at: string;
}

export interface SurveyFormData {
  name: string;
  description: string;
  questions: Question[];
}

