"use client";

import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { useWatch } from "react-hook-form";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { usePlanFormContext } from "@/modules/plans/use-plan-form-context";
import { PlanStatus } from "@/model/plan.model";
import { getStatusColor, getStatusLabel } from "../../helper";

interface StepApprovalProps {
  onBack: () => void;
  onContinue?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  status: PlanStatus;
}

export default function StepApproval({
  onBack,
  onContinue,
  onSubmit,
  isLoading = false,
  status,
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

  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const primaryAction = isApproved ? onContinue : onSubmit;
  const primaryLabel = isApproved
    ? "Tiếp tục gán môn học"
    : isRejected
      ? "Gửi duyệt lại"
      : "Lưu & gửi duyệt";

  const tone = getStatusColor(status);
  const tonePalette = {
    success: { bg: "success.50", border: "success.100", icon: "success.main" },
    warning: { bg: "warning.50", border: "warning.100", icon: "warning.dark" },
    error: { bg: "error.50", border: "error.100", icon: "error.main" },
  }[tone] ?? { bg: "grey.50", border: "divider", icon: "text.primary" };

  const statusDescription = isApproved
    ? "Kế hoạch đã được phê duyệt, bạn có thể gán môn học ở bước tiếp theo."
    : isRejected
      ? "Kế hoạch đang bị từ chối, hãy cập nhật thông tin và gửi duyệt lại. Chỉ khi được duyệt mới gán môn học."
      : "Kế hoạch đang chờ duyệt. Lưu kế hoạch để gửi duyệt và chờ phê duyệt trước khi gán môn học.";

  const statusHeadline = isApproved
    ? `Kế hoạch "${planName || "Chưa đặt tên"}" đã được duyệt`
    : isRejected
      ? `Kế hoạch "${planName || "Chưa đặt tên"}" cần gửi duyệt lại`
      : `Kế hoạch "${planName || "Chưa đặt tên"}" đã sẵn sàng gửi duyệt`;

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
          <Chip label={getStatusLabel(status)} color={tone} variant="outlined" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2.75,
            borderRadius: 2,
            bgcolor: tonePalette.bg,
            border: "1px solid",
            borderColor: tonePalette.border,
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            boxShadow: "0 12px 26px rgba(0,0,0,0.05)",
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: tonePalette.icon, mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ mb: 0.5, color: tonePalette.icon, fontWeight: 700 }}
            >
              {statusHeadline}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {statusDescription}
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

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={isLoading}
          >
            Quay lại
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {!isApproved && (
              <Typography variant="body2" color="text.secondary">
                Chỉ khi kế hoạch được duyệt mới gán môn học ở bước 5.
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={primaryAction}
              disabled={isLoading || !primaryAction}
              endIcon={isApproved ? <ArrowForwardIcon fontSize="small" /> : undefined}
            >
              {primaryLabel}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
