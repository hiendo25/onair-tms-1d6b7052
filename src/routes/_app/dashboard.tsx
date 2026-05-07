import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw redirect({ to: "/student/dashboard" });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);

    const isAdmin = (roles ?? []).some((r) => {
      const role = r.role as string;
      return role === "admin" || role === "tenant_admin";
    });
    throw redirect({ to: isAdmin ? "/admin/dashboard" : "/student/dashboard" });
  },
  component: () => null,
});
