import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/surveys/list")({
  beforeLoad: () => { throw redirect({ to: "/admin/surveys" }); },
  component: () => <Link to="/admin/surveys">Đi tới danh sách khảo sát</Link>,
});
