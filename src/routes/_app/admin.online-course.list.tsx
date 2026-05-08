import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/online-course/list")({
  beforeLoad: () => { throw redirect({ to: "/admin/online-course" }); },
  component: () => <Link to="/admin/online-course">Đi tới danh sách khóa học</Link>,
});
