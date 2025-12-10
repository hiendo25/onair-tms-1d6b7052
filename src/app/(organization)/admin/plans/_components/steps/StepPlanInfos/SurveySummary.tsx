import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Survey } from "@/modules/plans/plan-form.schema";
import { formatSurveyDateTime, getSurveyStatusLabel, getSurveyStatusTone, getSurveyTargetLabel } from "../../../helper";

interface SurveySummaryProps {
  survey?: Survey;
  onOpenConfig: () => void;
  onOpenPicker: () => void;
  onClear: () => void;
}

export function SurveySummary({
  survey,
  onOpenConfig,
  onOpenPicker,
  onClear,
}: SurveySummaryProps) {
  if (!survey) {
    return (
      <Button variant="outlined" onClick={onOpenPicker} startIcon={<SearchIcon />} size="small">
        Chọn khảo sát
      </Button>
    );
  }

  const statusTone = getSurveyStatusTone(survey.status);

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          p: 1.75,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {survey.title}
          </Typography>
          <Chip
            size="small"
            label={getSurveyStatusLabel(survey.status)}
            color={statusTone.color as any}
            variant={statusTone.variant}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Đối tượng: {getSurveyTargetLabel(survey.targetType)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thời gian: {formatSurveyDateTime(survey.startDate)} - {formatSurveyDateTime(survey.endDate)}
        </Typography>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button variant="contained" onClick={onOpenConfig} size="small">
          Cập nhật khảo sát
        </Button>
        <Button variant="outlined" onClick={onOpenPicker} size="small">
          Đổi khảo sát
        </Button>
        <Button variant="text" color="error" onClick={onClear} size="small">
          Xóa
        </Button>
      </Stack>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Liên kết khảo sát giúp theo dõi nhu cầu và mức độ hài lòng của học viên.
        </Typography>
      </Box>
    </Stack>
  );
}
