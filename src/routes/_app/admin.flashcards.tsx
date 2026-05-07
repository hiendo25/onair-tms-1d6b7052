import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/flashcards")({
  head: () => ({ meta: [{ title: "Flashcard — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Flashcard" description="Quản lý flashcard" />,
});
