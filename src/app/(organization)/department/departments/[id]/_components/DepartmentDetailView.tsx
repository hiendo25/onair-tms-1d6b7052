"use client";

import * as React from "react";
import { Alert, Box } from "@mui/material";

import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";
import type { BranchDto } from "@/types/dto/branches";
import type { DepartmentDto } from "@/types/dto/departments";

interface DepartmentDetailViewProps {
  department: DepartmentDto;
  branch?: BranchDto;
  isBranchLoading: boolean;
  branchError: unknown;
  breadcrumbs?: { title: string; path?: string }[];
}

const EMPTY_VALUE = "Chưa cập nhật";
const UNASSIGNED_VALUE = "Chưa gán";

const DepartmentDetailView: React.FC<DepartmentDetailViewProps> = ({
  department,
  branch,
  isBranchLoading,
  branchError,
  breadcrumbs,
}) => {
  const createdAt = fDate(department.created_at, FORMAT_DATE_STANDARD) || EMPTY_VALUE;

  const branchName = resolveBranchValue({
    hasBranch: Boolean(department.branch_id),
    isLoading: isBranchLoading,
    value: branch?.name,
  });

  const branchCode = resolveBranchValue({
    hasBranch: Boolean(department.branch_id),
    isLoading: isBranchLoading,
    value: branch?.code,
  });

  return (
    <PageContainer title={department.name} breadcrumbs={breadcrumbs}>
      <Box sx={{ py: 3 }}>
        <InfoGroupCard
          title="Thông tin phòng ban"
          description="Thông tin cơ bản và chi nhánh liên kết."
          items={[
            { label: "Tên phòng ban", value: department.name },
            { label: "Ngày tạo", value: createdAt },
            { label: "Chi nhánh", value: branchName },
            { label: "Mã chi nhánh", value: branchCode },
          ]}
        />

        {branchError ? (
          <Alert severity="warning">Không thể tải thông tin chi nhánh liên kết.</Alert>
        ) : null}
      </Box>
    </PageContainer>
  );
};

export default DepartmentDetailView;

function resolveBranchValue({
  hasBranch,
  isLoading,
  value,
}: {
  hasBranch: boolean;
  isLoading: boolean;
  value: string | undefined;
}) {
  if (!hasBranch) {
    return UNASSIGNED_VALUE;
  }

  if (isLoading) {
    return "Đang tải...";
  }

  return value || EMPTY_VALUE;
}
