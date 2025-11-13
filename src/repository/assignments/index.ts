import { createClient, createSVClient } from "@/services";
import type { Database } from "@/types/supabase.types";
import type {
  AssignmentDto,
  GetAssignmentsParams,
  GetMyAssignmentsParams,
  QuestionOption,
} from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";

const getAssignments = async (params?: GetAssignmentsParams): Promise<PaginatedResult<AssignmentDto>> => {
  const supabase = createClient();
  const { page = 0, limit = 20, search, createdBy } = params || {};

  let query = supabase
    .from("assignments")
    .select(
      `
      id,
      name,
      description,
      created_by,
      created_at,
      updated_at,
      questions (
        id,
        label,
        type,
        score,
        options,
        created_at,
        updated_at
      ),
      assignment_categories (
        category_id,
        categories (
          id,
          name
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
      )
    `,
      { count: "exact" },
    );

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (createdBy) {
    query = query.eq("created_by", createdBy);
  }

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch assignments: ${error.message}`);
  }

  return {
    data: (data as unknown as AssignmentDto[]) || [],
    total: count ?? 0,
    page,
    limit,
  };
};

const getAssignmentById = async (id: string): Promise<AssignmentDto> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select(
      `
      id,
      name,
      description,
      created_by,
      created_at,
      updated_at,
      questions (
        id,
        label,
        type,
        score,
        options,
        attachments,
        created_at,
        updated_at
      ),
      assignment_categories (
        category_id,
        categories (
          id,
          name
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
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  return data as unknown as AssignmentDto;
};

export async function createAssignment(data: {
  name: string;
  description: string;
  created_by: string;
}) {
  const supabase = await createSVClient();

  const { data: assignment, error } = await supabase.from("assignments").insert(data).select().single();

  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`);
  }

  return assignment;
}

export async function updateAssignmentById(
  id: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignments").update(data).eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment: ${error.message}`);
  }
}

export async function deleteAssignmentById(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignments").delete().eq("id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment: ${error.message}`);
  }
}

// Questions repository methods
export async function createQuestions(
  questions: Array<{
    assignment_id: string;
    type: Database["public"]["Enums"]["question_type"];
    label: string;
    score: number;
    options?: QuestionOption[] | null;
    attachments?: string[] | null;
    created_by: string;
  }>,
) {
  const supabase = await createSVClient();

  // Convert options to Json type for database
  const questionsToInsert = questions.map(q => ({
    ...q,
    options: q.options as any, // Cast to Json type
  }));

  const { error } = await supabase.from("questions").insert(questionsToInsert);

  if (error) {
    throw new Error(`Failed to create questions: ${error.message}`);
  }
}

export async function deleteQuestionsByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("questions").delete().eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete questions: ${error.message}`);
  }
}

// Assignment categories repository methods
export async function createAssignmentCategories(
  categories: Array<{
    assignment_id: string;
    category_id: string;
  }>
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_categories").insert(categories);

  if (error) {
    throw new Error(`Failed to create assignment categories: ${error.message}`);
  }
}

export async function deleteAssignmentCategoriesByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_categories").delete().eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment categories: ${error.message}`);
  }
}

// Assignment employees repository methods
export async function createAssignmentEmployees(
  employees: Array<{
    assignment_id: string;
    employee_id: string;
  }>
) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").insert(employees);

  if (error) {
    throw new Error(`Failed to create assignment employees: ${error.message}`);
  }
}

export async function deleteAssignmentEmployeesByAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase.from("assignment_employees").delete().eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment employees: ${error.message}`);
  }
}

export async function nullifyLessonsAssignmentId(assignmentId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("lessons")
    .update({ assignment_id: null })
    .eq("assignment_id", assignmentId);

  if (error) {
    throw new Error(`Failed to nullify lessons assignment_id: ${error.message}`);
  }
}

const getAssignmentStudents = async (
  assignmentId: string,
  page: number = 0,
  limit: number = 25
): Promise<PaginatedResult<any>> => {
  const supabase = createClient();

  // Calculate range for pagination
  const from = page * limit;
  const to = from + limit - 1;

  // Get assigned employees with pagination
  const { data, error, count } = await supabase
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
        )
      )
    `,
      { count: "exact" }
    )
    .eq("assignment_id", assignmentId)
    .order("employee_id", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch assignment students: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      data: [],
      total: count ?? 0,
      page,
      limit,
    };
  }

  // Get employee IDs from the current page
  const employeeIds = data.map((item) => item.employee_id);

  // Get submission results only for employees on the current page
  const { data: results, error: resultsError } = await supabase
    .from("assignment_results")
    .select("employee_id, created_at, score, max_score, status")
    .eq("assignment_id", assignmentId)
    .in("employee_id", employeeIds);

  if (resultsError) {
    throw new Error(`Failed to fetch assignment results: ${resultsError.message}`);
  }

  // Create a map of employee_id to submission data
  const submissionMap = new Map(
    (results || []).map((result) => [
      result.employee_id,
      {
        submitted_at: result.created_at,
        score: result.score,
        max_score: result.max_score,
        status: result.status,
      },
    ])
  );

  // Combine the data
  const students = data.map((item) => {
    const employee = item.employees;
    const profile = employee?.profiles;
    const submission = submissionMap.get(item.employee_id);

    return {
      employee_id: item.employee_id,
      employee_code: employee?.employee_code || "",
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      avatar: profile?.avatar || null,
      has_submitted: !!submission,
      submitted_at: submission?.submitted_at || null,
      score: submission?.score ?? null,
      max_score: submission?.max_score ?? null,
      status: submission?.status ?? null,
    };
  });

  return {
    data: students,
    total: count ?? 0,
    page,
    limit,
  };
};

