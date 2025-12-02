import { Database } from "@/types/supabase.types";
import { QuestionOption } from "./question-option.dto";

export interface MatchingPair {
  id: string;
  columnA: string;
  columnB: string;
}

export interface OrderItem {
  id: string;
  content: string;
  correctOrder: number;
}

export class CreateAssignmentDto {
  name!: string;
  description!: string;
  assignmentCategories?: string[]; // category IDs
  questions!: Array<{
    type: Database["public"]["Enums"]["question_type"];
    label: string;
    score: number;
    options?: QuestionOption[];
    matchingPairs?: MatchingPair[];
    orderItems?: OrderItem[];
    attachments?: string[];
  }>;
  assignedEmployees!: string[]; // employee IDs
}

