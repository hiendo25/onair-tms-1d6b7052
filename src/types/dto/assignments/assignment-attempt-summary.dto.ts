import { Database } from "@/types/supabase.types";

type AttemptStatus = Database["public"]["Enums"]["test_attempt_status"];

export interface AssignmentAttemptSummaryDto {
  attemptsUsed: number;
  attemptsRemaining: number | null;
  attemptLimit: number | null;
  availableFrom: string | null;
  availableTo: string | null;
  attemptDurationMinutes: number | null;
  latestAttempt: {
    id: string;
    status: AttemptStatus;
    submittedAt: string | null;
    createdAt: string;
    score: number | null;
    maxScore: number | null;
    attemptNumber: number;
  } | null;
}
