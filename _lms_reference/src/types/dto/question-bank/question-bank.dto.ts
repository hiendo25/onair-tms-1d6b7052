import type { Database, Json } from "@/types/supabase.types";

export class QuestionBankDto {
  id!: string;
  label!: string;
  type!: Database["public"]["Enums"]["question_type"];
  score!: number;
  options?: Json | null;
  attachments?: string[] | null;
  difficulty?: Database["public"]["Enums"]["question_difficulty"] | null;
  created_by!: string;
  createdBy?: {
    id: string;
    employee_code: string;
    organization_id: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
      avatar: string | null;
    } | null;
  } | null;
  created_at!: string;
  updated_at!: string;
  question_bank_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string | null;
    } | null;
  }>;
}
