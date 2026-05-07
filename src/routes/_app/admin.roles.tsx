import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/roles")({
  head: () => ({ meta: [{ title: "Vai trò & phân quyền — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Vai trò & phân quyền" description="Quản lý vai trò và phân quyền" />,
});
