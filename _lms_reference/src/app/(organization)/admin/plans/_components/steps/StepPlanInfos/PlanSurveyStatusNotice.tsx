import { Alert, Button, Stack, Typography } from "@mui/material";

import { Survey } from "@/modules/plans/plan-form.schema";
import { PlanSurveyAccess } from "@/modules/plans/survey-access";
import { formatDateRange } from "../../../helper";

interface PlanSurveyStatusNoticeProps {
  survey?: Survey;
  access: PlanSurveyAccess;
  onViewResult?: () => void;
}

export function PlanSurveyStatusNotice({ survey, access, onViewResult }: PlanSurveyStatusNoticeProps) {
  if (!survey) return null;

  const dateRange = formatDateRange(survey.startDate, survey.endDate);

  if (access.hasResult) {
    return (
      <Alert
        severity="success"
        action={
          onViewResult ? (
            <Button color="success" size="small" onClick={onViewResult}>
              Xem kết quả
            </Button>
          ) : null
        }
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Đã có kết quả khảo sát.</Typography>
          {dateRange && (
            <Typography variant="body2" color="text.secondary">
              Thời gian khảo sát: {dateRange}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Bạn có thể tiếp tục các bước tiếp theo hoặc tham khảo kết quả khảo sát.
          </Typography>
        </Stack>
      </Alert>
    );
  }

  if (access.shouldLock) {
    return (
      <Alert severity="warning">
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Khảo sát đang chờ kết quả.</Typography>
          {dateRange && (
            <Typography variant="body2" color="text.secondary">
              Khung thời gian khảo sát: {dateRange}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Bạn có thể tiếp tục sau khi hết thời gian khảo sát hoặc khi có kết quả.
          </Typography>
        </Stack>
      </Alert>
    );
  }

  if (!access.isAfterEnd) {
    return null;
  }

  return (
    <Alert severity="info">
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">Đã hết thời gian khảo sát.</Typography>
        {dateRange && (
          <Typography variant="body2" color="text.secondary">
            Khung thời gian: {dateRange}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Chưa ghi nhận kết quả khảo sát, bạn vẫn có thể tiếp tục các bước tiếp theo.
        </Typography>
      </Stack>
    </Alert>
  );
}
