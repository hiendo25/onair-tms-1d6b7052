import { createFileRoute, Link, redirect } from "@tanstack/react-router";

// Reference: /branches/list — alias to /branches
export const Route = createFileRoute("/_app/branches/list")({
  beforeLoad: () => { throw redirect({ to: "/branches" }); },
  component: () => <Link to="/branches">Đi tới danh sách chi nhánh</Link>,
});
