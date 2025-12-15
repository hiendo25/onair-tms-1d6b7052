import { Database, Tables } from "@/types/supabase.types";

export type Organization = Tables<"role_permissions">;

export type PermissionActions = Database["public"]["Enums"]["action_code_enum"];
