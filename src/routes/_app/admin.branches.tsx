import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/branches")({
  head: () => ({ meta: [{ title: "Chi nhánh — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Chi nhánh" description="Quản lý chi nhánh tổ chức" />,
});
