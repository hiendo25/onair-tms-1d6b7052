import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/plans")({
  head: () => ({ meta: [{ title: "Kế hoạch đào tạo — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Kế hoạch đào tạo" description="Danh sách kế hoạch đào tạo" />,
});
