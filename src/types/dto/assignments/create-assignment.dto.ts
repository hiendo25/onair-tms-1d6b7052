import { Database } from "@/types/supabase.types";
import { QuestionOption } from "./question-option.dto";

export interface MatchingColumnItem {
  id: string;
  content: string;
}

export interface MatchingMapping {
  columnAId: string;
  columnBId: string;
}

export interface MatchingQuestionData {
  columnAItems: MatchingColumnItem[];
  columnBItems: MatchingColumnItem[];
  correctMappings: MatchingMapping[];
}

export interface OrderItem {
  id: string;
  content: string;
  correctOrder: number;
  displayOrder: number; // Shuffled display position (generated once, consistent for all students)
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
    matchingData?: MatchingQuestionData;
    orderItems?: OrderItem[];
    attachments?: string[];
  }>;
  assignedEmployees!: string[]; // employee IDs
}

