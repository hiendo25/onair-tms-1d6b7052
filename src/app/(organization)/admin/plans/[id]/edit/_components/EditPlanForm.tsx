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

interface EditPlanFormProps {
  planId: string;
}

export default function EditPlanForm({ planId }: EditPlanFormProps) {
  const { show } = useNotifications();
  const user = useUserOrganization((state) => state.data);
  const { data: planDetail, isLoading, isError } = useGetPlanDetailQuery(planId);
  const { mutateAsync: updatePlan, isPending } = useUpdatePlanMutation();

  const planData: PlanFormSchema | undefined = React.useMemo(
    () => (planDetail ? mapPlanDetailToFormValues(planDetail) : undefined),
    [planDetail],
  );

  const handleSubmit = async (data: PlanFormSchema) => {
    try {
      await updatePlan({
        id: planId,
        form: data,
        organizationId: user.organization.id,
        createdBy: user.id,
      });
      show("Cập nhật kế hoạch đào tạo thành công!", { severity: "success" });
      // router.push("/admin/plans");
    } catch (error: any) {
      show(error?.message || "Cập nhật kế hoạch thất bại", { severity: "error" });
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
      />
    </PageContainer>
  );
}
