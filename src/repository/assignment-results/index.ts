import { createSVClient } from "@/services";
import { Database } from "@/types/supabase.types";
import { QuestionOption, FileMetadata } from "@/types/dto/assignments";

type AssignmentResultInsert = Database["public"]["Tables"]["assignment_results"]["Insert"];
type AssignmentResultRow = Database["public"]["Tables"]["assignment_results"]["Row"];
type QuestionType = Database["public"]["Enums"]["question_type"];
type AssignmentResultStatus = Database["public"]["Enums"]["assignment_result_status"];

export type FileAnswer = { files: FileMetadata[] };
export type TextAnswer = { text: string };
export type RadioAnswer = { selectedOptionId: string };
export type CheckboxAnswer = { selectedOptionIds: string[] };

export type QuestionAnswer = FileAnswer | TextAnswer | RadioAnswer | CheckboxAnswer;

export interface QuestionWithAnswer {
  id: string;
  label: string;
  type: QuestionType;
  score: number;
  options?: QuestionOption[];
  attachments?: string[];
  created_at: string;
  updated_at: string;
  answer: QuestionAnswer;
  answerAttachments?: FileMetadata[];
  earnedScore: number | null;
  feedback?: string;
}

export interface SubmissionData {
  assignment: {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  questions: QuestionWithAnswer[];
}

export interface AnswerData {
  questionId: string;
  questionLabel: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  answer: string | string[] | FileMetadata[];
}

export async function createAssignmentResult(data: {
  assignment_id: string;
  employee_id: string;
  submissionData: SubmissionData;
  score: number | null;
  max_score: number;
  status: AssignmentResultStatus;
}): Promise<AssignmentResultRow> {
  const supabase = await createSVClient();

  const insertData: AssignmentResultInsert = {
    assignment_id: data.assignment_id,
    employee_id: data.employee_id,
    data: data.submissionData as any,
    score: data.score ?? 0,
    max_score: data.max_score,
    status: data.status,
  };

  const { data: result, error } = await supabase
    .from("assignment_results")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assignment result: ${error.message}`);
  }

  return result;
}

export async function getAssignmentResult(
  assignmentId: string,
  employeeId: string
): Promise<AssignmentResultRow | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignment_results")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment result: ${error.message}`);
  }

  return data;
}

export async function updateAssignmentResult(
  id: string,
  data: {
    submissionData?: SubmissionData;
    score?: number | null;
    max_score?: number;
    status?: AssignmentResultStatus;
    feedback?: string | null;
  }
): Promise<void> {
  const supabase = await createSVClient();

  const updateData: Database["public"]["Tables"]["assignment_results"]["Update"] = {};

  if (data.submissionData !== undefined) {
    updateData.data = data.submissionData as any;
  }

  if (data.score !== undefined) {
    updateData.score = data.score ?? 0;
  }

  if (data.max_score !== undefined) {
    updateData.max_score = data.max_score;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.feedback !== undefined) {
    updateData.feedback = data.feedback;
  }

  const { error } = await supabase
    .from("assignment_results")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment result: ${error.message}`);
  }
}

export async function deleteAssignmentResult(id: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("assignment_results")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete assignment result: ${error.message}`);
  }
}

export async function deleteAssignmentResultsByAssignmentId(assignmentId: string): Promise<void> {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("assignment_results")
    .delete()
    .eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment results: ${error.message}`);
  }
}

export interface AssignmentResultWithEmployee {
  id: string;
  assignment_id: string;
  employee_id: string;
  data: SubmissionData;
  score: number;
  max_score: number | null;
  status: AssignmentResultStatus;
  created_at: string;
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

export async function getAssignmentResultWithEmployee(
  assignmentId: string,
  employeeId: string
): Promise<AssignmentResultWithEmployee | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("assignment_results")
    .select(`
      id,
      assignment_id,
      employee_id,
      data,
      score,
      max_score,
      status,
      created_at,
      feedback,
      employees!assignment_results_employee_id_fkey (
        employee_code,
        profiles!profiles_employee_id_fkey (
          full_name,
          email,
          avatar
        )
      )
    `)
    .eq("assignment_id", assignmentId)
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment result with employee: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    assignment_id: data.assignment_id,
    employee_id: data.employee_id,
    data: data.data as unknown as SubmissionData,
    score: data.score,
    max_score: data.max_score,
    status: data.status,
    created_at: data.created_at,
    feedback: data.feedback,
    employee: data.employees as any,
  };
}
