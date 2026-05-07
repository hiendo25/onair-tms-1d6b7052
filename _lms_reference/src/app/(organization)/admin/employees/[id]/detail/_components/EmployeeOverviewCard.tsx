"use client";

import * as React from "react";
import { Avatar, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import type { EmployeeDto } from "@/types/dto/employees";
import { getEmployeeTypeLabel } from "@/utils/employee-type";

interface EmployeeOverviewCardProps {
  employee: EmployeeDto;
}

const EmployeeOverviewCard: React.FC<EmployeeOverviewCardProps> = ({ employee }) => {
  const fullName = employee.profiles?.full_name || "Chưa cập nhật";
  const avatar = employee.profiles?.avatar || undefined;
  const email = employee.profiles?.email || "Chưa có email";
  const phone = employee.profiles?.phone_number || "Chưa cập nhật";

  const startDate = employee.start_date ? fDate(employee.start_date, FORMAT_DATE_STANDARD) : "Chưa cập nhật";
  const positionTitle = employee.positions?.title || "Chưa cập nhật";

  const statusLabel = employee.status === "active" ? "Hoạt động" : "Không hoạt động";
  const statusColor: "success" | "default" | "error" =
    employee.status === "active" ? "success" : employee.status === "inactive" ? "default" : "error";

  return (
    <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatar || undefined} alt={fullName} sx={{ width: 72, height: 72, fontWeight: 700 }}>
            </Avatar>
            <Stack spacing={0.75}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {fullName}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                <Chip label={statusLabel} color={statusColor} size="small" />
                <Chip label={getEmployeeTypeLabel(employee.employee_type)} color="primary" variant="outlined" size="small" />
                <Chip
                  label={`MSNV: ${employee.employee_code || "—"}`}
                  color="default"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Chức danh: <strong>{positionTitle}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ngày bắt đầu: <strong>{startDate}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">Email: {email}</Typography>
              <Typography variant="body2" color="text.secondary">Số điện thoại: {phone}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EmployeeOverviewCard;
