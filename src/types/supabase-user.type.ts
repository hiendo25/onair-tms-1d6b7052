import type { User } from "@supabase/supabase-js";

export type AppMetadata = User["app_metadata"] & {
  active_organization_id?: string;
  role?: "owner" | "admin" | "member";
};

export type SupabaseUser = User & {
  app_metadata: AppMetadata;
};
