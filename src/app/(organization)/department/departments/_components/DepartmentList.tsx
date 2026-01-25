"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
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
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { DepartmentDialog } from "@/modules/department/components/DepartmentDialog";
import { ImportDepartmentDialog } from "@/modules/department/components/ImportDepartmentDialog";
import { useDeleteDepartmentMutation } from "@/modules/department/operations/mutation";
import { useGetDepartmentsQuery } from "@/modules/department/operations/query";
import PageContainer from "@/shared/ui/PageContainer";
import type { DepartmentDto } from "@/types/dto/departments";

export default function DepartmentList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const { organizationId, isLoading: isLoadingOrgId } = useOrganizationId();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState<DepartmentDto | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: departmentsResult,
    isLoading,
    error,
  } = useGetDepartmentsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    organizationId: organizationId!,
  }, {
    enabled: !!organizationId,
  });

  const { mutateAsync: deleteDepartment, isPending: isDeleting } = useDeleteDepartmentMutation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const departments = departmentsResult?.data || [];
  const totalCount = departmentsResult?.total || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setCreateDialogOpen(true);
  };

  const handleImportDepartments = () => {
    setImportDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, department: DepartmentDto) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDepartmentId(department.id);
    setSelectedDepartment(department);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDepartmentId(null);
  };

  const handleEdit = () => {
    if (selectedDepartment) {
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDetail = () => {
    if (!selectedDepartmentId) return;
    router.push(PATHS.DEPARTMENTS.DETAIL(selectedDepartmentId));
    handleMenuClose();
  };

  const handleRowClick = (departmentId: string) => {
    router.push(PATHS.DEPARTMENTS.DETAIL(departmentId));
  };

  const handleDelete = async () => {
    if (!selectedDepartmentId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa phòng ban này không? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      }
    );

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    try {
      await deleteDepartment(selectedDepartmentId);

      await queryClient.invalidateQueries({ queryKey: ["departments"] });

      notifications.show("Xóa phòng ban thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });

      handleMenuClose();
    } catch (error) {
      console.error("Error deleting department:", error);
      notifications.show(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa phòng ban",
        {
          severity: "error",
          autoHideDuration: 5000,
        }
      );
      handleMenuClose();
    }
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setImportDialogOpen(false);
    setSelectedDepartment(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["departments"] });
    handleDialogClose();
  };

  return (
    <PageContainer
      title="Quản lý Phòng ban"
      breadcrumbs={[{ title: "Phòng ban", path: PATHS.DEPARTMENTS.ROOT }]}
    >
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
                sx={{ maxWidth: 300 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={handleImportDepartments}
                disabled={!organizationId || isLoadingOrgId}
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateDepartment}
                disabled={!organizationId || isLoadingOrgId}
              >
                Tạo phòng ban
              </Button>
            </Stack>
          </Stack>

          {(isLoading || isLoadingOrgId) ? (
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
            <Alert severity="error">Có lỗi xảy ra khi tải danh sách phòng ban</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên phòng ban</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy phòng ban nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      departments.map((department) => (
                        <TableRow
                          key={department.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRowClick(department.id)}
                        >
                          <TableCell>{department.name}</TableCell>
                          <TableCell>
                            {new Date(department.created_at).toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, department)}
                            >
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
            <MenuItem onClick={handleDetail}>
              <ListItemText>Chi tiết</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <ListItemText>Chỉnh sửa</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} disabled={isDeleting}>
              <ListItemText>Xóa</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Box>

      <DepartmentDialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />

      <DepartmentDialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        department={selectedDepartment}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />

      <ImportDepartmentDialog
        open={importDialogOpen}
        onClose={handleDialogClose}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
}
