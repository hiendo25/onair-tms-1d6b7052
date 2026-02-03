import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/services";
import { createClient, createSVClient } from "@/services";
import type {
  AssignedAssignmentItemDto,
  AssignedAssignmentsSummaryDto,
  AssignmentAssignedDto,
  AssignmentAssignedStatus,
  AssignmentDto,
  AssignmentQuestionDto,
  AssignmentStudentDto,
  AssignmentStudentProgressStatus,
  AssignmentStudentSummaryDto,
  GetAssignedAssignmentsParams,
  GetAssignmentsParams,
  GetAssignmentStudentsParams,
  GetMyAssignmentsParams,
  QuestionOption,
} from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import type { Database } from "@/types/supabase.types";

import { GetAssignmentsQueryParams } from "./type";

type AssignmentRepositoryClient = SupabaseClient<Database>;
type AttemptStatus = Database["public"]["Enums"]["assignment_attempt_status"];

interface AssignmentBankQuestionRow {
  question_id: string;
  order_index: number;
  score_override: number | null;
  question_bank: {
    id: string;
    label: string;
    type: Database["public"]["Enums"]["question_type"];
    score: number;
    options: Database["public"]["Tables"]["question_bank"]["Row"]["options"];
    attachments: Database["public"]["Tables"]["question_bank"]["Row"]["attachments"];
    created_at: string;
    updated_at: string;
    created_by: string;
  } | null;
}

interface AssignmentBankRow {
  id: string;
  name: string;
  description: string;
  pass_score?: number | null;
  shuffle_questions?: boolean | null;
  shuffle_answers?: boolean | null;
  hide_correct_answers?: boolean | null;
  created_by: string;
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
  assignment_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
    } | null;
  }>;
  assignment_questions?: AssignmentBankQuestionRow[];
}

interface AssignmentEmployeeRow {
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
    employee_departments?: Array<{
      departments: {
        id: string;
        name: string;
      } | null;
    }>;
  } | null;
}

interface AssignmentRecord {
  id: string;
  assigned_by?: string | null;
  created_at: string;
  updated_at?: string;
  attempt_duration_minutes?: number | null;
  attempt_limit?: number | null;
  available_from?: string | null;
  available_to?: string | null;
  assignment_bank?: AssignmentBankRow | null;
  assignment_employees?: AssignmentEmployeeRow[];
  assignmentEmployees?: Array<{ count: number }>;
  submissions?: Array<{ count: number }>;
}

interface MyAssignmentRpcRow {
  assignment_id: string;
  assignment_name: string | null;
  assignment_description: string | null;
  created_at: string;
  available_from: string | null;
  available_to: string | null;
  pass_score: number | null;
  attempt_limit: number | null;
  attempts_used: number | string | null;
  has_submitted: boolean | null;
  has_active_attempt: boolean | null;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  status: AttemptStatus | null;
  total_count: number | string | null;
}

const SUBMITTED_STATUSES: AttemptStatus[] = ["submitted", "graded"];
const ASSIGNED_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  NOT_STARTED: "not_started",
} as const;

const resolveAssignedStatus = (assignedCount: number, completedCount: number): AssignmentAssignedStatus => {
  if (assignedCount === 0 || completedCount === 0) {
    return ASSIGNED_STATUS.NOT_STARTED;
  }
  if (completedCount >= assignedCount) {
    return ASSIGNED_STATUS.COMPLETED;
  }
  return ASSIGNED_STATUS.IN_PROGRESS;
};

const mapAssignmentQuestions = (assignmentBank?: AssignmentBankRow | null) => {
  if (!assignmentBank?.assignment_questions?.length) {
    return [];
  }

  return [...assignmentBank.assignment_questions]
    .sort((left, right) => left.order_index - right.order_index)
    .map((item) => {
      const question = item.question_bank;
      if (!question) {
        return null;
      }

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        score: item.score_override ?? question.score,
        options: question.options ? (question.options as QuestionOption[]) : undefined,
        attachments: question.attachments ?? undefined,
        created_at: question.created_at,
        updated_at: question.updated_at,
        created_by: question.created_by,
      };
    })
    .filter((question): question is AssignmentDto["questions"][number] => Boolean(question));
};

