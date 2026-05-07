import { supabase } from "@/integrations/supabase/client";

export const ADMIN_ROLES = new Set([
  "admin",
  "tenant_admin",
  "administrator_type",
  "Quản trị viên",
]);

export const STUDENT_ROLES = new Set([
  "student",
  "learner",
  "learner_type",
  "Học viên",
]);

export type AppRole = "admin" | "student";

export async function getUserRole(): Promise<{ uid: string | null; role: AppRole | null }> {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id ?? null;
  if (!uid) return { uid: null, role: null };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const list = (roles ?? []).map((r) => r.role as string);
  if (list.some((r) => ADMIN_ROLES.has(r))) return { uid, role: "admin" };
  return { uid, role: "student" };
}
