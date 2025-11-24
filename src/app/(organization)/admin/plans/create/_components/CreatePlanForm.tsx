"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import PlanForm from "../../_components/PlanForm";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { PATHS } from "@/constants/path.contstants";

export default function CreatePlanForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (data: PlanFormSchema) => {
    console.log("Creating plan:", data);

    enqueueSnackbar("Tạo kế hoạch thành công", { variant: "success" });
    router.push(PATHS.PLANS.ROOT);
  };

  return <PlanForm onSubmit={handleSubmit} />;
}

