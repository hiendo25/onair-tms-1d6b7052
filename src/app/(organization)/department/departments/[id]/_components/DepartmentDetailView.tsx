"use client";

import * as React from "react";
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import type { BranchDto } from "@/types/dto/branches";
import type { DepartmentDto } from "@/types/dto/departments";
import type { EmployeeDto } from "@/types/dto/employees";
import { EmployeeStatus } from "@/types/dto/employees/employee.dto";
import { resolveEmployeeStatusColor, resolveEmployeeStatusLabel } from "../../helper";

interface DepartmentDetailViewProps {
  department: DepartmentDto;
  branch?: BranchDto;
  isBranchLoading: boolean;
  branchError: unknown;
  employees: EmployeeDto[];
  employeesTotal: number;
  isEmployeesLoading: boolean;
  employeesError: unknown;
  employeesPage: number;
  employeesPageSize: number;
  onEmployeesPageChange: (page: number) => void;
  onEmployeesPageSizeChange: (pageSize: number) => void;
  breadcrumbs?: { title: string; path?: string }[];
}

type DepartmentEmployeeRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  positionTitle: string;
  branchName: string;
  departmentName: string;
  status: EmployeeStatus;
};

const EMPTY_VALUE = "Chưa cập nhật";
const UNASSIGNED_VALUE = "Chưa gán";

const EMPLOYEE_COLUMNS: TableDataProps<DepartmentEmployeeRow>["columns"] = [
  {
    id: "employeeCode",
    field: "employeeCode",
    headerName: "Mã nhân viên",
  },
  {
    id: "fullName",
    field: "fullName",
    headerName: "Họ và tên",
  },
  {
    id: "email",
    field: "email",
    headerName: "Email",
  },
  {
    id: "positionTitle",
    field: "positionTitle",
    headerName: "Chức danh",
  },
  {
    id: "branchName",
    field: "branchName",
    headerName: "Chi nhánh",
  },
  {
    id: "departmentName",
    field: "departmentName",
    headerName: "Phòng ban",
  },
  {
    id: "status",
    field: "status",
    headerName: "Trạng thái",
    renderCell: (value) => (
      <Chip
        label={resolveEmployeeStatusLabel(value as EmployeeStatus)}
        color={resolveEmployeeStatusColor(value as EmployeeStatus)}
        size="small"
        sx={{ minWidth: 100 }}
      />
    ),
  },
];

const DepartmentDetailView: React.FC<DepartmentDetailViewProps> = ({
  department,
  branch,
  isBranchLoading,
  branchError,
  employees,
  employeesTotal,
  isEmployeesLoading,
  employeesError,
  employeesPage,
  employeesPageSize,
  onEmployeesPageChange,
  onEmployeesPageSizeChange,
  breadcrumbs,
}) => {
  const router = useRouter();
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

  const totalEmployeesLabel = employeesTotal > 0 ? `Tổng số ${employeesTotal} nhân viên` : "Chưa có nhân viên";

  const employeeRows = React.useMemo<DepartmentEmployeeRow[]>(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        employeeCode: employee.employee_code,
        fullName: employee.profiles?.full_name || EMPTY_VALUE,
        email: employee.profiles?.email || EMPTY_VALUE,
        positionTitle: employee.positions?.title || EMPTY_VALUE,
        branchName: employee.employee_branches?.[0]?.branches?.name || EMPTY_VALUE,
        departmentName: employee.employee_departments?.[0]?.departments?.name || department.name,
        status: employee.status,
      })),
    [department.name, employees],
  );

  const handleEmployeeClick = React.useCallback(
    (employee: DepartmentEmployeeRow) => {
      router.push(`/admin/employees/${employee.id}/detail`);
    },
    [router],
  );

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

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Nhân viên thuộc phòng ban
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalEmployeesLabel}
                </Typography>
              </Box>
            </Stack>

            {employeesError ? (
              <Alert severity="error">Có lỗi xảy ra khi tải danh sách nhân viên</Alert>
            ) : (
              <TableData
                rows={employeeRows}
                columns={EMPLOYEE_COLUMNS}
                hoverRow
                loading={isEmployeesLoading}
                onRowClick={handleEmployeeClick}
                pagination={{
                  page: employeesPage,
                  pageSize: employeesPageSize,
                  total: employeesTotal,
                  onChangePage: onEmployeesPageChange,
                  onChangePageSize: onEmployeesPageSizeChange,
                }}
              />
            )}
          </CardContent>
        </Card>
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
