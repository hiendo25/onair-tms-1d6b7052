import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/departments/list")({
  beforeLoad: () => { throw redirect({ to: "/departments" }); },
  component: () => <Link to="/departments">Đi tới danh sách phòng ban</Link>,
});
