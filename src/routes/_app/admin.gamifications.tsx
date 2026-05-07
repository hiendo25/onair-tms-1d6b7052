import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/gamifications")({
  head: () => ({ meta: [{ title: "Gamification — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Gamification" description="Cấu hình gamification" />,
});
