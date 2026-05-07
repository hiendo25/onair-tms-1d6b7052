import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/certificates")({
  head: () => ({ meta: [{ title: "Chứng nhận — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Chứng nhận" description="Quản lý chứng nhận" />,
});