const mapAssignmentRecord = (record: AssignmentRecord): AssignmentDto => {
  const assignmentBank = record.assignment_bank ?? null;

  return {
    id: record.id,
    name: assignmentBank?.name ?? "",
    description: assignmentBank?.description ?? "",
    created_by: assignmentBank?.created_by ?? record.assigned_by ?? "",
    pass_score: assignmentBank?.pass_score ?? null,
    createdBy: assignmentBank?.createdBy ?? null,
    created_at: record.created_at,
    updated_at: record.updated_at ?? record.created_at,
    attempt_duration_minutes: record.attempt_duration_minutes ?? null,
    attempt_limit: record.attempt_limit ?? null,
    available_from: record.available_from ?? null,
    available_to: record.available_to ?? null,
    shuffle_questions: assignmentBank?.shuffle_questions ?? null,
    shuffle_answers: assignmentBank?.shuffle_answers ?? null,
    hide_correct_answers: assignmentBank?.hide_correct_answers ?? null,
    questions: mapAssignmentQuestions(assignmentBank),
    assignment_categories: assignmentBank?.assignment_categories ?? [],
    assignment_employees: record.assignment_employees ?? [],
    assignmentEmployees: record.assignmentEmployees ?? [],
    submissions: record.submissions ?? [],
  };
};

const getAssignments = async (params?: GetAssignmentsParams): Promise<PaginatedResult<AssignmentDto>> => {
  const { page = 0, limit = 20, search, organizationId, createdBy } = params || {};

  let query = supabase.from("assignment_config").select(
    `
      id,
      assigned_by,
      organization_id,
      created_at,
      updated_at,
      assignment_bank (
        id,
        name,
        description,
        pass_score,
        created_by,
        createdBy:employees!assignments_created_by_fkey (
          id,
          employee_code,
          profiles (
            id,
            full_name,
            email,
            avatar
          )
        ),
        assignment_categories (
          category_id,
          categories (
            id,
            name
          )
        )
      ),
      assignmentEmployees:assignment_employees(count),
      submissions:assignments_attempts(count)
    `,
    { count: "exact" },
  );

  if (search) {
    query = query.ilike("assignment_bank.name", `%${search}%`);
  }

  if (createdBy) {
    query = query.eq("assignment_bank.created_by", createdBy);
  }
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }

  const assignments = (data as AssignmentRecord[])?.map((item) => mapAssignmentRecord(item)) || [];

  return {
    data: assignments,
    total: count ?? 0,
    page,
    limit,
  };
};

