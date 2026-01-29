import { createSVClient } from "@/services";
import type { FileMetadata } from "@/types/dto/assignments";
import type { Database, Json } from "@/types/supabase.types";

type AssignmentAttemptRow = Database["public"]["Tables"]["assignments_attempts"]["Row"];
type AssignmentAttemptInsert = Database["public"]["Tables"]["assignments_attempts"]["Insert"];
type AssignmentAttemptUpdate = Database["public"]["Tables"]["assignments_attempts"]["Update"];
type AssignmentResultRow = Database["public"]["Tables"]["assignment_results"]["Row"];
type AssignmentResultInsert = Database["public"]["Tables"]["assignment_results"]["Insert"];
type AssignmentResultUpdate = Database["public"]["Tables"]["assignment_results"]["Update"];
type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

export type FileAnswer = { files: FileMetadata[] };
export type TextAnswer = { text: string };
export type RadioAnswer = { selectedOptionId: string };
export type CheckboxAnswer = { selectedOptionIds: string[] };
export type MatchingAnswer = {
  mappings: Array<{ columnAId: string; columnBId: string }>;
};
export type OrderAnswer = {
  orderedItems: Array<{ id: string; position: number }>;
};
export type TrueFalseAnswer = { answer: boolean };

export type QuestionAnswer =
  | FileAnswer
  | TextAnswer
  | RadioAnswer
  | CheckboxAnswer
  | MatchingAnswer
  | OrderAnswer
  | TrueFalseAnswer;

export interface AssignmentAttemptWithEmployee {
  id: string;
  assignment_config_id: string;
  employee_id: string;
  attempt_number: number;
  status: AttemptStatus;
  submitted_at: string | null;
  created_at: string;
  score: number | null;
  max_score: number | null;
  feedback: string | null;
  employee: {
    employee_code: string;
    profiles: {
      full_name: string;
      email: string;
      avatar: string | null;
    } | null;
  } | null;
}

export async function getLatestAssignmentAttempt(
  assignment_config_id: string,
  employeeId: string,
): Promise<AssignmentAttemptRow | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignments_attempts")
    .select("*")
    .eq("assignment_config_id", assignment_config_id)
    .eq("employee_id", employeeId)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment attempt: ${error.message}`);
  }

  return data ?? null;
}

export async function getActiveAssignmentAttempt(
  assignment_config_id: string,
  employeeId: string,
): Promise<AssignmentAttemptRow | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignments_attempts")
    .select("*")
    .eq("assignment_config_id", assignment_config_id)
    .eq("employee_id", employeeId)
    .eq("status", "in_progress")
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch active assignment attempt: ${error.message}`);
  }

  return data ?? null;
}

export async function getAssignmentAttemptById(attemptId: string): Promise<AssignmentAttemptRow | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignments_attempts")
    .select("*")
    .eq("id", attemptId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment attempt: ${error.message}`);
  }

  return data ?? null;
}

export async function createAssignmentAttempt(data: {
  assignment_config_id: string;
  employee_id: string;
  attempt_number: number;
  status: AttemptStatus;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  feedback?: string | null;
  started_at?: string | null;
  expires_at?: string | null;
  duration_minutes_snapshot?: number | null;
  submission_source?: Database["public"]["Enums"]["assignment_attempt_source"] | null;
}): Promise<AssignmentAttemptRow> {
  const supabase = await createSVClient();

  const insertData: AssignmentAttemptInsert = {
    assignment_config_id: data.assignment_config_id,
    employee_id: data.employee_id,
    attempt_number: data.attempt_number,
    status: data.status,
    submitted_at: data.submitted_at,
    score: data.score,
    max_score: data.max_score,
    feedback: data.feedback ?? null,
    started_at: data.started_at ?? null,
    expires_at: data.expires_at ?? null,
    duration_minutes_snapshot: data.duration_minutes_snapshot ?? null,
    submission_source: data.submission_source ?? null,
  };

  const { data: result, error } = await supabase.from("assignments_attempts").insert(insertData).select().single();

  if (error) {
    throw new Error(`Failed to create assignment attempt: ${error.message}`);
  }

  return result;
}

export async function updateAssignmentAttempt(
  id: string,
  data: {
    score?: number | null;
    max_score?: number | null;
    status?: AttemptStatus;
    submitted_at?: string | null;
    feedback?: string | null;
    graded_by?: string | null;
    started_at?: string | null;
    expires_at?: string | null;
    duration_minutes_snapshot?: number | null;
    submission_source?: Database["public"]["Enums"]["assignment_attempt_source"] | null;
  },
): Promise<void> {
  const supabase = await createSVClient();

  const updateData: AssignmentAttemptUpdate = {};

  if (data.score !== undefined) {
    updateData.score = data.score;
  }
  if (data.max_score !== undefined) {
    updateData.max_score = data.max_score;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.submitted_at !== undefined) {
    updateData.submitted_at = data.submitted_at;
  }
  if (data.feedback !== undefined) {
    updateData.feedback = data.feedback;
  }
  if (data.graded_by !== undefined) {
    updateData.graded_by = data.graded_by;
  }
  if (data.started_at !== undefined) {
    updateData.started_at = data.started_at;
  }
  if (data.expires_at !== undefined) {
    updateData.expires_at = data.expires_at;
  }
  if (data.duration_minutes_snapshot !== undefined) {
    updateData.duration_minutes_snapshot = data.duration_minutes_snapshot;
  }
  if (data.submission_source !== undefined) {
    updateData.submission_source = data.submission_source;
  }

  const { error } = await supabase.from("assignments_attempts").update(updateData).eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment attempt: ${error.message}`);
  }
}

