import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/library")({
  head: () => ({ meta: [{ title: "Thư viện — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Thư viện" description="Tài liệu, flashcard, chứng nhận" />,
});
