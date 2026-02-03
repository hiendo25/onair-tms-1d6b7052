import { Database } from "@/types/supabase.types";

type AssignmentAttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

export interface AssignmentStudentDto {
  id: string;
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  avatar: string | null;
  department_name: string | null;
  has_submitted: boolean;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  status: AssignmentAttemptStatus | null;
}
