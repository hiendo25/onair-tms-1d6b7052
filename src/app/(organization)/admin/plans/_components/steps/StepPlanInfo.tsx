"use client";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useWatch } from "react-hook-form";
import { Survey } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";
import { RHFInputDecimalField } from "@/shared/ui/form/RHFInputDecimal";

// Mock surveys data
const MOCK_SURVEYS: Survey[] = [
  { id: "1", title: "Khảo sát đầu khóa" },
  { id: "2", title: "Khảo sát giữa khóa" },
  { id: "3", title: "Khảo sát cuối khóa" },
  { id: "4", title: "Khảo sát đánh giá giảng viên" },
  { id: "5", title: "Khảo sát mức độ hài lòng" },
  { id: "6", title: "Khảo sát nhu cầu đào tạo" },
];

interface StepPlanInfoProps {
  onContinue: () => void;
  isLoading?: boolean;
}

export default function StepPlanInfo({
  onContinue,
  isLoading = false,
}: StepPlanInfoProps) {
  const { control, getValues, } = usePlanFormContext();

  const startDate = getValues("info.startDate");

  useWatch({
    control,
    name: [`info.startDate`],
  });


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
                minDate={dayjs(startDate)}
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
              <Controller
                name="info.survey"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={MOCK_SURVEYS}
                    getOptionLabel={(option) => option.title}
                    value={value || null}
                    onChange={(_event, newValue) => {
                      onChange(newValue);
                    }}
                    size="small"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Chọn khảo sát"
                      />
                    )}
                  />
                )}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Liên kết khảo sát giúp theo dõi mức độ hài lòng của học viên.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="contained"
              onClick={onContinue}
              disabled={isLoading}
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
