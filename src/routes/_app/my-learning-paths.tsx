import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/my-learning-paths")({
  head: () => ({ meta: [{ title: "Lộ trình của tôi — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Lộ trình của tôi" description="Lộ trình học tập đã được giao" />,
});