const getAssignmentConfigById = async (id: string): Promise<AssignmentDto> => {
  const { data, error } = await supabase
    .from("assignment_config")
    .select(
      `
      id,
      assigned_by,
      created_at,
      updated_at,
      attempt_duration_minutes,
      attempt_limit,
      available_from,
      available_to,
      assignment_bank!inner (
        id,
        name,
        description,
        created_by,
        pass_score,
        shuffle_questions,
        shuffle_answers,
        hide_correct_answers,
        createdBy:employees!assignments_created_by_fkey (
          id,
          employee_code,
          profiles (
            id,
            full_name,
            email,
            avatar
          )
        ),
        assignment_categories (
          category_id,
          categories (
            id,
            name
          )
        ),
        assignment_questions (
          question_id,
          order_index,
          score_override,
          question_bank (
            id,
            label,
            type,
            score,
            options,
            attachments,
            created_at,
            updated_at,
            created_by
          )
        )
      ),
      assignment_employees (
        employee_id,
        employees (
          id,
          employee_code,
          profiles (
            id,
            full_name,
            email,
            avatar
          )
        )
      ),
      submissions:assignments_attempts(count)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  return mapAssignmentRecord(data as AssignmentRecord);
};

const getLatestAssignmentByBankId = async (
  assignmentBankId: string,
  organizationId?: string,
): Promise<AssignmentAssignedDto | null> => {
  let query = supabase
    .from("assignment_config")
    .select(
      `
      id,
      assignment_bank_id,
      attempt_limit,
      available_from,
      available_to,
      status,
      created_at,
      assignment_employees (
        employee_id,
        employees (
          id,
          employee_code,
          employee_type,
          profiles (
            id,
            full_name,
            email,
            avatar
          )
        )
      )
    `,
    )
    .eq("assignment_bank_id", assignmentBankId);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  return (data as AssignmentAssignedDto) ?? null;
};

export async function createAssignment(data: {
  assignment_bank_id: string;
  assigned_by: string;
  organization_id: string;
  attempt_duration_minutes?: number | null;
  attempt_limit?: number | null;
  available_from?: string | null;
  available_to?: string | null;
  status?: Database["public"]["Enums"]["assignment_config_status"];
  scope?: Database["public"]["Enums"]["assignment_config_type"] | null;
}) {
  const supabase = await createSVClient();

  const { data: assignment, error } = await supabase
    .from("assignment_config")
    .insert({
      assignment_bank_id: data.assignment_bank_id,
      assigned_by: data.assigned_by,
      organization_id: data.organization_id,
      attempt_duration_minutes: data.attempt_duration_minutes ?? null,
      attempt_limit: data.attempt_limit ?? null,
      available_from: data.available_from ?? null,
      available_to: data.available_to ?? null,
      status: data.status ?? "open",
      scope: data.scope ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`);
  }

  return assignment;
}

export async function createAssignmentFromBank(data: {
  assignment_bank_id: string;
  assigned_by: string;
  organization_id: string;
  attempt_duration_minutes?: number | null;
  attempt_limit?: number | null;
  available_from?: string | null;
  available_to?: string | null;
  status?: Database["public"]["Enums"]["assignment_config_status"];
  scope?: Database["public"]["Enums"]["assignment_config_type"] | null;
}) {
  const supabase = await createSVClient();

  const { data: assignment, error } = await supabase
    .from("assignment_config")
    .insert({
      assignment_bank_id: data.assignment_bank_id,
      assigned_by: data.assigned_by,
      organization_id: data.organization_id,
      attempt_duration_minutes: data.attempt_duration_minutes ?? null,
      attempt_limit: data.attempt_limit ?? null,
      available_from: data.available_from ?? null,
      available_to: data.available_to ?? null,
      status: data.status ?? "open",
      scope: data.scope ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assignment from bank: ${error.message}`);
  }

  return assignment;
}

export async function createAssignmentFromBankWithClient(
  client: SupabaseClient<Database>,
  data: {
    assignment_bank_id: string;
    assigned_by: string;
    organization_id: string;
    attempt_duration_minutes?: number | null;
    attempt_limit?: number | null;
    available_from?: string | null;
    available_to?: string | null;
    status?: Database["public"]["Enums"]["assignment_config_status"];
    scope?: Database["public"]["Enums"]["assignment_config_type"] | null;
  },
) {
  const { data: assignment, error } = await client
    .from("assignment_config")
    .insert({
      assignment_bank_id: data.assignment_bank_id,
      assigned_by: data.assigned_by,
      organization_id: data.organization_id,
      attempt_duration_minutes: data.attempt_duration_minutes ?? null,
      attempt_limit: data.attempt_limit ?? null,
      available_from: data.available_from ?? null,
      available_to: data.available_to ?? null,
      status: data.status ?? "open",
      scope: data.scope ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assignment from bank: ${error.message}`);
  }

  return assignment;
}

export async function updateAssignmentById(
  id: string,
  data: {
    assignment_bank_id?: string;
    assigned_by?: string;
    attempt_duration_minutes?: number | null;
    attempt_limit?: number | null;
    available_from?: string | null;
    available_to?: string | null;
    status?: Database["public"]["Enums"]["assignment_config_status"];
  },
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_config").update(data).eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment: ${error.message}`);
  }
}

