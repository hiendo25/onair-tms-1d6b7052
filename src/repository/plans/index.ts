import { PlanStatus } from "@/model/plan.model";
import { supabase } from "@/services";
import { TablesInsert, TablesUpdate } from "@/types/supabase.types";

interface GetPlansParams {
  search?: string;
  organizationId: string;
  page?: number;
  limit?: number;
  status?: PlanStatus | "all";
}

const getPlans = async ({ search, organizationId, page = 1, limit = 10, status }: GetPlansParams) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("training_plans")
    .select(
      `
      id,
      name,
      objective,
      start_date,
      end_date,
      budget,
      status,
      training_plan_surveys (
        end_date,
        status,
        result_summary
      )
    `,
      { count: "exact" },
    )
    .eq("organization_id", organizationId)
    .not("status", "in", "(deleted)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0 };
};

const getPlanDetail = async (id: string) => {
  const { data, error } = await supabase
    .from("training_plans")
    .select(
      `
      id,
      name,
      objective,
      start_date,
      end_date,
      budget,
      status,
      survey_id,
      approved_by,
      created_at,
      approved_by_employee:employees!training_plans_approved_by_fkey (
        id,
        profile:profiles (
          full_name
        )
      ),
      training_plan_programs (
        id,
        name,
        description,
        start_date,
        end_date,
        order_index,
        training_plan_program_courses:training_plan_program_courses!training_plan_program_courses_program_id_fkey (
          id,
          course_id,
          course:courses (
            id,
            title
          )
        ),
        training_plan_topics:training_plan_topics!training_plan_topics_program_id_fkey (
          id,
          name,
          description,
          order_index,
          training_plan_topic_courses:training_plan_topic_courses!training_plan_topic_courses_topic_id_fkey (
            id,
            course_id,
            course:courses (
              id,
              title
            )
          )
        )
      )
      ,
      training_plan_surveys (
        id,
        created_at,
        survey_id,
        start_date,
        end_date,
        status,
        result_summary,
        target_type,
        target_unit_ids,
        survey:surveys (
          id,
          title,
          created_at
        )
      )
    `,
    )
    .order("order_index", {
      ascending: true,
      referencedTable: "training_plan_programs",
    })
    .order("created_at", {
      ascending: false,
      referencedTable: "training_plan_surveys",
    })
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const getPlanStatusCounts = async ({ organizationId, search }: Pick<GetPlansParams, "organizationId" | "search">) => {
  const { data, error } = await supabase.rpc("get_training_plan_status_counts" as any, {
    org_id: organizationId,
    search_text: search || null,
  });

  if (error) throw new Error(error.message);
  const stats = (data?.[0] as any) || {};

  return {
    total: Number(stats.total) || 0,
    approved: Number(stats.approved) || 0,
    pending: Number(stats.pending) || 0,
    pending_survey: Number(stats.pending_survey) || 0,
    rejected: Number(stats.rejected) || 0,
  };
};

const getPlanDetailCounts = async (id: string) => {
  const { data, error } = await supabase.rpc("get_training_plan_detail_counts" as any, {
    plan_id: id,
  });

  if (error) throw new Error(error.message);
  const counts = (data?.[0] as any) || {};

  return {
    programsCount: Number(counts.programs_count) || 0,
    topicsCount: Number(counts.topics_count) || 0,
    coursesCount: Number(counts.courses_count) || 0,
    instructorsCount: Number(counts.instructors_count) || 0,
  };
};

type CreateProgramInsert = TablesInsert<"training_plan_programs">;
type CreateTopicInsert = TablesInsert<"training_plan_topics">;
type CreateTopicCourseInsert = TablesInsert<"training_plan_topic_courses">;
type CreateProgramCourseInsert = TablesInsert<"training_plan_program_courses">;
type CreatePlanSurveyInsert = TablesInsert<"training_plan_surveys">;

const getCourseOptions = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("organization_id", organizationId)
    .not("status", "eq", "deleted")
    .limit(100);

  if (error) throw new Error(error.message);
  return data;
};

const insertPlan = async (plan: TablesInsert<"training_plans">) => {
  const { data, error } = await supabase.from("training_plans").insert(plan).select("*").single();
  if (error || !data) throw new Error(error?.message || "Không thể tạo kế hoạch");
  return data;
};

const updatePlanRow = async (id: string, plan: TablesUpdate<"training_plans">) => {
  const { error } = await supabase.from("training_plans").update(plan).eq("id", id);
  if (error) throw new Error(error.message);
};

const deletePlan = async (id: string) => {
  const { error } = await supabase.from("training_plans").update({ status: "deleted" }).eq("id", id);
  if (error) throw new Error(error.message);
};

const deleteProgramsByPlan = async (planId: string) => {
  const { error } = await supabase.from("training_plan_programs").delete().eq("plan_id", planId);
  if (error) throw new Error(error.message);
};

const insertProgram = async (payload: CreateProgramInsert) => {
  const { data, error } = await supabase.from("training_plan_programs").insert(payload).select("*").single();
  if (error || !data) throw new Error(error?.message || "Không thể tạo chương trình đào tạo");
  return data;
};

const insertProgramCourses = async (payload: CreateProgramCourseInsert[]) => {
  if (!payload.length) return;
  const { error } = await supabase.from("training_plan_program_courses").insert(payload);
  if (error) throw new Error(error.message);
};

const insertTopic = async (payload: CreateTopicInsert) => {
  const { data, error } = await supabase.from("training_plan_topics").insert(payload).select("*").single();
  if (error || !data) throw new Error(error?.message || "Không thể tạo chủ đề");
  return data;
};

const insertTopicCourses = async (payload: CreateTopicCourseInsert[]) => {
  if (!payload.length) return;
  const { error } = await supabase.from("training_plan_topic_courses").insert(payload);
  if (error) throw new Error(error.message);
};

const insertPlanSurvey = async (payload: CreatePlanSurveyInsert) => {
  const { data, error } = await supabase.from("training_plan_surveys").insert(payload).select("*").single();
  if (error || !data) throw new Error(error?.message || "Không thể lưu khảo sát");
  return data;
};

const deletePlanSurveyByPlan = async (planId: string) => {
  const { error } = await supabase.from("training_plan_surveys").delete().eq("plan_id", planId);
  if (error) throw new Error(error.message);
};

const replacePlanSurvey = async (planId: string, payload?: CreatePlanSurveyInsert) => {
  await deletePlanSurveyByPlan(planId);
  if (!payload) return;
  return insertPlanSurvey(payload);
};

export const plansRepository = {
  getPlans,
  getPlanDetail,
  getPlanStatusCounts,
  getPlanDetailCounts,
  getCourseOptions,
  insertPlan,
  updatePlanRow,
  deletePlan,
  deleteProgramsByPlan,
  insertProgram,
  insertProgramCourses,
  insertTopic,
  insertTopicCourses,
  insertPlanSurvey,
  deletePlanSurveyByPlan,
  replacePlanSurvey,
};
