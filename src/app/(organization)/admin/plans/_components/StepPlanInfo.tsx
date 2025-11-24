"use client";

import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Control, FieldErrors } from "react-hook-form";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFDatePicker from "@/shared/ui/form/RHFDatePicker";

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

