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
import { BranchDialog } from "@/modules/branch/components/BranchDialog";
import { ImportBranchDialog } from "@/modules/branch/components/ImportBranchDialog";
import { useDeleteBranchMutation } from "@/modules/branch/operations/mutation";
import { useGetBranchesQuery } from "@/modules/branch/operations/query";
import type { BranchDto } from "@/types/dto/branches";

export default function BranchList() {
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
  const [selectedBranch, setSelectedBranch] = React.useState<BranchDto | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: branchesResult,
    isLoading,
    error,
  } = useGetBranchesQuery(
    {
      page,
      limit: rowsPerPage,
      search: debouncedSearch,
      organizationId: organizationId!,
    },
    {
      enabled: !!organizationId,
    },
  );

  const { mutateAsync: deleteBranch, isPending: isDeleting } = useDeleteBranchMutation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const branches = branchesResult?.data || [];
  const totalCount = branchesResult?.total || 0;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateBranch = () => {
    setSelectedBranch(null);
    setCreateDialogOpen(true);
  };

  const handleImportBranches = () => {
    setImportDialogOpen(true);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, branch: BranchDto) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedBranchId(branch.id);
    setSelectedBranch(branch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBranchId(null);
  };

  const handleEdit = () => {
    if (selectedBranch) {
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDetail = () => {
    if (!selectedBranchId) return;
    router.push(PATHS.BRANCHES.DETAIL(selectedBranchId));
    handleMenuClose();
  };

  const handleRowClick = (branchId: string) => {
    router.push(PATHS.BRANCHES.DETAIL(branchId));
  };

  const handleDelete = async () => {
    if (!selectedBranchId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa chi nhánh này không? Hành động này không thể hoàn tác.",
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
      await deleteBranch(selectedBranchId);

      await queryClient.invalidateQueries({ queryKey: ["branches"] });

      notifications.show("Xóa chi nhánh thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });

      handleMenuClose();
    } catch (error) {
      console.error("Error deleting branch:", error);
      notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa chi nhánh", {
        severity: "error",
        autoHideDuration: 5000,
      });
      handleMenuClose();
    }
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setImportDialogOpen(false);
    setSelectedBranch(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    handleDialogClose();
  };

  return (
    <>
      <Box sx={{ py: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
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

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              onClick={handleImportBranches}
              disabled={!organizationId || isLoadingOrgId}
            >
              Import
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBranch}
              disabled={!organizationId || isLoadingOrgId}
            >
              Tạo chi nhánh
            </Button>
          </Stack>
        </Stack>

        {isLoading || isLoadingOrgId ? (
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
          <Alert severity="error">Có lỗi xảy ra khi tải danh sách chi nhánh</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên chi nhánh</TableCell>
                    <TableCell>Mã chi nhánh</TableCell>
                    <TableCell>Địa điểm</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Typography variant="body2" color="text.secondary">
                          Không tìm thấy chi nhánh nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch) => (
                      <TableRow
                        key={branch.id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleRowClick(branch.id)}
                      >
                        <TableCell>{branch.name}</TableCell>
                        <TableCell>{branch.code}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{new Date(branch.created_at).toLocaleString("vi-VN")}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, branch)}>
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
      </Box>

      <BranchDialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />

      <BranchDialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        branch={selectedBranch}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />

      <ImportBranchDialog
        open={importDialogOpen}
        onClose={handleDialogClose}
        organizationId={organizationId || ""}
        onSuccess={handleSuccess}
      />
    </>
  );
}
