"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PageContainer from "@/shared/ui/PageContainer";
import { useGetEmployeesQuery } from "@/modules/employees/operations/query";
import { useDeleteEmployeeMutation } from "@/modules/employees/operations/mutation";
import { useGetOrganizationUnitsQuery } from "@/modules/organization-units/operations/query";
import type { EmployeeDto } from "@/types/dto/employees";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { Database } from "@/types/supabase.types";

type EmployeeListProps = {
  employeeType?: Database["public"]["Enums"]["employee_type"];
};

export default function EmployeeList({ employeeType = "student" }: EmployeeListProps) {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  // Dynamic page title based on employee type
  const pageTitle = React.useMemo(() => {
    if (employeeType === "teacher") {
      return "Danh sách giảng viên";
    } else if (employeeType === "student") {
      return "Danh sách học viên";
    }
    return "Danh sách nhân viên";
  }, [employeeType]);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [branchFilter, setBranchFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(0);
  }, [departmentFilter]);

  React.useEffect(() => {
    setPage(0);
  }, [branchFilter]);

  React.useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const { data: organizationUnitsResult } = useGetOrganizationUnitsQuery();
  const organizationUnits = organizationUnitsResult?.data || [];

  const departments = React.useMemo(
    () => organizationUnits.filter((unit) => unit.type === "department"),
    [organizationUnits],
  );

  const branches = React.useMemo(
    () => organizationUnits.filter((unit) => unit.type === "branch"),
    [organizationUnits],
  );

  const {
    data: employeesResult,
    isLoading,
    error,
  } = useGetEmployeesQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    departmentId: departmentFilter,
    branchId: branchFilter,
    status: statusFilter !== "all" ? (statusFilter as Database["public"]["Enums"]["employee_status"]) : undefined,
    employeeType,
  });

  const { mutateAsync: deleteEmployee, isPending: isDeleting } = useDeleteEmployeeMutation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const employees = employeesResult?.data || [];
  const totalCount = employeesResult?.total || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateEmployee = () => {
    router.push("/admin/employees/create");
  };

  const handleImportEmployees = () => {
    router.push("/admin/employees/import");
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employeeId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedEmployeeId(employeeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployeeId(null);
  };

  const handleEdit = () => {
    if (selectedEmployeeId) {
      router.push(`/admin/employees/${selectedEmployeeId}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedEmployeeId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa nhân viên này không? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      },
    );

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    try {
      await deleteEmployee(selectedEmployeeId);

      await queryClient.invalidateQueries({ queryKey: ["employees"] });

      notifications.show("Xóa nhân viên thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });

      handleMenuClose();
    } catch (error) {
      console.error("Error deleting employee:", error);
      notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa nhân viên", {
        severity: "error",
        autoHideDuration: 5000,
      });
      handleMenuClose();
    }
  };

  const getDepartmentName = (employee: EmployeeDto) => {
    const dept = employee.employee_departments?.[0];
    return dept?.departments?.name || "-";
  };

  const getBranchName = (employee: EmployeeDto) => {
    const branch = employee.employee_branches?.[0];
    return branch?.branches?.name || "-";
  };

  const getPositionTitle = (employee: EmployeeDto) => {
    return employee.positions?.title || "-";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string): "success" | "default" | "error" => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "error";
    }
  };

  return (
    <PageContainer title={pageTitle} breadcrumbs={[{ title: "Nhân viên", path: "/admin/employees" }]}>
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
              <TextField
                placeholder="Tìm kiếm..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 200 }}
              />

              <Select
                size="small"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                displayEmpty
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Phòng ban</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                displayEmpty
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Chi nhánh</MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Trạng thái</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<FileUploadIcon />} onClick={handleImportEmployees}>
                Import người dùng
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateEmployee}>
                Tạo người dùng
              </Button>
            </Stack>
          </Stack>

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">Có lỗi xảy ra khi tải danh sách nhân viên</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã nhân viên</TableCell>
                      <TableCell>Họ và tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Chức danh</TableCell>
                      <TableCell>Chi nhánh</TableCell>
                      <TableCell>Phòng ban</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy nhân viên nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id} hover sx={{ cursor: "pointer" }}>
                          <TableCell>{employee.employee_code}</TableCell>
                          <TableCell>{employee.profiles?.full_name || "-"}</TableCell>
                          <TableCell>{employee.profiles?.email || "-"}</TableCell>
                          <TableCell>{getPositionTitle(employee)}</TableCell>
                          <TableCell>{getBranchName(employee)}</TableCell>
                          <TableCell>{getDepartmentName(employee)}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(employee.status)}
                              color={getStatusColor(employee.status)}
                              size="small"
                              sx={{ minWidth: 100 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, employee.id)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[12, 25, 50, 100]}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
              />
            </>
          )}

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemText>Chỉnh sửa</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} disabled={isDeleting}>
              <ListItemText>Xóa tài khoản</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Box>
    </PageContainer>
  );
}
