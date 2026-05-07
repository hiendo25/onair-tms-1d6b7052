import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình học tập — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Lộ trình học tập" description="Danh sách lộ trình học tập" />,
});
