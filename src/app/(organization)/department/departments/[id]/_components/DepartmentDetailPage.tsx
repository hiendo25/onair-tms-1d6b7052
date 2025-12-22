"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { PATHS } from "@/constants/path.constant";
import { useGetBranchQuery } from "@/modules/branch/operations/query";
import { useGetDepartmentQuery } from "@/modules/department/operations/query";
import { useGetEmployeesQuery } from "@/modules/employees/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import DepartmentDetailView from "./DepartmentDetailView";

interface DepartmentDetailPageProps {
  id: string;
}

const DEFAULT_EMPLOYEE_PAGE = 1;
const DEFAULT_EMPLOYEE_PAGE_SIZE = 10;

const DepartmentDetailPage: React.FC<DepartmentDetailPageProps> = ({ id }) => {
  const { data: department, isLoading, error } = useGetDepartmentQuery(id);
  const branchId = department?.branch_id ?? "";

  const { data: branch, isLoading: isBranchLoading, error: branchError } = useGetBranchQuery(branchId);
  const [employeesPage, setEmployeesPage] = React.useState(DEFAULT_EMPLOYEE_PAGE);
  const [employeesPageSize, setEmployeesPageSize] = React.useState(DEFAULT_EMPLOYEE_PAGE_SIZE);

  const breadcrumbs = React.useMemo(
    () => [
      { title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT },
      { title: department?.name || "Chi tiết" },
    ],
    [department?.name],
  );

  React.useEffect(() => {
    if (!department?.id) return;
    setEmployeesPage(DEFAULT_EMPLOYEE_PAGE);
  }, [department?.id]);

  const employeesParams = React.useMemo(() => {
    if (!department?.id || !department?.organization_id) {
      return null;
    }

    return {
      page: employeesPage - 1,
      limit: employeesPageSize,
      departmentId: department.id,
      organizationId: department.organization_id,
    };
  }, [department?.id, department?.organization_id, employeesPage, employeesPageSize]);

  const handleEmployeesPageChange = React.useCallback((page: number) => {
    setEmployeesPage(page);
  }, []);

  const handleEmployeesPageSizeChange = React.useCallback((pageSize: number) => {
    setEmployeesPageSize(pageSize);
    setEmployeesPage(DEFAULT_EMPLOYEE_PAGE);
  }, []);

  const {
    data: employeesResult,
    isLoading: isEmployeesLoading,
    error: employeesError,
  } = useGetEmployeesQuery(employeesParams ?? undefined, {
    enabled: Boolean(employeesParams),
  });

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
      employees={employeesResult?.data ?? []}
      employeesTotal={employeesResult?.total ?? 0}
      isEmployeesLoading={Boolean(employeesParams) && isEmployeesLoading}
      employeesError={employeesError}
      employeesPage={employeesPage}
      employeesPageSize={employeesPageSize}
      onEmployeesPageChange={handleEmployeesPageChange}
      onEmployeesPageSizeChange={handleEmployeesPageSizeChange}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default DepartmentDetailPage;
