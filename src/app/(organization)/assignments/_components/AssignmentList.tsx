"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
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
  MenuItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import PageContainer from "@/shared/ui/PageContainer";
import { useGetAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import { useDeleteAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import type { AssignmentDto } from "@/types/dto/assignments";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { PATHS } from "@/constants/path.contstants";

export default function AssignmentList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: assignmentsResult, isLoading, error } = useGetAssignmentsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
  });

  const { mutateAsync: deleteAssignment, isPending: isDeleting } = useDeleteAssignmentMutation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);

  const assignments = assignmentsResult?.data || [];
  const totalCount = assignmentsResult?.total || 0;

  const selectedAssignment = React.useMemo(() => {
    return assignments.find((a) => a.id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  const hasAssignedStudents = React.useMemo(() => {
    return (selectedAssignment?.assignment_employees?.length || 0) > 0;
  }, [selectedAssignment]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateAssignment = () => {
    router.push(PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assignmentId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAssignmentId(assignmentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssignmentId(null);
  };

  const handleViewStudents = () => {
    if (selectedAssignmentId) {
      router.push(PATHS.ASSIGNMENTS.STUDENTS(selectedAssignmentId));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedAssignmentId) {
      router.push(PATHS.ASSIGNMENTS.EDIT_ASSIGNMENT(selectedAssignmentId));
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedAssignmentId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa bài kiểm tra này không? Hành động này không thể hoàn tác.",
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
      await deleteAssignment(selectedAssignmentId);

      await queryClient.invalidateQueries({ queryKey: ["assignments"] });

      notifications.show("Xóa bài kiểm tra thành công!", {
        severity: "success",
        autoHideDuration: 3000,
      });

      handleMenuClose();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      notifications.show(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi xóa bài kiểm tra",
        {
          severity: "error",
          autoHideDuration: 5000,
        },
      );
      handleMenuClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <PageContainer
      title="Danh sách bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
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
            <TextField
              placeholder="Tìm kiếm bài kiểm tra..."
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

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateAssignment}
            >
              Tạo bài kiểm tra
            </Button>
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
            <Alert severity="error">
              Có lỗi xảy ra khi tải danh sách bài kiểm tra
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên bài kiểm tra</TableCell>
                      <TableCell>Số câu hỏi</TableCell>
                      <TableCell>Số học viên</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy bài kiểm tra nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow
                          key={assignment.id}
                          hover
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {assignment.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {assignment.questions?.length || 0}
                          </TableCell>
                          <TableCell>
                            {assignment.assignment_employees?.length || 0}
                          </TableCell>
                          <TableCell>
                            {formatDate(assignment.created_at)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, assignment.id)}
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
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} của ${count}`
                }
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
            <MenuItem onClick={handleViewStudents}>
              <ListItemText>Danh sách học viên</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEdit}>
              <ListItemText>Chỉnh sửa</ListItemText>
            </MenuItem>
            <Tooltip
              title={hasAssignedStudents ? "Không thể xóa bài kiểm tra đã có học viên được giao" : ""}
              placement="left"
            >
              <span>
                <MenuItem onClick={handleDelete} disabled={isDeleting || hasAssignedStudents}>
                  <ListItemText>Xóa bài kiểm tra</ListItemText>
                </MenuItem>
              </span>
            </Tooltip>
          </Menu>
        </Card>
      </Box>
    </PageContainer>
  );
}

