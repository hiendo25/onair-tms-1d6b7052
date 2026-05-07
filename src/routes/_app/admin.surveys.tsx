import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/surveys")({
  head: () => ({ meta: [{ title: "Khảo sát — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Khảo sát" description="Danh sách khảo sát" />,
});
