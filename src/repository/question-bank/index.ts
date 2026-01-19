import { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/services";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import type { GetQuestionBankParams, QuestionBankDto, QuestionBankSummaryDto } from "@/types/dto/question-bank";
import type { Database } from "@/types/supabase.types";

const QUESTION_BANK_SELECT = `
  id,
  label,
  type,
  score,
  options,
  attachments,
  difficulty,
  created_by,
  created_at,
  updated_at,
  question_bank_categories (
    category_id,
    categories (
      id,
      name
    )
  ),
  createdBy:employees!inner (
    id,
    employee_code,
    organization_id,
    profiles (
      id,
      full_name,
      email,
      avatar
    )
  )
`;

const QUESTION_BANK_SELECT_WITH_CATEGORY = `
  id,
  label,
  type,
  score,
  options,
  attachments,
  difficulty,
  created_by,
  created_at,
  updated_at,
  question_bank_categories!inner (
    category_id,
    categories (
      id,
      name
    )
  ),
  createdBy:employees!inner (
    id,
    employee_code,
    organization_id,
    profiles (
      id,
      full_name,
      email,
      avatar
    )
  )
`;
type QuestionBankInsert = Database["public"]["Tables"]["question_bank"]["Insert"];
type QuestionBankUpdate = Database["public"]["Tables"]["question_bank"]["Update"];
type QuestionType = Database["public"]["Enums"]["question_type"];
type QuestionBankClient = SupabaseClient<Database>;

const getQuestionBank = async (
  params?: GetQuestionBankParams,
  client?: QuestionBankClient,
): Promise<PaginatedResult<QuestionBankDto>> => {
  const supabaseClient = supabase;
  const page = params?.page ?? 0;
  const limit = params?.limit ?? 12;
  const search = params?.search?.trim();
  const organizationId = params?.organizationId;
  const questionType = params?.questionType;
  const categoryId = params?.categoryId;

  const selectQuery = categoryId ? QUESTION_BANK_SELECT_WITH_CATEGORY : QUESTION_BANK_SELECT;
  let query = supabaseClient.from("question_bank").select(selectQuery, { count: "exact" });

  if (search) {
    query = query.ilike("label", `%${search}%`);
  }

  if (organizationId) {
    query = query.eq("createdBy.organization_id", organizationId);
  }

  if (questionType) {
    query = query.eq("type", questionType);
  }

  if (categoryId) {
    query = query.eq("question_bank_categories.category_id", categoryId);
  }

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to fetch question bank: ${error.message}`);
  }

  return {
    data: (data as unknown as QuestionBankDto[]) || [],
    total: count ?? 0,
    page,
    limit,
  };
};

const createQuestionBankQuestions = async (questions: QuestionBankInsert[], client?: QuestionBankClient) => {
  const supabaseClient = client ?? supabase;

  const { data, error } = await supabaseClient.from("question_bank").insert(questions).select("id");

  if (error) {
    throw new Error(`Failed to create question bank items: ${error.message}`);
  }

  return data ?? [];
};

const createQuestionBankCategories = async (
  categories: Array<{ question_id: string; category_id: string }>,
  client?: QuestionBankClient,
) => {
  if (!categories.length) {
    return;
  }

  const supabaseClient = client ?? supabase;

  const { error } = await supabaseClient.from("question_bank_categories").insert(categories);

  if (error) {
    throw new Error(`Failed to create question bank categories: ${error.message}`);
  }
};

const deleteQuestionBankCategoriesByQuestionId = async (questionId: string, client?: QuestionBankClient) => {
  const supabaseClient = client ?? supabase;

  const { error } = await supabaseClient.from("question_bank_categories").delete().eq("question_id", questionId);

  if (error) {
    throw new Error(`Failed to delete question bank categories: ${error.message}`);
  }
};

const deleteQuestionBankQuestion = async (questionId: string, client?: QuestionBankClient) => {
  const supabaseClient = client ?? supabase;

  const { error } = await supabaseClient.from("question_bank").delete().eq("id", questionId);

  if (error) {
    throw new Error(`Failed to delete question bank: ${error.message}`);
  }
};
const getQuestionBankById = async (
  questionId: string,
  organizationId: string,
  client?: QuestionBankClient,
): Promise<QuestionBankDto | null> => {
  const supabaseClient = client ?? supabase;

  const { data, error } = await supabaseClient
    .from("question_bank")
    .select(QUESTION_BANK_SELECT)
    .eq("id", questionId)
    .eq("createdBy.organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch question bank: ${error.message}`);
  }

  return (data as unknown as QuestionBankDto) || null;
};

const updateQuestionBankQuestion = async (
  questionId: string,
  data: QuestionBankUpdate,
  client?: QuestionBankClient,
) => {
  const supabaseClient = client ?? supabase;

  const { error } = await supabaseClient.from("question_bank").update(data).eq("id", questionId);

  if (error) {
    throw new Error(`Failed to update question bank: ${error.message}`);
  }
};

const getQuestionBankCount = async (
  organizationId: string,
  types?: QuestionType[] | QuestionType,
  client?: QuestionBankClient,
) => {
  const supabaseClient = client ?? supabase;

  let query = supabaseClient
    .from("question_bank")
    .select("id, createdBy:employees!inner(organization_id)", { count: "exact", head: true })
    .eq("createdBy.organization_id", organizationId);

  if (Array.isArray(types) && types.length > 0) {
    query = query.in("type", types);
  } else if (typeof types === "string") {
    query = query.eq("type", types);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count question bank: ${error.message}`);
  }

  return count ?? 0;
};

const getQuestionBankSummary = async (
  organizationId: string,
  client?: QuestionBankClient,
): Promise<QuestionBankSummaryDto> => {
  const [
    total,
    multipleChoice,
    trueFalse,
    essay,
    file,
    order,
    matching,
  ] = await Promise.all([
    getQuestionBankCount(organizationId, undefined, client),
    getQuestionBankCount(organizationId, ["checkbox", "radio"], client),
    getQuestionBankCount(organizationId, "true_false", client),
    getQuestionBankCount(organizationId, "text", client),
    getQuestionBankCount(organizationId, "file", client),
    getQuestionBankCount(organizationId, "order", client),
    getQuestionBankCount(organizationId, "matching", client),
  ]);

  return {
    total,
    multipleChoice,
    trueFalse,
    essay,
    file,
    order,
    matching,
  };
};

export {
  createQuestionBankCategories,
  createQuestionBankQuestions,
  deleteQuestionBankCategoriesByQuestionId,
  deleteQuestionBankQuestion,
  getQuestionBank,
  getQuestionBankById,
  getQuestionBankSummary,
  updateQuestionBankQuestion,
};
