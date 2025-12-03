import { supabase } from "@/services";
import { TablesInsert, TablesUpdate } from "@/types/supabase.types";

interface GetPlansParams {
  search?: string;
  organizationId: string;
}

const getPlans = async ({ search, organizationId }: GetPlansParams) => {
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
      training_plan_programs (
        id,
        training_plan_topics:training_plan_topics!training_plan_topics_program_id_fkey ( id )
      )
    `,
    )
    .eq("organization_id", organizationId)
    .not("status", "in", "(deleted)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
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
    `,
    )
    .order("order_index", {
      ascending: true,
      referencedTable: "training_plan_programs",
    })
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

type CreateProgramInsert = TablesInsert<"training_plan_programs">;
type CreateTopicInsert = TablesInsert<"training_plan_topics">;
type CreateTopicCourseInsert = TablesInsert<"training_plan_topic_courses">;
type CreateProgramCourseInsert = TablesInsert<"training_plan_program_courses">;

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

export const plansRepository = {
  getPlans,
  getPlanDetail,
  getCourseOptions,
  insertPlan,
  updatePlanRow,
  deletePlan,
  deleteProgramsByPlan,
  insertProgram,
  insertProgramCourses,
  insertTopic,
  insertTopicCourses,
};
