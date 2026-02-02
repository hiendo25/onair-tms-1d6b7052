import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/services";
import type { AssignmentBankDto, GetAssignmentBanksParams } from "@/types/dto/assignment-bank";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import type { Database } from "@/types/supabase.types";

const ASSIGNMENT_BANK_SELECT = `
  id,
  name,
  description,
  duration_minutes,
  pass_score,
  shuffle_questions,
  shuffle_answers,
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
  organization_id,
  created_at,
  updated_at,
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
      score
    )
  )
`;

const ASSIGNMENT_BANK_SELECT_WITH_CATEGORY = `
  id,
  name,
  description,
  duration_minutes,
  pass_score,
  shuffle_questions,
  shuffle_answers,
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
  organization_id,
  created_at,
  updated_at,
  assignment_categories!inner (
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
      score
    )
  )
`;

const ASSIGNMENT_BANK_DETAIL_SELECT = `
  id,
  name,
  description,
  duration_minutes,
  pass_score,
  shuffle_questions,
  shuffle_answers,
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
  organization_id,
  created_at,
  updated_at,
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
      difficulty,
      question_bank_categories (
        category_id,
        categories (
          id,
          name
        )
      )
    )
  )
`;

type AssignmentBankInsert = Database["public"]["Tables"]["assignment_bank"]["Insert"];
type AssignmentBankUpdate = Database["public"]["Tables"]["assignment_bank"]["Update"];
type AssignmentBankClient = SupabaseClient<Database>;

const getAssignmentBanks = async (
  params?: GetAssignmentBanksParams,
  client?: AssignmentBankClient,
): Promise<PaginatedResult<AssignmentBankDto>> => {
  const supabaseClient = supabase;
  const page = params?.page ?? 0;
  const limit = params?.limit ?? 12;
  const search = params?.search?.trim();
  const organizationId = params?.organizationId;
  const categoryId = params?.categoryId;

  const selectQuery = categoryId ? ASSIGNMENT_BANK_SELECT_WITH_CATEGORY : ASSIGNMENT_BANK_SELECT;
  let query = supabaseClient
    .from("assignment_bank")
    .select(selectQuery, { count: "exact" })
    .eq("status", "published");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  if (categoryId) {
    query = query.eq("assignment_categories.category_id", categoryId);
  }

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch assignment bank: ${error.message}`);
  }

  return {
    data: (data as unknown as AssignmentBankDto[]) || [],
    total: count ?? 0,
    page,
    limit,
  };
};

const getAssignmentBankById = async (
  assignmentId: string,
  organizationId?: string,
  client?: AssignmentBankClient,
): Promise<AssignmentBankDto | null> => {
  const supabaseClient = client ?? supabase;

  let query = supabaseClient.from("assignment_bank").select(ASSIGNMENT_BANK_DETAIL_SELECT).eq("id", assignmentId);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query
    .order("order_index", { foreignTable: "assignment_questions", ascending: true })
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch assignment bank: ${error.message}`);
  }

  return (data as unknown as AssignmentBankDto) || null;
};

const createAssignmentBank = async (data: AssignmentBankInsert, client?: AssignmentBankClient) => {
  const supabaseClient = client ?? supabase;

  const { data: assignment, error } = await supabaseClient.from("assignment_bank").insert(data).select().single();

  if (error) {
    throw new Error(`Failed to create assignment bank: ${error.message}`);
  }

  return assignment;
};

const updateAssignmentBankById = async (
  id: string,
  data: AssignmentBankUpdate,
  client?: AssignmentBankClient,
) => {
  const supabaseClient = client ?? supabase;

  const { error } = await supabaseClient.from("assignment_bank").update(data).eq("id", id);

  if (error) {
    throw new Error(`Failed to update assignment bank: ${error.message}`);
  }
};

const deleteAssignmentBankById = async (assignmentId: string, client?: AssignmentBankClient) => {
  const { error } = await supabase.from("assignment_bank").update({ "status": "deleted" }).eq("id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment bank: ${error.message}`);
  }
};

const createAssignmentBankQuestions = async (
  questions: Array<{
    assignment_bank_id: string;
    question_id: string;
    order_index: number;
    score_override?: number | null;
  }>,
  client?: AssignmentBankClient,
) => {
  if (!questions.length) {
    return;
  }

  const { error } = await supabase.from("assignment_questions").insert(questions);

  if (error) {
    throw new Error(`Failed to create assignment questions: ${error.message}`);
  }
};

const deleteAssignmentBankQuestionsByAssignmentId = async (assignmentId: string) => {

  const { error } = await supabase.from("assignment_questions").delete().eq("assignment_bank_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment questions: ${error.message}`);
  }
};

const createAssignmentBankCategories = async (
  categories: Array<{ assignment_bank_id: string; category_id: string }>,
  client?: AssignmentBankClient,
) => {
  if (!categories.length) {
    return;
  }

  const { error } = await supabase.from("assignment_categories").insert(categories);

  if (error) {
    throw new Error(`Failed to create assignment categories: ${error.message}`);
  }
};

const deleteAssignmentBankCategoriesByAssignmentId = async (assignmentId: string, client?: AssignmentBankClient) => {
  const { error } = await supabase
    .from("assignment_categories")
    .delete()
    .eq("assignment_bank_id", assignmentId);

  if (error) {
    throw new Error(`Failed to delete assignment categories: ${error.message}`);
  }
};

export {
  createAssignmentBank,
  createAssignmentBankCategories,
  createAssignmentBankQuestions,
  deleteAssignmentBankById,
  deleteAssignmentBankCategoriesByAssignmentId,
  deleteAssignmentBankQuestionsByAssignmentId,
  getAssignmentBankById,
  getAssignmentBanks,
  updateAssignmentBankById,
};
