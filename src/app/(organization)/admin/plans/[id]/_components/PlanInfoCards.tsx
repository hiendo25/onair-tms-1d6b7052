"use client";

import * as React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { PlanStatus } from "@/model/plan.model";
import { formatCurrencyV2 } from "@/utils/format-number";
import { getStatusColor, getStatusLabel } from "../../helper";

interface PlanInfoCardsProps {
  budget: number | null;
  approver: string | null;
  createdAt: string | null;
  objective: string | null;
  status: PlanStatus;
}

interface InfoTileProps {
  icon: typeof AttachMoneyIcon;
  label: string;
  value: string;
  helper?: string;
  tone: "success" | "info" | "warning" | "default" | "error";
}

const toneStyle = {
  success: { bg: "success.50", icon: "#2e7d32" },
  info: { bg: "#e3f2fd", icon: "#1976d2" },
  warning: { bg: "#fff3e0", icon: "#f57c00" },
  error: { bg: "#ffebee", icon: "#c62828" },
  default: { bg: "#f3e5f5", icon: "#7b1fa2" },
};

function InfoTile({ icon: Icon, label, value, helper, tone }: InfoTileProps) {
  const toneColor = toneStyle[tone];
  const isLongValue = value.length > 48;

  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: toneColor.bg,
        display: "flex",
        gap: 1.75,
        alignItems: "flex-start",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: "common.white",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Icon sx={{ color: toneColor.icon, fontSize: 26 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
          {label}
        </Typography>
        <Tooltip
          title={value}
          arrow
          placement="left"
          disableHoverListener={!isLongValue}
          disableFocusListener={!isLongValue}
          disableTouchListener={!isLongValue}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, lineHeight: 1.3, overflowWrap: "anywhere" }}
            className="line-clamp-2"
          >
            {value}
          </Typography>
        </Tooltip>
        {helper && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
            {helper}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function PlanInfoCards({ budget, approver, createdAt, objective, status }: PlanInfoCardsProps) {
  const statusTone = getStatusColor(status);
  const statusHelper =
    status === "approved"
      ? "Đã duyệt, có thể triển khai"
      : status === "pending_survey"
      ? "Cần hoàn thành khảo sát trước khi xây dựng các bước tiếp theo"
      : status === "rejected"
      ? "Cần chỉnh sửa và gửi duyệt lại"
      : "Đang chờ duyệt kế hoạch";

  const infoTiles: InfoTileProps[] = [
    {
      icon: CheckCircleOutlineIcon,
      label: "Trạng thái",
      value: getStatusLabel(status),
      helper: statusHelper,
      tone: statusTone,
    },
    {
      icon: AttachMoneyIcon,
      label: "Ngân sách dự kiến",
      value: budget ? formatCurrencyV2(budget) : "—",
      helper: "Theo kế hoạch",
      tone: "success",
    },
    {
      icon: PersonIcon,
      label: "Người phê duyệt",
      value: approver ?? "Chưa xác định",
      helper: "Người chịu trách nhiệm duyệt kế hoạch",
      tone: "info",
    },
    {
      icon: CalendarTodayIcon,
      label: "Ngày tạo",
      value: fDateTime(createdAt, FORMAT_DATE_TIME_CLEANER) ?? "Chưa xác định",
      helper: "Thời điểm khởi tạo kế hoạch",
      tone: "warning",
    },
    {
      icon: AssignmentIcon,
      label: "Mục tiêu hội nhập",
      value: objective ?? "Chưa cập nhật",
      helper: "Tóm tắt mục tiêu chính",
      tone: "default",
    },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: { xs: 1.5, sm: 2 },
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thông tin chung
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các thông tin chính về ngân sách, người phê duyệt và mục tiêu.
            </Typography>
          </Box>
          <Chip
            label="Cập nhật mới nhất"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        </Box>

        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(220px, 1fr))",
              md: "repeat(auto-fit, minmax(240px, 1fr))",
            },
            gap: 2,
          }}
        >
          {infoTiles.map((tile) => (
            <InfoTile key={tile.label} {...tile} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