const getAssignmentQuestions = async (assignmentId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch assignment questions: ${error.message}`);
  }

  return data;
};

const getMyAssignments = async (
  employeeId: string,
  params?: GetMyAssignmentsParams
): Promise<PaginatedResult<any>> => {
  const supabase = createClient();
  const { page = 0, limit = 25, search, status } = params || {};

  // Calculate range for pagination
  const from = page * limit;
  const to = from + limit - 1;

  let data: any[] | null;
  let error: any;
  let count: number | null;

  if (status === "submitted" || status === "graded") {
    let queryWithInnerJoin = supabase
      .from("assignments")
      .select(
        `
        id,
        name,
        description,
        created_at,
        assignment_employees!inner (
          employee_id
        ),
        assignment_results!inner (
          assignment_id,
          employee_id,
          status
        )
      `,
        { count: "exact" },
      )
      .eq("assignment_employees.employee_id", employeeId)
      .eq("assignment_results.employee_id", employeeId)
      .eq("assignment_results.status", status);

    if (search) {
      queryWithInnerJoin = queryWithInnerJoin.ilike("name", `%${search}%`);
    }

    const result = await queryWithInnerJoin
      .order("id", { ascending: false })
      .range(from, to);

    data = result.data;
    error = result.error;
    count = result.count;
  } else if (status === "not_submitted") {
    let queryWithLeftJoin = supabase
      .from("assignments")
      .select(
        `
        id,
        name,
        description,
        created_at,
        assignment_employees!inner (
          employee_id
        ),
        assignment_results!left (
          id,
          employee_id
        )
      `,
        { count: "exact" }
      )
      .eq("assignment_employees.employee_id", employeeId)
      .eq("assignment_results.employee_id", employeeId)
      .is("assignment_results", null);

    if (search) {
      queryWithLeftJoin = queryWithLeftJoin.ilike("name", `%${search}%`);
    }

    const result = await queryWithLeftJoin
      .order("id", { ascending: false })
      .range(from, to);

    data = result.data;
    error = result.error;
    count = result.count;
  } else {
    let queryWithoutFilter = supabase
      .from("assignments")
      .select(
        `
        id,
        name,
        description,
        created_at,
        assignment_employees!inner (
          employee_id
        )
      `,
        { count: "exact" },
      )
      .eq("assignment_employees.employee_id", employeeId);

    if (search) {
      queryWithoutFilter = queryWithoutFilter.ilike("name", `%${search}%`);
    }

    const result = await queryWithoutFilter
      .order("id", { ascending: false })
      .range(from, to);

    data = result.data;
    error = result.error;
    count = result.count;
  }

  if (error) {
    throw new Error(`Failed to fetch my assignments: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      data: [],
      total: count ?? 0,
      page,
      limit,
    };
  }

  const assignmentIds = data.map((item) => item.id);

  const { data: results, error: resultsError } = await supabase
    .from("assignment_results")
    .select("assignment_id, created_at, score, max_score, status")
    .eq("employee_id", employeeId)
    .in("assignment_id", assignmentIds);

  if (resultsError) {
    throw new Error(`Failed to fetch assignment results: ${resultsError.message}`);
  }

  const submissionMap = new Map(
    results?.map((result) => [
      result.assignment_id,
      {
        submitted_at: result.created_at,
        score: result.score,
        max_score: result.max_score,
        status: result.status,
      },
    ]) || [],
  );

  const myAssignments = data.map((item) => {
    const submission = submissionMap.get(item.id);

    return {
      assignment_id: item.id,
      assignment_name: item.name,
      assignment_description: item.description || "",
      created_at: item.created_at,
      has_submitted: !!submission,
      submitted_at: submission?.submitted_at || null,
      score: submission?.score ?? null,
      max_score: submission?.max_score ?? null,
      status: submission?.status ?? null,
    };
  });

  return {
    data: myAssignments,
    total: count ?? 0,
    page,
    limit,
  };
};

export { getAssignments, getAssignmentById, getAssignmentStudents, getAssignmentQuestions, getMyAssignments };

