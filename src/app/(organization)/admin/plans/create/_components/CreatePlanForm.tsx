"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import PlanForm from "../../_components/PlanForm";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { PATHS } from "@/constants/path.contstants";
import { useCreatePlanMutation } from "@/modules/plans/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

export default function CreatePlanForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: createPlan, isPending } = useCreatePlanMutation();
  const userInfo = useUserOrganization((state) => state.data);

  const handleSubmit = async (data: PlanFormSchema) => {
    try {
      await createPlan({
        form: data,
        organizationId: userInfo.organization.id,
        createdBy: userInfo.id,
      });
      enqueueSnackbar("Tạo kế hoạch thành công", { variant: "success" });
      router.push(PATHS.PLANS.ROOT);
      
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Tạo kế hoạch thất bại", { variant: "error" });
    }
  };

  return <PlanForm onSubmit={handleSubmit} isLoading={isPending} />;
}
