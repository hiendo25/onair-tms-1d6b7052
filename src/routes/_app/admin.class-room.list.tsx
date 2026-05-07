import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/class-room/list")({
  beforeLoad: () => { throw redirect({ to: "/admin/class-room" }); },
  component: () => <Link to="/admin/class-room">Đi tới danh sách lớp học</Link>,
});