export async function updateAssignmentByIdWithClient(
  client: AssignmentRepositoryClient,
  id: string,
  data: {
    attempt_limit?: number | null;
    available_from?: string | null;
    available_to?: string | null;
    status?: Database["public"]["Enums"]["assignment_config_status"];
  },
) {
  const { error } = await client.from("assignment_config").update(data).eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment: ${error.message}`);
  }
}

export async function deleteAssignmentById(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_config").delete().eq("id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }
}

export async function deleteAssignmentByIdWithClient(client: AssignmentRepositoryClient, assignmentId: string) {
  const { error } = await client.from("assignment_config").delete().eq("id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }
}

export async function deleteAssignmentsByEmployeeId(employeeId: string) {
  const { error } = await supabase.from("assignment_config").delete().eq("assigned_by", employeeId);

  if (error) {
    throw new Error(`Failed to delete assignments by employee: ${error.message}`);
  }
}

// Questions repository methods
export async function createQuestions(
  questions: Array<{
    type: Database["public"]["Enums"]["question_type"];
    label: string;
    score: number;
    options?: QuestionOption[] | null;
    attachments?: string[] | null;
    created_by: string;
  }>,
) {
  const supabase = await createSVClient();

  const questionsToInsert = questions.map((question) => ({
    ...question,
    options: question.options as any,
  }));

  const { error } = await supabase.from("question_bank").insert(questionsToInsert);

  if (error) {
    throw new Error(`Failed to create questions: ${error.message}`);
  }
}

export async function deleteQuestionsByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignment_config")
    .select("assignment_bank_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment bank: ${assignmentError.message}`);
  }

  if (!assignment?.assignment_bank_id) {
    return;
  }

  const { data: questions, error: questionsError } = await supabase
    .from("assignment_questions")
    .select("question_id")
    .eq("assignment_bank_id", assignment.assignment_bank_id);

  if (questionsError) {
    throw new Error(`Failed to fetch assignment questions: ${questionsError.message}`);
  }

  const questionIds = (questions ?? []).map((question) => question.question_id);

  const { error: deleteAssignmentQuestionsError } = await supabase
    .from("assignment_questions")
    .delete()
    .eq("assignment_bank_id", assignment.assignment_bank_id);

  if (deleteAssignmentQuestionsError) {
    throw new Error(`Failed to delete assignment questions: ${deleteAssignmentQuestionsError.message}`);
  }

  if (!questionIds.length) {
    return;
  }

  await supabase.from("question_bank_categories").delete().in("question_id", questionIds);
  await supabase.from("question_bank").delete().in("id", questionIds);
}

export async function deleteQuestionsByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { data: questions, error: questionsError } = await supabase
    .from("question_bank")
    .select("id")
    .eq("created_by", employeeId);

  if (questionsError) {
    throw new Error(`Failed to fetch questions by employee: ${questionsError.message}`);
  }

  const questionIds = (questions ?? []).map((question) => question.id);

  if (!questionIds.length) {
    return;
  }

  const { error: assignmentQuestionsError } = await supabase
    .from("assignment_questions")
    .delete()
    .in("question_id", questionIds);

  if (assignmentQuestionsError) {
    throw new Error(`Failed to delete assignment questions: ${assignmentQuestionsError.message}`);
  }

  await supabase.from("question_bank_categories").delete().in("question_id", questionIds);

  const { error } = await supabase.from("question_bank").delete().in("id", questionIds);

  if (error) {
    throw new Error(`Failed to delete questions by employee: ${error.message}`);
  }
}

// Assignment categories repository methods
export async function createAssignmentCategories(
  categories: Array<{
    assignment_bank_id: string;
    category_id: string;
  }>,
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_categories").insert(categories);

  if (error) {
    throw new Error(`Failed to create assignment categories: ${error.message}`);
  }
}

export async function deleteAssignmentCategoriesByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignment_config")
    .select("assignment_bank_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment bank: ${assignmentError.message}`);
  }

  if (!assignment?.assignment_bank_id) {
    return;
  }

  const { error } = await supabase
    .from("assignment_categories")
    .delete()
    .eq("assignment_bank_id", assignment.assignment_bank_id);

  if (error) {
    throw new Error(`Failed to delete assignment categories: ${error.message}`);
  }
}

export async function deleteAssignmentCategoriesByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { data: assignmentBanks, error: fetchError } = await supabase
    .from("assignment_bank")
    .select("id")
    .eq("created_by", employeeId);

  if (fetchError) {
    throw new Error(`Failed to fetch assignment banks by employee: ${fetchError.message}`);
  }

  if (!assignmentBanks || assignmentBanks.length === 0) {
    return;
  }

  const assignmentIds = assignmentBanks.map((assignment) => assignment.id);

  const { error } = await supabase.from("assignment_categories").delete().in("assignment_bank_id", assignmentIds);

  if (error) {
    throw new Error(`Failed to delete assignment categories by employee: ${error.message}`);
  }
}

export async function getAssignmentBankIdByAssignmentId(
  assignmentId: string,
  client?: AssignmentRepositoryClient,
) {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("assignment_config")
    .select("assignment_bank_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment bank: ${error.message}`);
  }

  return data?.assignment_bank_id ?? null;
}

export async function getAssignmentMetaById(assignmentId: string, client?: AssignmentRepositoryClient) {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("assignment_config")
    .select("id, assignment_bank_id, organization_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  return data ?? null;
}

// Assignment employees repository methods
export async function createAssignmentEmployees(
  employees: Array<{
    assignment_config_id: string;
    employee_id: string;
  }>,
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").insert(employees);

  if (error) {
    throw new Error(`Failed to create assignment employees: ${error.message}`);
  }
}

export async function createAssignmentEmployeesWithClient(
  client: AssignmentRepositoryClient,
  employees: Array<{
    assignment_config_id: string;
    employee_id: string;
  }>,
) {
  const { error } = await client.from("assignment_employees").insert(employees);

  if (error) {
    throw new Error(`Failed to create assignment employees: ${error.message}`);
  }
}

export async function deleteAssignmentEmployeesByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").delete().eq("assignment_config_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment employees: ${error.message}`);
  }
}

export async function deleteAssignmentEmployeesByAssignmentIdWithClient(
  client: AssignmentRepositoryClient,
  assignmentId: string,
) {
  const { error } = await client.from("assignment_employees").delete().eq("assignment_config_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment employees: ${error.message}`);
  }
}

async function getAssignmentEmployeeIdsByAssignmentIdWithClient(
  client: AssignmentRepositoryClient,
  assignmentId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("assignment_employees")
    .select("employee_id")
    .eq("assignment_config_id", assignmentId);

  if (error) {
    throw new Error(`Failed to fetch assignment employees: ${error.message}`);
  }

  return (data ?? []).map((item) => item.employee_id);
}

export async function deleteAssignmentEmployeesByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").delete().eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete assignment employees by employee: ${error.message}`);
  }
}

// Assignment courses repository methods
export async function getAssignmentCoursesByCourseId(courseId: string) {
  const { data, error } = await supabase
    .from("assignment_courses")
    .select(
      `
      assignment_config_id,
      assignment_config:assignment_config(
        assignment_bank_id
      )
    `,
    )
    .eq("course_id", courseId);

  if (error) {
    return { data: null, error };
  }

  return { data: data ?? [], error: null };
}

export async function createAssignmentCourses(
  rows: Array<{
    assignment_config_id: string;
    course_id: string;
  }>,
) {
  if (!rows.length) {
    return;
  }

  const { error } = await supabase.from("assignment_courses").insert(rows);

  if (error) {
    throw new Error(`Failed to create assignment courses: ${error.message}`);
  }
}

export async function deleteAssignmentCoursesByAssignmentConfigIds(
  courseId: string,
  assignmentConfigIds: string[],
) {
  if (!assignmentConfigIds.length) {
    return;
  }
  const { error } = await supabase
    .from("assignment_courses")
    .delete()
    .eq("course_id", courseId)
    .in("assignment_config_id", assignmentConfigIds);

  if (error) {
    throw new Error(`Failed to delete assignment courses: ${error.message}`);
  }
}

