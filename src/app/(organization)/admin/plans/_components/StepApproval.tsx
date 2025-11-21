"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Control, FieldErrors, useWatch } from "react-hook-form";
import { PlanFormSchema } from "@/modules/plans/plan-form.schema";

interface StepApprovalProps {
  control: Control<PlanFormSchema>;
  errors: FieldErrors<PlanFormSchema>;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function StepApproval({
  control,
  errors,
  onBack,
  onSubmit,
  isLoading = false,
}: StepApprovalProps) {
  // Watch form values to display summary
  const formValues = useWatch({ control });
  const planName = formValues.info?.name || "";
  const programsCount = formValues.programs?.length || 0;

  // Count total topics across all programs
  const topicsCount = formValues.programs?.reduce((total, program) => {
    return total + (program.topics?.length || 0);
  }, 0) || 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Bước 4: Gửi duyệt đề xuất
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gửi duyệt đề xuất lên cấp trên phê duyệt
        </Typography>

        {/* Plan Summary */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: "success.main",
            fontWeight: 600,
          }}
        >
          Kế hoạch &quot;{planName}&quot; của bạn đã sẵn sàng gửi duyệt
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Khi được phê duyệt, bạn có thể gán khóa học và mở lớp đào tạo.
        </Typography>

        {/* Statistics Box */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#e8f5e9",
            borderRadius: 1,
            display: "flex",
            gap: 4,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Chương trình đào tạo
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {programsCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Chủ đề đã tạo
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {topicsCount}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={isLoading}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Gửi duyệt kế hoạch
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

