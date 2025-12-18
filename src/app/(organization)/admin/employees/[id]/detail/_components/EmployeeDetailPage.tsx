"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

import { useGetEmployeeQuery } from "@/modules/employees/operations/query";
import { useGetRoleList } from "@/modules/roles/operations/query";
import PageContainer from "@/shared/ui/PageContainer";

import EmployeeDetailView from "./EmployeeDetailView";

interface EmployeeDetailPageProps {
  id: string;
}

const EmployeeDetailPage: React.FC<EmployeeDetailPageProps> = ({ id }) => {
  const { data: employee, isLoading, error } = useGetEmployeeQuery(id);
  const managerId = employee?.managers_employees?.[0]?.manager_id ?? "";
  const { data: managerData, isLoading: isLoadingManager } = useGetEmployeeQuery(managerId);

  const roleIds = employee?.role_ids || [];
  const shouldFetchRoles = roleIds.length > 0;
  const { data: roleList } = useGetRoleList({ ids: roleIds });

  const roleTitles = React.useMemo(
    () => (shouldFetchRoles ? roleList || [] : []).map((role) => role.title || role.code || role.id),
    [roleList, shouldFetchRoles],
  );

  const pageTitle = employee?.profiles?.full_name || "Chi tiết nhân viên";
  const breadcrumbs = React.useMemo(
    () => [
      { title: "Nhân viên", path: "/admin/employees" },
      { title: pageTitle },
    ],
    [pageTitle],
  );

  if (isLoading) {
    return (
      <PageContainer title="Đang tải nhân viên" breadcrumbs={breadcrumbs}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 3 }}>
          <CircularProgress size={24} />
          <Typography>Đang tải dữ liệu nhân viên...</Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error || !employee) {
    return (
      <PageContainer title="Không tìm thấy nhân viên" breadcrumbs={breadcrumbs}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : "Không tìm thấy thông tin nhân viên"}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <EmployeeDetailView
      employee={employee}
      roleTitles={roleTitles}
      managerName={managerData?.profiles?.full_name}
      isManagerLoading={Boolean(managerId) && isLoadingManager}
      breadcrumbs={breadcrumbs}
    />
  );
};

export default EmployeeDetailPage;
