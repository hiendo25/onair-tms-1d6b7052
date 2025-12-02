"use client";

import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { formatCurrencyV2 } from "@/utils/format-number";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";

interface PlanInfoCardsProps {
  budget: number | null;
  approver: string | null;
  createdAt: string | null;
  objective: string | null;
}

export default function PlanInfoCards({
  budget,
  approver,
  createdAt,
  objective,
}: PlanInfoCardsProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {/* Budget and Approver Row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Budget */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AttachMoneyIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Ngân sách dự kiến
              </Typography>
              {budget ? (
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatCurrencyV2(budget)}
                </Typography>
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  —
                </Typography>
              )}
            </Box>
          </Box>

          {/* Approver */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: "#fce4ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon sx={{ color: "#c2185b", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Người phê duyệt
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {approver ?? "Chưa xác định"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Date Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: "#e3f2fd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarTodayIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Ngày tạo
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {fDateTime(createdAt,FORMAT_DATE_TIME_CLEANER) ?? "Chưa xác định"}
            </Typography>
          </Box>
        </Box>

        {/* Objective Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: "#f3e5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentIcon sx={{ color: "#7b1fa2", fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Mục tiêu hội nhập
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {objective ?? "Chưa cập nhật"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
