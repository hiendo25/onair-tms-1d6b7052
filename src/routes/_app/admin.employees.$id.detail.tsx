import { createFileRoute, Link, redirect } from "@tanstack/react-router";

// Reference: /admin/employees/[id]/detail
export const Route = createFileRoute("/_app/admin/employees/$id/detail")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/admin/employees/$id/edit", params }); },
  component: () => <Link to="/admin/employees">Đi tới danh sách người dùng</Link>,
});
