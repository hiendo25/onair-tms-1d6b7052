"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { fDate, FORMAT_DATE_STANDARD } from "@/lib";
import InfoGroupCard from "@/shared/ui/InfoGroupCard";
import PageContainer from "@/shared/ui/PageContainer";
import type { BranchDto } from "@/types/dto/branches";
import type { DepartmentDto } from "@/types/dto/departments";

interface BranchDetailViewProps {
  branch: BranchDto;
  departments: DepartmentDto[];
  departmentsTotal: number;
  isDepartmentsLoading: boolean;
  departmentsError: unknown;
  breadcrumbs?: { title: string; path?: string }[];
}

const EMPTY_VALUE = "Chưa cập nhật";

const BranchDetailView: React.FC<BranchDetailViewProps> = ({
  branch,
  departments,
  departmentsTotal,
  isDepartmentsLoading,
  departmentsError,
  breadcrumbs,
}) => {
  const router = useRouter();

  const createdAt = fDate(branch.created_at, FORMAT_DATE_STANDARD) || EMPTY_VALUE;
  const address = branch.address || EMPTY_VALUE;
  const code = branch.code || EMPTY_VALUE;

  const totalDepartmentsLabel =
    departmentsTotal > 0 ? `Tổng số ${departmentsTotal} phòng ban` : "Chưa có phòng ban";

  const handleDepartmentClick = (departmentId: string) => {
    router.push(PATHS.DEPARTMENTS.DETAIL(departmentId));
  };

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

            {isDepartmentsLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Đang tải danh sách phòng ban...</Typography>
              </Box>
            ) : departmentsError ? (
              <Alert severity="error">Có lỗi xảy ra khi tải danh sách phòng ban</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên phòng ban</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Chưa có phòng ban nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      departments.map((department) => (
                        <TableRow
                          key={department.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleDepartmentClick(department.id)}
                        >
                          <TableCell>{department.name}</TableCell>
                          <TableCell>
                            {fDate(department.created_at, FORMAT_DATE_STANDARD) || EMPTY_VALUE}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default BranchDetailView;
