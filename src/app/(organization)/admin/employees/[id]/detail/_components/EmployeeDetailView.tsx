"use client";

import * as React from "react";
import { Box, Chip, Stack } from "@mui/material";

import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import PageContainer from "@/shared/ui/PageContainer";
import { EmployeeDto } from "@/types/dto/employees";
import { getEmployeeTypeLabel } from "@/utils/employee-type";

import EmployeeOverviewCard from "./EmployeeOverviewCard";
import InfoGroupCard from "./InfoGroupCard";

interface EmployeeDetailViewProps {
  employee: EmployeeDto;
  roleTitles: string[];
  managerName?: string;
  isManagerLoading?: boolean;
  breadcrumbs?: { title: string; path?: string }[];
}

const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  roleTitles,
  managerName,
  isManagerLoading,
  breadcrumbs,
}) => {
  const fullName = employee.profiles?.full_name || "Chi tiết nhân viên";
  const branchName = getEmploymentName(employee, "branch");
  const departmentName = getEmploymentName(employee, "department");

  const genderLabel = employee.profiles?.gender === "male" ? "Nam" : employee.profiles?.gender === "female" ? "Nữ" : "Khác";
  const birthday = fDate(employee.profiles?.birthday, FORMAT_DATE_STANDARD);
  const startDate = fDate(employee.start_date, FORMAT_DATE_STANDARD);
  const createdAt = fDate(employee.created_at, FORMAT_DATE_STANDARD);
  const managerDisplay = isManagerLoading ? "Đang tải..." : managerName || "Chưa cập nhật";

  const statusLabel = employee.status === "active" ? "Hoạt động" : "Không hoạt động";

  const roleContent =
    roleTitles.length > 0 ? (
      <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
        {roleTitles.map((title) => (
          <Chip key={title} label={title} size="small" variant="outlined" color="primary" />
        ))}
      </Stack>
    ) : (
      "Chưa gán vai trò"
    );

  return (
    <PageContainer title={fullName} breadcrumbs={breadcrumbs}>
      <Box sx={{ py: 3 }}>
        <EmployeeOverviewCard employee={employee} />

        <InfoGroupCard
          title="Thông tin cá nhân"
          description="Thông tin liên lạc và nhân khẩu học của nhân viên."
          items={[
            { label: "Email", value: employee.profiles?.email || "Chưa có email" },
            { label: "Số điện thoại", value: employee.profiles?.phone_number || "Chưa cập nhật" },
            { label: "Giới tính", value: genderLabel },
            { label: "Ngày sinh", value: birthday },
          ]}
        />

        <InfoGroupCard
          title="Thông tin công việc"
          description="Vai trò, mã nhân viên và quản lý trực tiếp."
          items={[
            { label: "Mã nhân viên", value: employee.employee_code || "Chưa cập nhật" },
            { label: "Loại nhân viên", value: getEmployeeTypeLabel(employee.employee_type) },
            { label: "Chức danh", value: employee.positions?.title || "Chưa cập nhật" },
            { label: "Ngày bắt đầu", value: startDate },
            { label: "Trạng thái", value: statusLabel },
            { label: "Quản lý trực tiếp", value: managerDisplay },
            { label: "Vai trò hệ thống", value: roleContent },
          ]}
        />

        <InfoGroupCard
          title="Đơn vị công tác"
          description="Các đơn vị tổ chức mà nhân viên đang thuộc."
          items={[
            { label: "Chi nhánh", value: branchName },
            { label: "Phòng ban", value: departmentName },
            { label: "Ngày tạo tài khoản", value: createdAt },
          ]}
        />
      </Box>
    </PageContainer>
  );
};

export default EmployeeDetailView;

function getEmploymentName(employee: EmployeeDto, type: "branch" | "department") {
  if (type === "branch") {
    const branch = employee.employee_branches?.[0];
    return branch?.branches?.name || "Chưa cập nhật";
  }

  const department = employee.employee_departments?.[0];
  return department?.departments?.name || "Chưa cập nhật";
}