import { supabase } from "@/services";

interface GetPlanningSurveysParams {
  organizationId: string;
  search?: string;
  page?: number;
  limit?: number;
}

const getPlanningSurveys = async ({
  organizationId,
  search,
  page = 1,
  limit = 10,
}: GetPlanningSurveysParams) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("surveys")
    .select("id, title, created_at, description", { count: "exact" })
    .eq("organization_id", organizationId)
    .eq("survey_type", "planning")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
  };
};

export const surveysRepository = {
  getPlanningSurveys,
};
