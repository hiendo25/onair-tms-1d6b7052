import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { Survey } from "@/modules/plans/plan-form.schema";
import { getSurveyStatusLabel, getSurveyStatusTone, getSurveyTargetLabel } from "../../../helper";

interface SurveyResultDialogProps {
  open: boolean;
  onClose: () => void;
  survey?: Survey;
}

const renderSummary = (summary: unknown) => {
  if (!summary) {
    return <Typography color="text.secondary">Chưa có dữ liệu kết quả khảo sát.</Typography>;
  }

  const formatted =
    typeof summary === "string"
      ? summary
      : JSON.stringify(summary, null, 2);

  return (
    <Box
      component="pre"
      sx={{
        bgcolor: "grey.50",
        p: 2,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        whiteSpace: "pre-wrap",
        fontSize: 13,
      }}
    >
      {formatted}
    </Box>
  );
};

export function SurveyResultDialog({ open, onClose, survey }: SurveyResultDialogProps) {
  if (!survey) return null;

  const statusTone = getSurveyStatusTone(survey.status);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Kết quả khảo sát</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {survey.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đối tượng: {getSurveyTargetLabel(survey.targetType)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thời gian: {fDateTime(survey.startDate, FORMAT_DATE_TIME_CLEANER)} - {fDateTime(survey.endDate, FORMAT_DATE_TIME_CLEANER)}
              </Typography>
            </Box>
            <Chip
              label={getSurveyStatusLabel(survey.status)}
              color={statusTone.color as any}
              variant={statusTone.variant}
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Thông tin kết quả
            </Typography>
            {renderSummary(survey.resultSummary)}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
