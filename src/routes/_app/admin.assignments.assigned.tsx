import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/assignments/assigned")({
  head: () => ({ meta: [{ title: "Bài KT đã gán — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Bài KT đã gán" description="Danh sách bài kiểm tra đã gán" />,
});
