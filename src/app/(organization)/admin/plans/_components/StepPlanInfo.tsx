"use client";

import { Autocomplete, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { PlanFormSchema, Survey } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFDatePicker from "@/shared/ui/form/RHFDatePicker";

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
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onContinue: () => void;
  isLoading?: boolean;
}

export default function StepPlanInfo({
  control,
  errors,
  onContinue,
  isLoading = false,
}: StepPlanInfoProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Bước 1: Thông tin kế hoạch
        </Typography>
        <Stack spacing={3}>
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
            minRows={3}
            maxRows={6}
          />

          <Box>
            <Typography sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
              Từ ngày - Đến ngày
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <RHFDatePicker
                control={control}
                name="info.startDate"
                placeholder="Chọn ngày bắt đầu"
              />
              <RHFDatePicker
                control={control}
                name="info.endDate"
                placeholder="Chọn ngày kết thúc"
              />
            </Box>
          </Box>

          <RHFTextField
            control={control}
            name="info.budget"
            label="Ngân sách (VND)"
            placeholder="VD: 50.000.000"
            type="number"
          />

          {/* Survey Selection Field */}
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
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              onClick={onContinue}
              disabled={isLoading}
            >
              Tiếp tục
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

