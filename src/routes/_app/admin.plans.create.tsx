import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/plans/create")({
  head: () => ({ meta: [{ title: "Tạo kế hoạch — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo kế hoạch" description="Tạo kế hoạch đào tạo mới" />,
});
