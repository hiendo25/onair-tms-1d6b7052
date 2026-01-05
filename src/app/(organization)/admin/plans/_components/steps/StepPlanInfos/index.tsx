"use client";

import React, { useCallback, useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useWatch } from "react-hook-form";

import { PlanStatus } from "@/model/plan.model";
import { Survey } from "@/modules/plans/plan-form.schema";
import { validatePlanStep } from "@/modules/plans/plan-step.utils";
import { getPlanSurveyAccess } from "@/modules/plans/survey-access";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { RHFInputDecimalField } from "@/shared/ui/form/RHFInputDecimal";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";

import { PlanSurveySection } from "./PlanSurveySection";
import { PlanSurveyStatusNotice } from "./PlanSurveyStatusNotice";
import { SurveyResultDialog } from "./SurveyResultDialog";

interface StepPlanInfoProps {
  onContinue: () => void;
  isLoading?: boolean;
  planStatus?: PlanStatus;
  onExecutePlan?: (event?: any) => void | Promise<void>;
  isExecuting?: boolean;
}

export default function StepPlanInfo({
  onContinue,
  isLoading = false,
  planStatus,
  onExecutePlan,
  isExecuting = false,
}: StepPlanInfoProps) {
  const { control, trigger } = usePlanFormContext();
  const planStartDate = useWatch({ control, name: "info.startDate" });
  const surveyValue = useWatch({ control, name: "info.survey" }) as Survey | undefined;
  const { enqueueSnackbar } = useSnackbar();
  const [isResultDialogOpen, setResultDialogOpen] = useState(false);
  const surveyAccess = getPlanSurveyAccess(planStatus, surveyValue);
  const surveyLocked = surveyAccess.shouldLock;

  const handleExecutePlan = useCallback(async () => {
    if (!onExecutePlan) return;

    if (!surveyValue) {
      enqueueSnackbar("Vui lòng chọn khảo sát trước khi thực hiện kế hoạch.", { variant: "warning" });
      return;
    }

    if (surveyValue.status === "closed") {
      enqueueSnackbar("Khảo sát đã hoàn thành, không thể thực hiện kế hoạch mới.", { variant: "warning" });
      return;
    }

    const isValidInfo = await validatePlanStep(1, trigger);

    if (!isValidInfo) {
      enqueueSnackbar("Vui lòng hoàn thành thông tin kế hoạch trước khi thực hiện.", { variant: "warning" });
      return;
    }

    await onExecutePlan();
  }, [enqueueSnackbar, onExecutePlan, surveyValue, trigger]);

  return (
    <>
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
              <Typography sx={{ mb: 1, fontSize: "0.9rem", fontWeight: 600 }}>Thời gian triển khai</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
                Xác định thời gian bắt đầu và kết thúc để chúng tôi giúp bạn theo dõi tiến độ.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <RHFDateTimePicker control={control} name="info.startDate" />
                <RHFDateTimePicker control={control} name="info.endDate" minDateTime={dayjs(planStartDate)} />
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>Ngân sách</Typography>
                <RHFInputDecimalField control={control} name="info.budget" placeholder="VD: 50.000.000" size="small" />
              </Box>

              <Box>
                <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>Khảo sát</Typography>
                <PlanSurveySection />
              </Box>
            </Box>

            <PlanSurveyStatusNotice
              survey={surveyValue}
              access={surveyAccess}
              onViewResult={() => setResultDialogOpen(true)}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, gap: 1.5, flexWrap: "wrap" }}>
              {onExecutePlan && (
                <Button
                  variant="outlined"
                  onClick={handleExecutePlan}
                  disabled={isExecuting}
                  startIcon={<PlayCircleOutlineIcon fontSize="small" />}
                  sx={{ px: 3.5, py: 1 }}
                >
                  Thực hiện kế hoạch
                </Button>
              )}
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

      <SurveyResultDialog open={isResultDialogOpen} onClose={() => setResultDialogOpen(false)} survey={surveyValue} />
    </>
  );
}
