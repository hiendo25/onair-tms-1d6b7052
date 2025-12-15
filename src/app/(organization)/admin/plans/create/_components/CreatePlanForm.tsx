"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import PlanForm from "../../_components/PlanForm";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { PATHS } from "@/constants/path.constant";
import { useCreatePlanMutation } from "@/modules/plans/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

export default function CreatePlanForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createPlan, isPending } = useCreatePlanMutation();
  const userInfo = useUserOrganization((state) => state.data);

  const createPlanAndRedirect = async (
    data: PlanFormSchema,
    successMessage: string,
    status?: "pending" | "pending_survey",
  ) => {
    try {
      await createPlan({
        form: data,
        organizationId: userInfo.organization.id,
        createdBy: userInfo.id,
        status,
      });
      enqueueSnackbar(successMessage, { variant: "success" });
      router.push(PATHS.PLANS.ROOT);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Tạo kế hoạch thất bại", { variant: "error" });
    }
  };

  const handleSubmit = (data: PlanFormSchema) => createPlanAndRedirect(data, "Tạo kế hoạch thành công", "pending");
  const handleExecutePlan = (data: PlanFormSchema) =>
    createPlanAndRedirect(data, "Đã tạo kế hoạch (khảo sát)", "pending_survey");

  return (
    <PlanForm
      onSubmit={handleSubmit}
      isLoading={isPending}
      onExecutePlan={handleExecutePlan}
      isExecuteLoading={isPending}
      planStatus="pending"
    />
  );
}
