"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { useGetBranchQuery } from "@/modules/branch/operations/query";
import { useGetDepartmentQuery } from "@/modules/department/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentDetailView from "./DepartmentDetailView";

interface DepartmentDetailPageProps {
  id: string;
}

const DepartmentDetailPage: React.FC<DepartmentDetailPageProps> = ({ id }) => {
  const { data: department, isLoading, error } = useGetDepartmentQuery(id);
  const branchId = department?.branch_id ?? "";

  const { data: branch, isLoading: isBranchLoading, error: branchError } = useGetBranchQuery(branchId);

  const breadcrumbs = React.useMemo(
    () => [
      { title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT },
      { title: department?.name || "Chi tiết" },
    ],
    [department?.name],
  );

  if (isLoading) {
    return (
      <PageContainer title="Đang tải phòng ban" breadcrumbs={breadcrumbs}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu phòng ban...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error || !department) {
    return (
      <PageContainer title="Không tìm thấy phòng ban" breadcrumbs={breadcrumbs}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : "Không tìm thấy thông tin phòng ban"}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <DepartmentDetailView
      department={department}
      branch={branch ?? undefined}
      isBranchLoading={Boolean(branchId) && isBranchLoading}
      branchError={branchError}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default DepartmentDetailPage;
