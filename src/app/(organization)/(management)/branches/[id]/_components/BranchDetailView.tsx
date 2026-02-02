"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import type { BranchDto } from "@/types/dto/branches";
import type { DepartmentDto } from "@/types/dto/departments";

interface BranchDetailViewProps {
  branch: BranchDto;
  departments: DepartmentDto[];
  departmentsTotal: number;
  isDepartmentsLoading: boolean;
  departmentsError: unknown;
  departmentsPage: number;
  departmentsPageSize: number;
  onDepartmentsPageChange: (page: number) => void;
  onDepartmentsPageSizeChange: (pageSize: number) => void;
  breadcrumbs?: { title: string; path?: string }[];
}

const EMPTY_VALUE = "Chưa cập nhật";
const DEPARTMENT_COLUMNS: TableDataProps<DepartmentDto>["columns"] = [
  {
    id: "name",
    field: "name",
    headerName: "Tên phòng ban",
  },
  {
    id: "created_at",
    field: "created_at",
    headerName: "Ngày tạo",
    renderCell: (value) => fDate(value as string, FORMAT_DATE_STANDARD) || EMPTY_VALUE,
  },
];

const BranchDetailView: React.FC<BranchDetailViewProps> = ({
  branch,
  departments,
  departmentsTotal,
  isDepartmentsLoading,
  departmentsError,
  departmentsPage,
  departmentsPageSize,
  onDepartmentsPageChange,
  onDepartmentsPageSizeChange,
  breadcrumbs,
}) => {
  const router = useRouter();

  const createdAt = fDate(branch.created_at, FORMAT_DATE_STANDARD) || EMPTY_VALUE;
  const address = branch.address || EMPTY_VALUE;
  const code = branch.code || EMPTY_VALUE;

  const totalDepartmentsLabel =
    departmentsTotal > 0 ? `Tổng số ${departmentsTotal} phòng ban` : "Chưa có phòng ban";

  const handleDepartmentClick = React.useCallback(
    (department: DepartmentDto) => {
      router.push(PATHS.DEPARTMENTS.DETAIL(department.id));
    },
    [router],
  );

  return (
    <PageContainer title={branch.name} breadcrumbs={breadcrumbs}>
      <Box sx={{ py: 3 }}>
        <InfoGroupCard
          title="Thông tin chi nhánh"
          description="Thông tin cơ bản và mã định danh chi nhánh."
          items={[
            { label: "Tên chi nhánh", value: branch.name },
            { label: "Mã chi nhánh", value: code },
            { label: "Địa điểm", value: address },
            { label: "Ngày tạo", value: createdAt },
          ]}
        />

        <Card sx={{ mb: 3 }}>
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
                  Phòng ban thuộc chi nhánh
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalDepartmentsLabel}
                </Typography>
              </Box>
            </Stack>

            {departmentsError ? (
              <Alert severity="error">Có lỗi xảy ra khi tải danh sách phòng ban</Alert>
            ) : (
              <TableData
                rows={departments}
                columns={DEPARTMENT_COLUMNS}
                hoverRow
                loading={isDepartmentsLoading}
                onRowClick={handleDepartmentClick}
                pagination={{
                  page: departmentsPage,
                  pageSize: departmentsPageSize,
                  total: departmentsTotal,
                  onChangePage: onDepartmentsPageChange,
                  onChangePageSize: onDepartmentsPageSizeChange,
                }}
              />
            )}
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default BranchDetailView;
