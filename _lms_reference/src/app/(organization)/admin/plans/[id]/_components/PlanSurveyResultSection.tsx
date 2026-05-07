"use client";

import { useMemo, useState } from "react";
import { Box, Button, Card, CardContent, CardHeader, Chip, Stack, Typography } from "@mui/material";

import { PlanStatus } from "@/model/plan.model";
import { Survey } from "@/modules/plans/plan-form.schema";
import { getPlanSurveyAccess } from "@/modules/plans/survey-access";
import { PlanSurveyDetail } from "@/modules/plans/types";
import { PlanSurveyStatusNotice } from "../../_components/steps/StepPlanInfos/PlanSurveyStatusNotice";
import { SurveyResultDialog } from "../../_components/steps/StepPlanInfos/SurveyResultDialog";
import { formatDateRange, getSurveyStatusLabel, getSurveyStatusTone, getSurveyTargetLabel } from "../../helper";

interface PlanSurveyResultSectionProps {
  survey?: PlanSurveyDetail | null;
  planStatus: PlanStatus;
}

export function PlanSurveyResultSection({ survey, planStatus }: PlanSurveyResultSectionProps) {
  const [isResultOpen, setResultOpen] = useState(false);

  const surveyValue: Survey | null = useMemo(() => {
    if (!survey) return null;
    return {
      id: survey.surveyId,
      title: survey.surveyTitle,
      planSurveyId: survey.id,
      startDate: survey.startDate,
      endDate: survey.endDate,
      status: survey.status,
      targetType: survey.targetType ?? "all",
      targetUnitIds: survey.targetUnitIds ?? [],
      createdAt: survey.surveyCreatedAt ?? null,
      resultSummary: survey.resultSummary ?? null,
    };
  }, [survey]);

  const access = useMemo(
    () => getPlanSurveyAccess(planStatus, surveyValue || undefined),
    [planStatus, surveyValue],
  );

  if (!surveyValue) return null;

  const statusTone = getSurveyStatusTone(surveyValue.status);
  const dateRange = formatDateRange(surveyValue.startDate, surveyValue.endDate);

  return (
    <>
      <Card sx={{ p: 2.5, mb: 3, border: "1px solid", borderColor: "divider", boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Khảo sát gắn với kế hoạch
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi tiến độ khảo sát và kết quả tóm tắt.
          </Typography>
        </Box>
        <CardContent>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {surveyValue.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đối tượng: {getSurveyTargetLabel(surveyValue.targetType)}
              </Typography>
              {dateRange && (
                <Typography variant="body2" color="text.secondary">
                  Thời gian khảo sát: {dateRange}
                </Typography>
              )}
            </Box>

            <PlanSurveyStatusNotice
              survey={surveyValue}
              access={access}
              onViewResult={() => setResultOpen(true)}
            />

            {access.hasResult && (
              <Box>
                <Button variant="contained" size="small" onClick={() => setResultOpen(true)}>
                  Xem kết quả khảo sát
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <SurveyResultDialog
        open={isResultOpen}
        onClose={() => setResultOpen(false)}
        survey={surveyValue}
      />
    </>
  );
}
