import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/my-assignments")({
  head: () => ({ meta: [{ title: "Bài kiểm tra của tôi — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Bài kiểm tra của tôi" description="Các bài kiểm tra cần làm" />,
});
