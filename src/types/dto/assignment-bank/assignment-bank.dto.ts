import type { Database } from "@/types/supabase.types";

export class AssignmentBankDto {
  id!: string;
  name!: string;
  description!: string;
  duration_minutes?: number | null;
  pass_score?: number | null;
  shuffle_questions?: boolean | null;
  shuffle_answers?: boolean | null;
  created_by!: string;
  organization_id?: string | null;
  created_at!: string;
  updated_at!: string;
  createdBy?: {
    id: string;
    employee_code: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
      avatar: string | null;
    } | null;
  } | null;
  assignment_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string | null;
    } | null;
  }>;
  assignment_questions?: Array<{
    question_id: string;
    order_index: number;
    score_override?: number | null;
    question_bank?: {
      id: string;
      label: string;
      type: Database["public"]["Enums"]["question_type"];
      score: number;
      options?: Database["public"]["Tables"]["question_bank"]["Row"]["options"] | null;
      difficulty?: Database["public"]["Enums"]["question_difficulty"] | null;
      question_bank_categories?: Array<{
        category_id: string;
        categories: {
          id: string;
          name: string | null;
        } | null;
      }>;
    } | null;
  }>;
}
