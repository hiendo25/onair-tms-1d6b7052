import { Enums, Tables } from "@/types/supabase.types";
export type SurveyResponse = Tables<"surveys_response">;
export type SurveyTargetType = NonNullable<SurveyResponse["target_type"]>;
