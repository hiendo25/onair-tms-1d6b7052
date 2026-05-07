import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/departments")({
  head: () => ({ meta: [{ title: "Phòng ban — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Phòng ban" description="Quản lý phòng ban" />,
});
