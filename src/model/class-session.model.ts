import { Tables } from "@/types/supabase.types";

export type ClassSession = Tables<"class_sessions">;
export type ClassSessionChannelProvider = Required<ClassSession>["channel_provider"];
export type ClassSessionType = Tables<"class_sessions">["session_type"];
