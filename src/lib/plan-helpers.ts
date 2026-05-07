import { supabase } from "@/integrations/supabase/client";
import type { DBPlan } from "./data-hooks";

export const PLAN_STATUS_BADGE: Record<DBPlan["status"], { label: string; cls: string }> = {
  draft: { label: "Bản nháp", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  pending_survey: { label: "Đang khảo sát", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  pending: { label: "Chờ duyệt", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  approved: { label: "Đã duyệt", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Từ chối", cls: "bg-red-100 text-red-700 border-red-200" },
};

export type DBProgram = {
  id: string; plan_id: string; org_id: string;
  name: string; description: string;
  start_date: string | null; end_date: string | null;
  order_index: number; created_at: string;
};
export type DBTopic = {
  id: string; plan_id: string; program_id: string | null; org_id: string;
  name: string; description: string; order_index: number;
};
export type DBPlanSurvey = {
  id: string; plan_id: string; survey_id: string; org_id: string;
  start_date: string | null; end_date: string | null;
  target_type: "all" | "dept" | "branch";
  target_unit_ids: string[];
  status: "pending" | "active" | "completed" | "cancelled";
  result_summary: Record<string, unknown>;
};

export async function fetchPlanFull(planId: string) {
  const [plan, programs, topics, programCourses, topicCourses, planSurveys] = await Promise.all([
    supabase.from("plans").select("*").eq("id", planId).single(),
    supabase.from("training_plan_programs").select("*").eq("plan_id", planId).order("order_index"),
    supabase.from("training_plan_topics").select("*").eq("plan_id", planId).order("order_index"),
    supabase.from("training_plan_program_courses").select("*, course:online_courses(*)").in(
      "program_id",
      (await supabase.from("training_plan_programs").select("id").eq("plan_id", planId)).data?.map((p: any) => p.id) ?? ["00000000-0000-0000-0000-000000000000"],
    ),
    supabase.from("training_plan_topic_courses").select("*, course:online_courses(*)").in(
      "topic_id",
      (await supabase.from("training_plan_topics").select("id").eq("plan_id", planId)).data?.map((t: any) => t.id) ?? ["00000000-0000-0000-0000-000000000000"],
    ),
    supabase.from("training_plan_surveys").select("*, survey:surveys(*)").eq("plan_id", planId),
  ]);
  return {
    plan: plan.data as DBPlan | null,
    programs: (programs.data ?? []) as DBProgram[],
    topics: (topics.data ?? []) as DBTopic[],
    programCourses: (programCourses.data ?? []) as any[],
    topicCourses: (topicCourses.data ?? []) as any[],
    planSurveys: (planSurveys.data ?? []) as any[],
  };
}
