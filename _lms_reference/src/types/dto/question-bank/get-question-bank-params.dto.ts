import type { Database } from "@/types/supabase.types";

export interface GetQuestionBankParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
  questionType?: Database["public"]["Enums"]["question_type"];
  categoryId?: string;
}
