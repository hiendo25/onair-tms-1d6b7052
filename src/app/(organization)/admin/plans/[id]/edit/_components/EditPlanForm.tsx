"use client";

import * as React from "react";
import PageContainer from "@/shared/ui/PageContainer";
import PlanForm from "@/app/(organization)/admin/plans/_components/PlanForm";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useGetPlanDetailQuery } from "@/modules/plans/operations/query";
import { useUpdatePlanMutation } from "@/modules/plans/operations/mutation";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { Box, CircularProgress, Typography } from "@mui/material";
import { mapPlanDetailToFormValues } from "@/modules/plans/plan-form.utils";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { useRouter, useSearchParams } from "next/navigation";
import { PlanStepId } from "@/modules/plans/plan-step.utils";
import { PATHS } from "@/constants/path.constant";
import { PlanStatus } from "@/model/plan.model";

interface EditPlanFormProps {
  planId: string;
}

export default function EditPlanForm({ planId }: EditPlanFormProps) {
  const { show } = useNotifications();
  const user = useUserOrganization((state) => state.data);
  const { data: planDetail, isLoading, isError } = useGetPlanDetailQuery(planId);
  const { mutateAsync: updatePlan, isPending } = useUpdatePlanMutation();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const router = useRouter();

  const initialStepFromQuery = React.useMemo<PlanStepId | undefined>(() => {
    if (!stepParam) return undefined;
    const stepNumber = Number(stepParam);
    const allowedSteps: PlanStepId[] = [1, 2, 3, 4, 5];
    return allowedSteps.includes(stepNumber as PlanStepId) ? (stepNumber as PlanStepId) : undefined;
  }, [stepParam]);

  const planData: PlanFormSchema | undefined = React.useMemo(
    () => (planDetail ? mapPlanDetailToFormValues(planDetail) : undefined),
    [planDetail],
  );

  const handleSubmit = async (data: PlanFormSchema) => {
    const targetStatus: PlanStatus = planDetail?.status === "approved" ? "approved" : "pending";
    try {
      await updatePlan({
        id: planId,
        form: data,
        organizationId: user.organization.id,
        createdBy: user.id,
        status: targetStatus,
      });
      show("Cập nhật kế hoạch đào tạo thành công!", { severity: "success" });
      router.push(PATHS.PLANS.ROOT);
    } catch (error: any) {
      show(error?.message || "Cập nhật kế hoạch thất bại", { severity: "error" });
    }
  };

  const handleExecutePlan = async (data: PlanFormSchema) => {
    if (planDetail?.status !== "pending_survey") {
      show("Chỉ cập nhật khảo sát khi kế hoạch đang chờ khảo sát.", { severity: "warning" });
      return;
    }

    try {
      await updatePlan({
        id: planId,
        form: data,
        organizationId: user.organization.id,
        createdBy: user.id,
        status: "pending_survey",
      });
      show("Đã cập nhật khảo sát cho kế hoạch.", { severity: "success" });
      router.push(PATHS.PLANS.ROOT);
    } catch (error: any) {
      show(error?.message || "Không thể cập nhật khảo sát", { severity: "error" });
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Chỉnh sửa kế hoạch đào tạo">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải kế hoạch...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (isError || !planData) {
    return (
      <PageContainer title="Kế hoạch không tồn tại">
        <Box sx={{ p: 3 }}>
          <Typography>Không tìm thấy kế hoạch đào tạo</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Chỉnh sửa kế hoạch đào tạo"
      breadcrumbs={[
        { title: "Kế hoạch đào tạo", path: "/admin/plans" },
        { title: "Chỉnh sửa", path: `/admin/plans/${planId}/edit` },
      ]}
    >
      <PlanForm
        onSubmit={handleSubmit}
        mode="edit"
        initialData={planData}
        isLoading={isPending}
        planStatus={planDetail?.status}
        initialStep={initialStepFromQuery}
        onExecutePlan={handleExecutePlan}
        isExecuteLoading={isPending}
      />
    </PageContainer>
  );
}
