import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/assignments")({
  head: () => ({ meta: [{ title: "Ngân hàng bài kiểm tra — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Ngân hàng bài kiểm tra" description="Quản lý bài kiểm tra" />,
});
