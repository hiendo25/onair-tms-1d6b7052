import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/class-room/create")({
  head: () => ({ meta: [{ title: "Tạo lớp học — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo lớp học" description="Tạo lớp học mới" />,
});
