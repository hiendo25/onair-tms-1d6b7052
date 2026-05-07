import { Database } from "@/types/supabase.types";

type AssignmentAttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

export interface MyAssignmentDto {
  assignment_id: string;
  assignment_name: string;
  assignment_description: string;
  created_at: string;
  available_from?: string | null;
  available_to?: string | null;
  pass_score: number | null;
  attempt_limit: number | null;
  attempts_used: number;
  attempts_remaining: number | null;
  can_retry: boolean;
  has_submitted: boolean;
  has_active_attempt: boolean;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  status: AssignmentAttemptStatus | null;
}
