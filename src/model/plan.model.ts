import { Tables } from "@/types/supabase.types";

export type Plan = Tables<"training_plans">;
export type PlanProgram = Tables<"training_plan_programs">;
export type PlanTopic = Tables<"training_plan_topics">;
export type PlanTopicCourse = Tables<"training_plan_topic_courses">;
export type PlanStatus = Plan["status"];