export async function getAssignmentConfigIdByCourseAndBank(courseId: string, assignmentBankId: string) {
  const { data, error } = await supabase
    .from("assignment_courses")
    .select(
      `
      assignment_config_id,
      assignment_config:assignment_config(
        assignment_bank_id
      )
    `,
    )
    .eq("course_id", courseId)
    .eq("assignment_config.assignment_bank_id", assignmentBankId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch course assignment config: ${error.message}`);
  }

  return data?.assignment_config_id ?? null;
}

export async function nullifyLessonsAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("lessons").update({ assignment_id: null }).eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to nullify lessons assignment_id: ${error.message}`);
  }
}

const resolveStudentProgressStatus = (status: AttemptStatus | null): AssignmentStudentProgressStatus => {
  if (!status) {
    return "not_started";
  }
  if (status === "in_progress") {
    return "in_progress";
  }
  return "completed";
};

const getAssignmentStudents = async (
  assignmentId: string,
  params?: GetAssignmentStudentsParams,
): Promise<PaginatedResult<AssignmentStudentDto> & { summary: AssignmentStudentSummaryDto }> => {
  const { page = 0, limit = 25, search, status } = params || {};

  // Get assigned employees
  const { data, error } = await supabase
    .from("assignment_employees")
    .select(
      `
      employee_id,
      employees (
        id,
        employee_code,
        profiles (
          id,
          full_name,
          email,
          avatar
        ),
        employee_departments (
          departments (
            id,
            name
          )
        )
      )
    `,
    )
    .eq("assignment_config_id", assignmentId)
    .order("employee_id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch assignment students: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      summary: {
        total_students: 0,
        completed_count: 0,
        in_progress_count: 0,
        not_started_count: 0,
      },
    };
  }

  // Get submission results for all assigned employees
  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("employee_id, attempt_number, status, submitted_at, created_at, score, max_score")
    .eq("assignment_config_id", assignmentId);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  // Create a map of employee_id to submission data
  const submissionMap = new Map<
    string,
    {
      submitted_at: string | null;
      score: number | null;
      max_score: number | null;
      status: AttemptStatus;
      attempt_number: number;
    }
  >();

  (attempts ?? []).forEach((attempt) => {
    const existing = submissionMap.get(attempt.employee_id);
    if (!existing || attempt.attempt_number > existing.attempt_number) {
      submissionMap.set(attempt.employee_id, {
        submitted_at: attempt.submitted_at ?? null,
        score: attempt.score ?? null,
        max_score: attempt.max_score ?? null,
        status: attempt.status,
        attempt_number: attempt.attempt_number,
      });
    }
  });

  // Combine the data
  const students = data.map((item) => {
    const employee = item.employees;
    const profile = employee?.profiles;
    const submission = submissionMap.get(item.employee_id);
    const hasSubmitted = submission ? SUBMITTED_STATUSES.includes(submission.status) : false;
    const departmentName = employee?.employee_departments?.[0]?.departments?.name ?? null;

    return {
      id: item.employee_id,
      employee_id: item.employee_id,
      employee_code: employee?.employee_code || "",
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      avatar: profile?.avatar || null,
      department_name: departmentName,
      has_submitted: hasSubmitted,
      submitted_at: submission?.submitted_at || null,
      score: submission?.score ?? null,
      max_score: submission?.max_score ?? null,
      status: submission?.status ?? null,
    };
  });

  const summary = students.reduce<AssignmentStudentSummaryDto>(
    (acc, student) => {
      const progressStatus = resolveStudentProgressStatus(student.status);
      if (progressStatus === "completed") {
        acc.completed_count += 1;
      } else if (progressStatus === "in_progress") {
        acc.in_progress_count += 1;
      } else {
        acc.not_started_count += 1;
      }
      return acc;
    },
    {
      total_students: students.length,
      completed_count: 0,
      in_progress_count: 0,
      not_started_count: 0,
    },
  );

  const searchValue = search?.trim().toLowerCase();
  const filteredBySearch = searchValue
    ? students.filter((student) => {
      return (
        student.employee_code.toLowerCase().includes(searchValue) ||
        student.full_name.toLowerCase().includes(searchValue) ||
        student.email.toLowerCase().includes(searchValue)
      );
    })
    : students;

  const filteredStudents = status
    ? filteredBySearch.filter((student) => resolveStudentProgressStatus(student.status) === status)
    : filteredBySearch;

  const total = filteredStudents.length;
  const startIndex = page * limit;
  const pagedStudents = filteredStudents.slice(startIndex, startIndex + limit);

  return {
    data: pagedStudents,
    total,
    page,
    limit,
    summary,
  };
};

