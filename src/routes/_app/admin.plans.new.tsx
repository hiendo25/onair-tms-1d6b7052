import { createFileRoute } from "@tanstack/react-router";
import { PlanWizard } from "@/components/admin/PlanWizard";

export const Route = createFileRoute("/_app/admin/plans/new")({
  head: () => ({ meta: [{ title: "Tạo kế hoạch — OnAir TMS" }] }),
  component: () => <PlanWizard />,
});
