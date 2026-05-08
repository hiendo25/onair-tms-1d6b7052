import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/employees/import")({
  beforeLoad: () => { throw redirect({ to: "/admin/employees" }); },
  component: () => null,
});