const getAssignmentQuestions = async (assignment_config_id: string) => {
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignment_config")
    .select("assignment_bank_id")
    .eq("id", assignment_config_id)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(`Failed to fetch assignment: ${assignmentError.message}`);
  }

  if (!assignment?.assignment_bank_id) {
    return [];
  }

  const { data, error } = await supabase
    .from("assignment_questions")
    .select(
      `
      question_id,
      order_index,
      score_override,
      question_bank (
        id,
        label,
        type,
        score,
        options,
        attachments,
        created_at,
        updated_at,
        created_by
      )
    `,
    )
    .eq("assignment_bank_id", assignment.assignment_bank_id)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch assignment questions: ${error.message}`);
  }

  return (data ?? [])
    .map((item) => {
      const question = item.question_bank;
      if (!question) {
        return null;
      }

      return {
        id: question.id,
        assignment_config_id: assignment_config_id,
        label: question.label,
        type: question.type,
        score: item.score_override ?? question.score,
        options: question.options ? (question.options as QuestionOption[]) : undefined,
        attachments: question.attachments ?? null,
        created_at: question.created_at,
        updated_at: question.updated_at,
        created_by: question.created_by,
      };
    })
    .filter((question): question is AssignmentQuestionDto => Boolean(question));
};

async function getQuestionsByIds(questionIds: string[]) {
  const supabase = await createSVClient();

  const { data, error } = await supabase.from("question_bank").select("*").in("id", questionIds);

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  return data;
}

const getMyAssignments = async (
  employeeId: string,
  params?: GetMyAssignmentsParams,
): Promise<PaginatedResult<MyAssignmentRpcRow>> => {
  const { page = 0, limit = 25, search, status, organizationId } = params || {};
  const searchValue = search ? search : null;

  const { data, error } = await supabase.rpc("get_my_assignments", {
    p_employee_id: employeeId,
    p_organization_id: organizationId! ?? null,
    p_search: searchValue!,
    p_status: status! ?? null,
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    throw new Error(`Failed to fetch my assignments: ${error.message}`);
  }

  const rows = (data ?? []) as MyAssignmentRpcRow[];
  const total = rows.length > 0 ? Number(rows?.[0]?.total_count ?? 0) : 0;
  const safeTotal = Number.isNaN(total) ? 0 : total;

  return {
    data: rows,
    total: safeTotal,
    page,
    limit,
  };
};

const getAssignedAssignments = async (
  params?: GetAssignedAssignmentsParams,
): Promise<PaginatedResult<AssignedAssignmentItemDto> & { summary: AssignedAssignmentsSummaryDto }> => {
  const { page = 0, limit = 10, search, status, organizationId } = params || {};

  let query = supabase
    .from("assignment_config")
    .select(
      `
        id,
        created_at,
        available_to,
        assignment_bank (
          id,
          name,
          description,
          assignment_categories (
            category_id,
            categories (
              id,
              name
            )
          )
        ),
        assignmentEmployees:assignment_employees(count)
      `,
    )
    .order("created_at", { ascending: false });

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  if (search) {
    query = query.ilike("assignment_bank.name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch assigned assignments: ${error.message}`);
  }

  const assignmentRows = (data as AssignmentRecord[] | null) ?? [];
  const assignmentsWithEmployees = assignmentRows.filter((row) => (row.assignmentEmployees?.[0]?.count ?? 0) > 0);

  if (assignmentsWithEmployees.length === 0) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      summary: {
        total_assigned: 0,
        total_completed: 0,
      },
    };
  }

  const assignmentIds = assignmentsWithEmployees.map((assignment) => assignment.id);
  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("assignment_config_id, employee_id, status")
    .in("assignment_config_id", assignmentIds)
    .in("status", SUBMITTED_STATUSES);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment completion: ${attemptsError.message}`);
  }

  const completedEmployeeMap = new Map<string, Set<string>>();
  (attempts ?? []).forEach((attempt) => {
    const entry = completedEmployeeMap.get(attempt.assignment_config_id) ?? new Set<string>();
    entry.add(attempt.employee_id);
    completedEmployeeMap.set(attempt.assignment_config_id, entry);
  });

  const mappedAssignments: AssignedAssignmentItemDto[] = assignmentsWithEmployees.map((assignment) => {
    const assignedCount = assignment.assignmentEmployees?.[0]?.count ?? 0;
    const completedCount = completedEmployeeMap.get(assignment.id)?.size ?? 0;
    const completionPercentage =
      assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

    const categories =
      assignment.assignment_bank?.assignment_categories
        ?.map((category) => category.categories)
        .filter((category): category is NonNullable<typeof category> => Boolean(category))
        .map((category) => ({
          id: category.id,
          name: category.name,
        })) ?? [];

    return {
      assignment_id: assignment.id,
      assignment_name: assignment.assignment_bank?.name ?? "",
      assignment_description: assignment.assignment_bank?.description ?? "",
      available_to: assignment.available_to ?? null,
      categories,
      assigned_count: assignedCount,
      completed_count: completedCount,
      completion_percentage: completionPercentage,
      status: resolveAssignedStatus(assignedCount, completedCount),
    };
  });

  const filteredAssignments = status
    ? mappedAssignments.filter((assignment) => assignment.status === status)
    : mappedAssignments;

  const total = filteredAssignments.length;
  const startIndex = page * limit;
  const pagedAssignments = filteredAssignments.slice(startIndex, startIndex + limit);
  const summary = filteredAssignments.reduce(
    (acc, assignment) => ({
      total_assigned: acc.total_assigned + assignment.assigned_count,
      total_completed: acc.total_completed + assignment.completed_count,
    }),
    { total_assigned: 0, total_completed: 0 },
  );

  return {
    data: pagedAssignments,
    total,
    page,
    limit,
    summary,
  };
};

export const getAssignmentsV2 = async (queryParams?: GetAssignmentsQueryParams) => {
  const { page = 0, pageSize = 20, search, createdBy, organizationId } = queryParams || {};

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("assignment_config").select(
    `
      id,
      assigned_by,
      organization_id,
      created_at,
      updated_at,
      assignment_bank (
        id,
        name,
        description,
        created_by,
        createdBy:employees!assignments_created_by_fkey (
          id,
          employee_code,
          profiles (
            id,
            full_name,
            email,
            avatar
          )
        ),
        assignment_categories (
          category_id,
          categories (
            id,
            name
          )
        )
      ),
      assignmentEmployees:assignment_employees(count),
      submissions:assignments_attempts(count)
    `,
    { count: "exact" },
  );

  if (search) {
    query = query.ilike("assignment_bank.name", `%${search}%`);
  }

  if (createdBy) {
    query = query.eq("assignment_bank.created_by", createdBy);
  }

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }
  const result = await query.order("created_at", { ascending: false }).range(from, to);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    ...result,
    data: (result.data as AssignmentRecord[] | null)?.map((item) => mapAssignmentRecord(item)) ?? [],
  };
};
export type GetAssignmentsV2Response = Awaited<ReturnType<typeof getAssignmentsV2>>;
export type { MyAssignmentRpcRow };
export {
  getAssignments,
  getAssignmentConfigById,
  getLatestAssignmentByBankId,
  getAssignmentStudents,
  getAssignmentQuestions,
  getMyAssignments,
  getAssignedAssignments,
  getQuestionsByIds,
  getAssignmentEmployeeIdsByAssignmentIdWithClient,
};
