import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/online-course")({
  head: () => ({ meta: [{ title: "Môn học — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Môn học" description="Danh sách môn học" />,
});
