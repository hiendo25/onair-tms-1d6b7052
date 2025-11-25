"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PATHS } from "@/constants/path.contstants";

interface PlanHeaderProps {
  planName: string;
  status: "pending" | "approved" | "rejected";
}

const getStatusLabel = (status: "pending" | "approved" | "rejected"): string => {
  switch (status) {
    case "pending":
      return "Chờ duyệt";
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
  }
};

const getStatusColor = (
  status: "pending" | "approved" | "rejected"
): "warning" | "success" | "error" => {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
      return "error";
  }
};

export default function PlanHeader({ planName, status }: PlanHeaderProps) {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
      <IconButton onClick={() => router.push(PATHS.PLANS.ROOT)} size="small">
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5" sx={{ flex: 1 }}>
        {planName}
      </Typography>
      <Chip
        label={getStatusLabel(status)}
        color={getStatusColor(status)}
        sx={{ fontSize: "0.875rem", fontWeight: 500 }}
      />
    </Box>
  );
}