export async function createAssignmentResults(
  results: Array<{
    attempt_id: string;
    question_id: string;
    answer: Json | null;
    score: number | null;
    is_correct: boolean | null;
  }>,
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  const supabase = await createSVClient();

  const insertData: AssignmentResultInsert[] = results.map((result) => ({
    attempt_id: result.attempt_id,
    question_id: result.question_id,
    answer: result.answer ?? null,
    score: result.score ?? null,
    is_correct: result.is_correct ?? null,
  }));

  const { error } = await supabase.from("assignment_results").insert(insertData);

  if (error) {
    throw new Error(`Failed to create assignment results: ${error.message}`);
  }
}

export async function updateAssignmentResult(
  attemptId: string,
  questionId: string,
  data: {
    score?: number | null;
    is_correct?: boolean | null;
    answer?: Json | null;
  },
): Promise<void> {
  const supabase = await createSVClient();

  const updateData: AssignmentResultUpdate = {};

  if (data.score !== undefined) {
    updateData.score = data.score;
  }
  if (data.is_correct !== undefined) {
    updateData.is_correct = data.is_correct;
  }
  if (data.answer !== undefined) {
    updateData.answer = data.answer;
  }

  const { error } = await supabase
    .from("assignment_results")
    .update(updateData)
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);

  if (error) {
    throw new Error(`Failed to update assignment result: ${error.message}`);
  }
}

export async function getAssignmentResultsByAttemptId(attemptId: string): Promise<AssignmentResultRow[]> {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("assignment_results").select("*").eq("attempt_id", attemptId);

  if (error) {
    throw new Error(`Failed to fetch assignment results: ${error.message}`);
  }

  return data ?? [];
}

export async function deleteAssignmentResultsByAttemptId(attemptId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_results").delete().eq("attempt_id", attemptId);

  if (error) {
    throw new Error(`Failed to delete assignment results: ${error.message}`);
  }
}

export async function getAssignmentAttemptWithEmployee(
  assignmentId: string,
  employeeId: string,
): Promise<AssignmentAttemptWithEmployee | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignments_attempts")
    .select(
      `
      id,
      assignment_config_id,
      employee_id,
      attempt_number,
      status,
      submitted_at,
      created_at,
      score,
      max_score,
      feedback,
      employees!assignments_attempts_employee_id_fkey (
        employee_code,
        profiles!profiles_employee_id_fkey (
          full_name,
          email,
          avatar
        )
      )
    `,
    )
    .eq("assignment_config_id", assignmentId)
    .eq("employee_id", employeeId)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment attempt: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    assignment_config_id: data.assignment_config_id,
    employee_id: data.employee_id,
    attempt_number: data.attempt_number,
    status: data.status,
    submitted_at: data.submitted_at,
    created_at: data.created_at,
    score: data.score,
    max_score: data.max_score,
    feedback: data.feedback,
    employee: data.employees as AssignmentAttemptWithEmployee["employee"],
  };
}

export async function deleteAssignmentResultsByAssignmentId(assignmentId: string): Promise<void> {
  const supabase = await createSVClient();

  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("id")
    .eq("assignment_config_id", assignmentId);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  const attemptIds = (attempts ?? []).map((attempt) => attempt.id);

  if (attemptIds.length > 0) {
    const { error: resultsError } = await supabase
      .from("assignment_results")
      .delete()
      .in("attempt_id", attemptIds);

    if (resultsError) {
      throw new Error(`Failed to delete assignment results: ${resultsError.message}`);
    }
  }

  const { error } = await supabase.from("assignments_attempts").delete().eq("assignment_config_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment attempts: ${error.message}`);
  }
}

export async function deleteAssignmentAttemptById(attemptId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignments_attempts").delete().eq("id", attemptId);

  if (error) {
    throw new Error(`Failed to delete assignment attempt: ${error.message}`);
  }
}

export async function deleteAssignmentResultsByEmployeeId(employeeId: string): Promise<void> {
  const supabase = await createSVClient();

  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("id")
    .eq("employee_id", employeeId);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts by employee: ${attemptsError.message}`);
  }

  const attemptIds = (attempts ?? []).map((attempt) => attempt.id);

  if (attemptIds.length > 0) {
    const { error: resultsError } = await supabase
      .from("assignment_results")
      .delete()
      .in("attempt_id", attemptIds);

    if (resultsError) {
      throw new Error(`Failed to delete assignment results by employee: ${resultsError.message}`);
    }
  }

  const { error } = await supabase.from("assignments_attempts").delete().eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete assignment attempts by employee: ${error.message}`);
  }
}

export type { AssignmentAttemptRow, AssignmentResultRow };
