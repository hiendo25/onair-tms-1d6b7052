import { supabase } from "@/services";

interface GetPlanningSurveysParams {
  organizationId: string;
  search?: string;
  limit?: number;
}

const getPlanningSurveys = async ({
  organizationId,
  search,
  limit = 50,
}: GetPlanningSurveysParams) => {
  let query = supabase
    .from("surveys")
    .select("id, title, created_at, description")
    .eq("organization_id", organizationId)
    .eq("survey_type", "planning")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data || [];
};

export const surveysRepository = {
  getPlanningSurveys,
};
