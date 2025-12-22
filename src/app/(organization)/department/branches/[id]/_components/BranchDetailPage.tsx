"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { useGetBranchQuery } from "@/modules/branch/operations/query";
import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import BranchDetailView from "./BranchDetailView";

interface BranchDetailPageProps {
  id: string;
}

const DEPARTMENT_PREVIEW_LIMIT = 6;

const BranchDetailPage: React.FC<BranchDetailPageProps> = ({ id }) => {
  const { data: branch, isLoading, error } = useGetBranchQuery(id);

  const breadcrumbs = React.useMemo(
    () => [
      { title: "Chi nhánh", path: PATHS.BRANCHES.ROOT },
      { title: branch?.name || "Chi tiết" },
    ],
    [branch?.name],
  );

  const departmentsParams = React.useMemo(() => {
    if (!branch?.organization_id || !branch?.id) {
      return null;
    }

    return {
      page: 0,
      limit: DEPARTMENT_PREVIEW_LIMIT,
      organizationId: branch.organization_id,
      branchId: branch.id,
    };
  }, [branch?.organization_id, branch?.id]);

  const {
    data: departmentsResult,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useGetDepartmentsQuery(departmentsParams ?? undefined, {
    enabled: Boolean(departmentsParams),
  });

  if (isLoading) {
    return (
      <PageContainer title="Đang tải chi nhánh" breadcrumbs={breadcrumbs}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu chi nhánh...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error || !branch) {
    return (
      <PageContainer title="Không tìm thấy chi nhánh" breadcrumbs={breadcrumbs}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : "Không tìm thấy thông tin chi nhánh"}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <BranchDetailView
      branch={branch}
      departments={departmentsResult?.data ?? []}
      departmentsTotal={departmentsResult?.total ?? 0}
      isDepartmentsLoading={Boolean(departmentsParams) && isDepartmentsLoading}
      departmentsError={departmentsError}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default BranchDetailPage;
