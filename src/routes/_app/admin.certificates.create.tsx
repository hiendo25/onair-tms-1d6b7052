import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/certificates/create")({
  head: () => ({ meta: [{ title: "Tạo chứng nhận — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo chứng nhận" description="Tạo chứng nhận mới" />,
});
