"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import BranchDetailView from "./BranchDetailView";

interface BranchDetailPageProps {
  id: string;
}

const DEFAULT_DEPARTMENT_PAGE = 1;
const DEFAULT_DEPARTMENT_PAGE_SIZE = 10;

const BranchDetailPage: React.FC<BranchDetailPageProps> = ({ id }) => {
  const [departmentsPage, setDepartmentsPage] = React.useState(DEFAULT_DEPARTMENT_PAGE);
  const [departmentsPageSize, setDepartmentsPageSize] = React.useState(DEFAULT_DEPARTMENT_PAGE_SIZE);

  React.useEffect(() => {
    if (!branch?.id) return;
    setDepartmentsPage(DEFAULT_DEPARTMENT_PAGE);
  }, [branch?.id]);

  const departmentsParams = React.useMemo(() => {
    if (!branch?.organization_id || !branch?.id) {
      return null;
    }

    return {
      page: departmentsPage - 1,
      limit: departmentsPageSize,
      organizationId: branch.organization_id,
      branchId: branch.id,
    };
  }, [branch?.organization_id, branch?.id, departmentsPage, departmentsPageSize]);

  const handleDepartmentsPageChange = React.useCallback((page: number) => {
    setDepartmentsPage(page);
  }, []);

  const handleDepartmentsPageSizeChange = React.useCallback((pageSize: number) => {
    setDepartmentsPageSize(pageSize);
    setDepartmentsPage(DEFAULT_DEPARTMENT_PAGE);
  }, []);

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
      departmentsPage={departmentsPage}
      departmentsPageSize={departmentsPageSize}
      onDepartmentsPageChange={handleDepartmentsPageChange}
      onDepartmentsPageSizeChange={handleDepartmentsPageSizeChange}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default BranchDetailPage;
