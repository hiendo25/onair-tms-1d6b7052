import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/assignments/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Ngân hàng câu hỏi" description="Quản lý ngân hàng câu hỏi" />,
});
