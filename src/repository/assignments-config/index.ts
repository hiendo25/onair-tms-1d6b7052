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

const getAssignmentById = async (id: string): Promise<AssignmentDto> => {
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
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assignment from bank: ${error.message}`);
  }

  return assignment;
}

export async function createAssignmentFromBankWithClient(
  client: AssignmentRepositoryClient,
  data: {
    assignment_bank_id: string;
    assigned_by: string;
    organization_id: string;
    attempt_duration_minutes?: number | null;
    attempt_limit?: number | null;
    available_from?: string | null;
    available_to?: string | null;
    status?: Database["public"]["Enums"]["assignment_config_status"];
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

export async function deleteAssignmentEmployeesByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").delete().eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete assignment employees by employee: ${error.message}`);
  }
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

const getAssignmentQuestions = async (assignmentId: string) => {
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignment_config")
    .select("assignment_bank_id")
    .eq("id", assignmentId)
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
        assignment_id: assignmentId,
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
): Promise<PaginatedResult<any>> => {
  const { page = 0, limit = 25, search, status, organizationId } = params || {};

  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("assignment_config")
    .select(
      `
        id,
        created_at,
        organization_id,
        attempt_limit,
        available_from,
        available_to,
        assignment_bank!inner (
          id,
          name,
          description
        ),
        assignment_employees!inner (
          employee_id
        )
      `,
      { count: "exact" },
    )
    .eq("assignment_employees.employee_id", employeeId);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  if (search) {
    query = query.ilike("assignment_bank.name", `%${search}%`);
  }

  const shouldFilterByStatus = Boolean(status);
  const assignmentQuery = shouldFilterByStatus ? query.order("created_at", { ascending: false }) : query;

  const { data: assignments, error, count } = shouldFilterByStatus
    ? await assignmentQuery
    : await assignmentQuery.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch my assignments: ${error.message}`);
  }

  const assignmentsData = assignments ?? [];
  if (assignmentsData.length === 0) {
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }

  const assignmentIds = assignmentsData.map((item) => item.id);
  const { data: attempts, error: attemptsError } = await supabase
    .from("assignments_attempts")
    .select("assignment_config_id, attempt_number, status, submitted_at, created_at, score, max_score")
    .eq("employee_id", employeeId)
    .in("assignment_config_id", assignmentIds);

  if (attemptsError) {
    throw new Error(`Failed to fetch assignment attempts: ${attemptsError.message}`);
  }

  const latestAttemptMap = new Map<
    string,
    {
      attempt_number: number;
      status: AttemptStatus;
      submitted_at: string | null;
      created_at: string;
      score: number | null;
      max_score: number | null;
    }
  >();
  const attemptsUsedMap = new Map<string, number>();

  (attempts ?? []).forEach((attempt) => {
    const existing = latestAttemptMap.get(attempt.assignment_config_id);
    if (!existing || attempt.attempt_number > existing.attempt_number) {
      latestAttemptMap.set(attempt.assignment_config_id, attempt);
    }
    const currentMax = attemptsUsedMap.get(attempt.assignment_config_id) ?? 0;
    if (attempt.attempt_number > currentMax) {
      attemptsUsedMap.set(attempt.assignment_config_id, attempt.attempt_number);
    }
  });

  const filteredAssignments = shouldFilterByStatus
    ? assignmentsData.filter((assignment) => {
      const latestAttempt = latestAttemptMap.get(assignment.id);
      if (status === "not_submitted") {
        return !latestAttempt || !SUBMITTED_STATUSES.includes(latestAttempt.status);
      }
      return latestAttempt?.status === status;
    })
    : assignmentsData;

  const now = Date.now();
  const isWithinWindow = (availableFrom?: string | null, availableTo?: string | null) => {
    if (availableFrom) {
      const startMs = new Date(availableFrom).getTime();
      if (!Number.isNaN(startMs) && now < startMs) {
        return false;
      }
    }
    if (availableTo) {
      const endMs = new Date(availableTo).getTime();
      if (!Number.isNaN(endMs) && now > endMs) {
        return false;
      }
    }
    return true;
  };

  const total = shouldFilterByStatus ? filteredAssignments.length : count ?? 0;
  const pagedAssignments = shouldFilterByStatus ? filteredAssignments.slice(from, to + 1) : filteredAssignments;

  const myAssignments = pagedAssignments.map((item) => {
    const latestAttempt = latestAttemptMap.get(item.id);
    const hasSubmitted = latestAttempt ? SUBMITTED_STATUSES.includes(latestAttempt.status) : false;
    const assignmentBank = item.assignment_bank ?? null;
    const attemptLimit = item.attempt_limit ?? null;
    const attemptsUsed = attemptsUsedMap.get(item.id) ?? 0;
    const attemptsRemaining = attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0);
    const hasAttemptsLeft = attemptLimit === null ? true : attemptsRemaining! > 0;
    const canRetry = hasAttemptsLeft && isWithinWindow(item.available_from, item.available_to);

    return {
      assignment_id: item.id,
      assignment_name: assignmentBank?.name ?? "",
      assignment_description: assignmentBank?.description || "",
      created_at: item.created_at,
      attempt_limit: attemptLimit,
      attempts_used: attemptsUsed,
      attempts_remaining: attemptsRemaining,
      can_retry: canRetry,
      has_submitted: hasSubmitted,
      submitted_at: latestAttempt?.submitted_at ?? null,
      score: latestAttempt?.score ?? null,
      max_score: latestAttempt?.max_score ?? null,
      status: latestAttempt?.status ?? null,
    };
  });

  return {
    data: myAssignments,
    total,
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
export {
  getAssignments,
  getAssignmentById,
  getLatestAssignmentByBankId,
  getAssignmentStudents,
  getAssignmentQuestions,
  getMyAssignments,
  getAssignedAssignments,
  getQuestionsByIds,
};
