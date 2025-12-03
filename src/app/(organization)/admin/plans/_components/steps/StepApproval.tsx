"use client";

import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";

interface StepApprovalProps {
  onBack: () => void;
  onContinue?: () => void;
  isLoading?: boolean;
}

export default function StepApproval({
  onBack,
  onContinue,
  isLoading = false,
}: StepApprovalProps) {
  const { control } = usePlanFormContext();
  // Watch form values to display summary
  const formValues = useWatch({ control });
  const planName = formValues.info?.name || "";
  const programsCount = formValues.programs?.length || 0;

  // Count total topics across all programs
  const topicsCount = formValues.programs?.reduce((total, program) => {
    return total + (program.topics?.length || 0);
  }, 0) || 0;

  return (
    <Card sx={{ boxShadow: "0 14px 44px rgba(9, 30, 66, 0.08)", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Bước 4
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Gửi duyệt đề xuất
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Chốt lại thông tin trước khi gửi cấp phê duyệt.
            </Typography>
          </Box>
          <Chip label="Kiểm tra lại" color="success" variant="outlined" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2.75,
            borderRadius: 2,
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.100",
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            boxShadow: "0 12px 26px rgba(0,0,0,0.05)",
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: "success.main", mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ mb: 0.5, color: "success.main", fontWeight: 700 }}
            >
              Kế hoạch &quot;{planName || "Chưa đặt tên"}&quot; đã sẵn sàng gửi duyệt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Khi được phê duyệt, bạn có thể gán khóa học và mở lớp đào tạo ngay lập tức.
            </Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
          <Box sx={{ flex: 1, p: 2.25, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Chương trình đào tạo
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {programsCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Số chương trình đã hoàn thiện
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2.25, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Chủ đề đã tạo
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {topicsCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tổng chủ đề trong các chương trình
            </Typography>
          </Box>
        </Stack>

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
            onClick={onContinue}
            disabled={isLoading}
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            Tiếp tục
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
