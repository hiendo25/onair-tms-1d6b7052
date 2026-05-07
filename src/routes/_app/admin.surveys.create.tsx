import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/_app/admin/surveys/create")({
  head: () => ({ meta: [{ title: "Tạo khảo sát — OnAir LMS" }] }),
  component: () => <PagePlaceholder title="Tạo khảo sát" description="Tạo khảo sát mới" />,
});
