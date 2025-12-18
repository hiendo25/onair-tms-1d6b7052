"use client";

import * as React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import ReplayIcon from "@mui/icons-material/Replay";
import { Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { PlanStatus } from "@/model/plan.model";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { usePermissions } from "@/modules/permission-wrapper";
import { useUpdatePlanStatusMutation } from "@/modules/plans/operations/mutation";
import { getStatusColor, getStatusLabel } from "../../helper";

interface PlanApprovalActionsProps {
  planId: string;
  planName: string;
  status: PlanStatus;
  approver?: string | null;
}

const statusCopy: Record<PlanStatus, { headline: string; description: string }> = {
  pending: {
    headline: "Chờ quyết định",
    description: "Rà soát thông tin kế hoạch trước khi đưa ra quyết định phê duyệt.",
  },
  pending_survey: {
    headline: "Chờ kết quả khảo sát",
    description: "Đợi khảo sát hoàn tất hoặc đánh giá lại nội dung trước khi duyệt.",
  },
  approved: {
    headline: "Kế hoạch đã được duyệt",
    description: "Kế hoạch đã sẵn sàng triển khai.",
  },
  rejected: {
    headline: "Kế hoạch bị từ chối",
    description: "Yêu cầu cập nhật hoặc bổ sung thông tin rồi duyệt lại khi phù hợp.",
  },
  deleted: {
    headline: "Kế hoạch đã bị xóa",
    description: "Không thể thực hiện thao tác duyệt với kế hoạch này.",
  },
};

export default function PlanApprovalActions({ planId, planName, status, approver }: PlanApprovalActionsProps) {
  const { hasPermissions } = usePermissions();
  const { id: userId, employeeType } = useUserOrganization((state) => state.data);
  const notifications = useNotifications();
  const dialogs = useDialogs();
  const { mutateAsync: updatePlanStatus, isPending: isUpdating } = useUpdatePlanStatusMutation();

  const canModerate = employeeType === "admin" && hasPermissions([{ $or: "plan:update" }]);
  const isDeleted = status === "deleted";
  const isPendingStatus = status === "pending";
  const isPendingSurvey = status === "pending_survey";
  const canReset = status === "approved" || status === "rejected";
  const canDecide = isPendingStatus;

  const copy = statusCopy[status] || statusCopy.pending;
  const tone = getStatusColor(status);
  const showReset = canReset;

  if (!canModerate) return null;

  const handleChangeStatus = async (nextStatus: PlanStatus) => {
    if (nextStatus === status || isDeleted) return;

    if (isPendingSurvey) {
      notifications.show("Kế hoạch đang chờ khảo sát, hoàn thành khảo sát trước khi duyệt.", { severity: "warning" });
      return;
    }

    if (!isPendingStatus && (nextStatus === "approved" || nextStatus === "rejected")) {
      notifications.show("Chỉ duyệt kế hoạch khi đang ở trạng thái 'Chờ duyệt'.", { severity: "warning" });
      return;
    }

    const nextAction =
      nextStatus === "approved"
        ? "duyệt"
        : nextStatus === "rejected"
          ? "từ chối"
          : "đưa về chờ duyệt";

    const confirmed = await dialogs.confirm(`Bạn muốn ${nextAction} kế hoạch "${planName}"?`, {
      title: "Xác nhận duyệt kế hoạch",
      okText: "Đồng ý",
      cancelText: "Hủy",
      severity: nextStatus === "rejected" ? "error" : "info",
    });

    if (!confirmed) return;

    try {
      await updatePlanStatus({
        id: planId,
        status: nextStatus,
        approverId: nextStatus === "approved" || nextStatus === "rejected" ? userId : null,
      });
      const successMessage =
        nextStatus === "approved"
          ? "Đã duyệt kế hoạch thành công."
          : nextStatus === "rejected"
            ? "Đã từ chối kế hoạch."
            : "Đã cập nhật trạng thái chờ duyệt.";
      notifications.show(successMessage, { severity: "success" });
    } catch (error: any) {
      notifications.show(error?.message || "Không thể cập nhật trạng thái kế hoạch.", { severity: "error" });
    }
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} sx={{ mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.6 }}>
              Phê duyệt kế hoạch
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {copy.headline}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {copy.description}{" "}
              {isPendingSurvey
                ? "Hoàn thành khảo sát trước khi thực hiện phê duyệt."
                : approver && status === "approved"
                  ? `Người duyệt: ${approver}.`
                  : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Chỉ admin có quyền duyệt hoặc từ chối kế hoạch này.
            </Typography>
          </Box>
          <Chip label={getStatusLabel(status)} color={tone} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
            <CheckCircleOutlineIcon fontSize="small" />
            <Typography variant="body2">
              Quyết định sẽ cập nhật trạng thái kế hoạch và người duyệt.
            </Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon fontSize="small" />}
              disabled={!canDecide || isUpdating || isDeleted}
              onClick={() => handleChangeStatus("approved")}
            >
              Duyệt kế hoạch
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<GppMaybeIcon fontSize="small" />}
              disabled={!canDecide || isUpdating || isDeleted}
              onClick={() => handleChangeStatus("rejected")}
            >
              Từ chối
            </Button>
            {showReset && (
              <Button
                variant="text"
                startIcon={<ReplayIcon fontSize="small" />}
                disabled={isUpdating || isDeleted}
                onClick={() => handleChangeStatus("pending")}
              >
                Đưa về chờ duyệt
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
