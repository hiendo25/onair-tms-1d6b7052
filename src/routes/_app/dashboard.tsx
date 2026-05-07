import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/roles";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OnAir TMS" }] }),
  beforeLoad: async () => {
    const { role } = await getUserRole();
    throw redirect({ to: role === "admin" ? "/admin/dashboard" : "/student/dashboard" });
  },
  component: () => null,
});
