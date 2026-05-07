import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/flashcards/create")({
  head: () => ({ meta: [{ title: "Tạo Flashcard — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo Flashcard" description="Tạo flashcard mới" />,
});
