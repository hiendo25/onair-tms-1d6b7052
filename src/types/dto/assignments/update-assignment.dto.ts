import { Database } from "@/types/supabase.types";
import { QuestionOption } from "./question-option.dto";

export class UpdateAssignmentDto {
  id!: string;
  name!: string;
  description!: string;
  assignmentCategories?: string[]; // category IDs
  questions!: Array<{
    type: Database["public"]["Enums"]["question_type"];
    label: string;
    score: number;
    options?: QuestionOption[];
    attachments?: string[];
  }>;
  assignedEmployees!: string[]; // employee IDs
}

