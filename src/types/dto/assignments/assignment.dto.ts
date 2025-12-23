import { Database } from "@/types/supabase.types";

import { QuestionOption } from "./question-option.dto";

export class AssignmentDto {
  id!: string;
  name!: string;
  description!: string;
  created_by!: string;
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
  created_at!: string;
  updated_at!: string;
  questions!: Array<{
    id: string;
    label: string;
    type: Database["public"]["Enums"]["question_type"];
    score: number;
    options?: QuestionOption[];
    attachments?: string[];
    created_at: string;
    updated_at: string;
  }>;
  assignment_categories!: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
    } | null;
  }>;
  assignment_employees!: Array<{
    employee_id: string;
    employees: {
      id: string;
      employee_code: string;
      profiles: {
        id: string;
        full_name: string;
        email: string;
        avatar: string | null;
      } | null;
    } | null;
  }>;
  assignmentEmployees?: Array<{
    count: number;
  }>;
  submissions?: Array<{
    count: number;
  }>;
}
