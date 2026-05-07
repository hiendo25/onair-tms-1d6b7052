import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/my-gamification")({
  head: () => ({ meta: [{ title: "Thưởng học tập — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Thưởng học tập" description="Điểm thưởng và thành tích" />,
});
