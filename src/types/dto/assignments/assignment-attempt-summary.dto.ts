import { Database } from "@/types/supabase.types";

type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];
type AttemptSource = Database["public"]["Enums"]["assignment_attempt_source"];

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
    startedAt: string | null;
    expiresAt: string | null;
    durationMinutesSnapshot: number | null;
    submissionSource: AttemptSource | null;
    score: number | null;
    maxScore: number | null;
    attemptNumber: number;
  } | null;
}
