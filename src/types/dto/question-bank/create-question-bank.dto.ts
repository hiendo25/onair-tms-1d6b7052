import type { MatchingQuestionData, OrderItem } from "@/types/dto/assignments/create-assignment.dto";
import type { QuestionOption } from "@/types/dto/assignments/question-option.dto";
import type { Database } from "@/types/supabase.types";

export class CreateQuestionBankDto {
  questions!: Array<{
    type: Database["public"]["Enums"]["question_type"];
    label: string;
    score: number;
    options?: QuestionOption[];
    matchingData?: MatchingQuestionData;
    orderItems?: OrderItem[];
    attachments?: string[];
    difficulty?: Database["public"]["Enums"]["question_difficulty"] | null;
    questionCategories?: string[];
  }>;
  organizationId!: string;
}
