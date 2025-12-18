import { Database } from "@/types/supabase.types";

import { QuestionOption } from "./question-option.dto";

export interface AssignmentQuestionDto {
  id: string;
  assignment_id: string;
  label: string;
  type: Database["public"]["Enums"]["question_type"];
  score: number;
  options?: QuestionOption[];
  attachments?: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}
