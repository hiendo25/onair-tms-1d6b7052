import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/employees")({
  head: () => ({ meta: [{ title: "Người dùng — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Người dùng" description="Quản lý người dùng / nhân viên" />,
});
