"use client";

import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";

interface PlanInfoCardsProps {
  budget: number;
  approver: string;
  startDate: string;
  objective: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function PlanInfoCards({
  budget,
  approver,
  startDate,
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(budget)}
              </Typography>
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
                {approver}
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
              {startDate}
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
              {objective}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

