import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/learning-paths/create")({
  head: () => ({ meta: [{ title: "Tạo lộ trình — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo lộ trình" description="Tạo lộ trình học tập mới" />,
});
