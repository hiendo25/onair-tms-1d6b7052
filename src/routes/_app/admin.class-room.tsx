import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/class-room")({
  head: () => ({ meta: [{ title: "Lớp học — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Lớp học" description="Danh sách lớp học" />,
});
