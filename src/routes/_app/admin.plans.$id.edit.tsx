import { createFileRoute } from "@tanstack/react-router";
import { PlanWizard } from "@/components/admin/PlanWizard";

export const Route = createFileRoute("/_app/admin/plans/$id/edit")({
  head: () => ({ meta: [{ title: "Chỉnh sửa kế hoạch — OnAir TMS" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <PlanWizard planId={id} />;
  },
});
