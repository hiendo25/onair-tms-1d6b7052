"use client";

import dayjs from "dayjs";
import React, { useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useWatch } from "react-hook-form";
import { RHFInputDecimalField } from "@/shared/ui/form/RHFInputDecimal";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { PlanStatus } from "@/model/plan.model";
import { Survey } from "@/modules/plans/plan-form.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useCreatePlanMutation, useUpdatePlanMutation } from "@/modules/plans/operations/mutation";
import { useSnackbar } from "notistack";
import { validatePlanStep } from "@/modules/plans/plan-step.utils";
import { PATHS } from "@/constants/path.contstants";
import { useRouter } from "next/navigation";
import { PlanSurveySection } from "./PlanSurveySection";
import { isSurveyLocked } from "../../../helper";

interface StepPlanInfoProps {
  onContinue: () => void;
  isLoading?: boolean;
  planStatus?: PlanStatus;
  mode?: "create" | "edit";
  planId?: string;
}

export default function StepPlanInfo({
  onContinue,
  isLoading = false,
  planStatus,
  mode = "create",
  planId,
}: StepPlanInfoProps) {
  const { control, getValues, trigger } = usePlanFormContext();
  const planStartDate = useWatch({ control, name: "info.startDate" });
  const surveyValue = useWatch({ control, name: "info.survey" }) as Survey | undefined;
  const userInfo = useUserOrganization((state) => state.data);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { mutateAsync: createPlan, isPending: isCreatingPlan } = useCreatePlanMutation();
  const { mutateAsync: updatePlan, isPending: isUpdatingPlan } = useUpdatePlanMutation();
  const surveyLocked = isSurveyLocked(planStatus, surveyValue);
  const isPendingSurveyPlan = planStatus === "pending_survey";
  const isSavingPlan = isCreatingPlan || isUpdatingPlan;

  const handleExecutePlan = useCallback(async () => {
    const survey = getValues("info.survey") as Survey | undefined;
    if (!survey) {
      enqueueSnackbar("Vui lòng chọn và lưu khảo sát trước khi thực hiện kế hoạch.", { variant: "warning" });
      return;
    }
    if (survey.status === "closed") {
      enqueueSnackbar("Khảo sát đã hoàn thành, không thể thực hiện kế hoạch mới.", { variant: "warning" });
      return;
    }

    const isValidInfo = await validatePlanStep(1, trigger);
    if (!isValidInfo) {
      enqueueSnackbar("Vui lòng hoàn thành thông tin kế hoạch trước khi thực hiện.", { variant: "warning" });
      return;
    }

    if (!userInfo?.organization?.id || !userInfo?.id) {
      enqueueSnackbar("Không thể thực hiện kế hoạch do thiếu thông tin tổ chức hoặc người dùng.", { variant: "error" });
      return;
    }

    const formValues = getValues();
    const payload = {
      ...formValues,
      info: {
        ...formValues.info,
        survey,
      },
      programs: formValues.programs ?? [],
    };

    try {
      if (mode === "create") {
        await createPlan({
          form: payload,
          organizationId: userInfo.organization.id,
          createdBy: userInfo.id,
        });
        enqueueSnackbar("Đã tạo kế hoạch với trạng thái chờ khảo sát.", { variant: "success" });
        router.push(PATHS.PLANS.ROOT);
        return;
      }

      if (mode === "edit" && !planId) {
        enqueueSnackbar("Thiếu mã kế hoạch để cập nhật.", { variant: "error" });
        return;
      }

      if (mode === "edit" && planId && !isPendingSurveyPlan) {
        enqueueSnackbar("Chỉ có thể cập nhật khảo sát khi kế hoạch đang chờ khảo sát.", { variant: "warning" });
        return;
      }

      if (mode === "edit" && planId && isPendingSurveyPlan) {
        await updatePlan({
          id: planId,
          form: payload,
          organizationId: userInfo.organization.id,
          createdBy: userInfo.id,
          status: planStatus,
        });
        enqueueSnackbar("Đã cập nhật khảo sát cho kế hoạch.", { variant: "success" });
        router.push(PATHS.PLANS.ROOT);
      }
    } catch (error: any) {
      const fallbackMessage = mode === "create"
        ? "Không thể tạo kế hoạch chờ khảo sát"
        : "Không thể cập nhật khảo sát";
      enqueueSnackbar(error?.message || fallbackMessage, { variant: "error" });
    }
  }, [
    createPlan,
    enqueueSnackbar,
    getValues,
    isPendingSurveyPlan,
    mode,
    planId,
    planStatus,
    router,
    trigger,
    updatePlan,
    userInfo,
  ]);

  return (
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 1
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thông tin kế hoạch
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              Xác định mục tiêu, phạm vi thời gian và khảo sát liên quan trước khi bắt đầu.
            </Typography>
          </Box>
          <Chip label="Bắt buộc" color="primary" size="small" />
        </Box>

        <Stack spacing={3} sx={{ mt: 1 }}>
          <RHFTextField
            control={control}
            name="info.name"
            label="Tên kế hoạch"
            placeholder="VD: Kế hoạch đào tạo 2025"
            required
          />

          <RHFTextAreaField
            control={control}
            name="info.objective"
            label="Mục tiêu"
            placeholder="Mô tả mục tiêu ngắn của kế hoạch đào tạo"
            minRows={4}
            maxRows={6}
          />

          <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "grey.50", border: "1px dashed", borderColor: "divider" }}>
            <Typography sx={{ mb: 1, fontSize: "0.9rem", fontWeight: 600 }}>
              Thời gian triển khai
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
              Xác định thời gian bắt đầu và kết thúc để chúng tôi giúp bạn theo dõi tiến độ.
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <RHFDateTimePicker
                control={control}
                name="info.startDate"
                minDate={dayjs()}
              />
              <RHFDateTimePicker
                control={control}
                name="info.endDate"
                minDate={dayjs(planStartDate)}
              />
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                Ngân sách
              </Typography>
              <RHFInputDecimalField
                name="info.budget"
                placeholder="VD: 50.000.000"
                size="small"
              />
            </Box>

            <Box>
              <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
                Khảo sát
              </Typography>
              <PlanSurveySection />
            </Box>
          </Box>

          {surveyLocked && (
            <Alert severity="warning">
              Cần hoàn thành khảo sát trước khi thực hiện các bước tiếp theo.
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={handleExecutePlan}
              disabled={isSavingPlan}
              startIcon={<PlayCircleOutlineIcon fontSize="small" />}
              sx={{ px: 3.5, py: 1 }}
            >
              Thực hiện kế hoạch
            </Button>
            <Button
              variant="contained"
              onClick={onContinue}
              disabled={isLoading || surveyLocked}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{ px: 3.5, py: 1 }}
            >
              Tiếp tục
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
