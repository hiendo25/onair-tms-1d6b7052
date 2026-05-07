import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/my-class")({
  head: () => ({ meta: [{ title: "Lớp học của tôi — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Lớp học của tôi" description="Các lớp học đang tham gia" />,
});
