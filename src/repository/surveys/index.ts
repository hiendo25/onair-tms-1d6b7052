import { createClient } from "@/services";
export * from "./surveys-questions";
export * from "./surveys-questions-options";
import { CreateSurveyPayload, UpdateSurveyPayload, UpsertSurveyPayload } from "./type";
const createSurvey = async (payload: CreateSurveyPayload) => {
  const supabase = createClient();
  try {
    return await supabase.from("surveys").insert(payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey for sv error.");
  }
};

const updateSurvey = async (payload: UpdateSurveyPayload) => {
  const supabase = createClient();
  const { id, ...updatePayload } = payload;
  try {
    return await supabase.from("surveys").update(updatePayload).eq("id", payload.id).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey for sv error.");
  }
};

const upsertSurvey = async (upsertPayload: UpsertSurveyPayload) => {
  const supabase = createClient();

  try {
    return await supabase.from("surveys").upsert(upsertPayload.payload).select("*").single();
  } catch (err: any) {
    throw new Error("Unable create survey for sv error.");
  }
};

export type GetSurveysQueryParams = {
  page?: number;
  pageSize?: number;
  excludes?: string[];
  search?: string;
  organizationId?: string;
  createdBy?: string;
};
const getSurveys = async (queryParams?: GetSurveysQueryParams) => {
  try {
    const supabase = createClient();
    const { page = 1, pageSize = 20, excludes, search, organizationId, createdBy } = queryParams || {};
    const from = page > 0 ? (page - 1) * pageSize : page;
    const to = from + pageSize - 1;

    let surveyQuery = supabase.from("surveys").select(
      `
				id,
				title,
				slug,
				description,
				created_by,
				created_at,
				questions:surveys_questions(count),
				createdBy:employees(id, employee_code, employee_type, profiles(id, full_name, gender, avatar, email))
			`,
      { count: "exact" },
    );

    if (organizationId) {
      surveyQuery = surveyQuery.eq("organization_id", organizationId);
    }
    if (createdBy) {
      surveyQuery = surveyQuery.eq("created_by", createdBy);
    }

    if (excludes?.length) {
      surveyQuery = surveyQuery.not("id", "in", `(${excludes.join(",")})`);
    }
    if (search) {
      surveyQuery = surveyQuery.ilike("title", `%${search.trim()}%`);
    }

    return await surveyQuery.order("created_at", { ascending: false }).range(from, to);
  } catch (err: any) {
    throw new Error(err?.message ?? "Fetching Survey list failed.");
  }
};
export type GetSurveysResponse = Awaited<ReturnType<typeof getSurveys>>;
const getSurveyById = async (id: string) => {
  try {
    const supabase = createClient();
    return await supabase
      .from("surveys")
      .select(
        `
					id,
					title,
					description,
					created_at,
					organization_id,
					survey_type,
					slug,
					created_by,
					surveys_questions(
						id,
						name,
						question_type,
						is_required,
						priority,
						surveys_questions_options(
							id,
							option_text,
							is_other,
							priority
						)
					)
				`,
      )
      .eq("id", id)
      .order("priority", { ascending: true, referencedTable: "surveys_questions" })
      .order("priority", { ascending: true, referencedTable: "surveys_questions.surveys_questions_options" })
      .single();
  } catch (err) {
    throw new Error(`Get Survey error: ${id}`);
  }
};
export type GetSurveyByIdResponse = Awaited<ReturnType<typeof getSurveyById>>;

export { createSurvey, updateSurvey, upsertSurvey, getSurveys, getSurveyById };
