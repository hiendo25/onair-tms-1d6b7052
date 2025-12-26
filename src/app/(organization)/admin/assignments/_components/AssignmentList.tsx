"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
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
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useDeleteAssignmentMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";
import type { AssignmentDto } from "@/types/dto/assignments";

export default function AssignmentList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const currentEmployee = useUserOrganization((state) => state.currentEmployee);

  const {
    data: assignmentsResult,
    isLoading,
    error,
  } = useGetAssignmentsQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    organizationId: currentEmployee.organization.id,
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
    return (selectedAssignment?.assignmentEmployees?.[0]?.count ?? 0) > 0;
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
      notifications.show(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa bài kiểm tra", {
        severity: "error",
        autoHideDuration: 5000,
      });
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
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

            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateAssignment}>
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
            <Alert severity="error">Có lỗi xảy ra khi tải danh sách bài kiểm tra</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên bài kiểm tra</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Số câu hỏi</TableCell>
                      <TableCell>Tổng điểm</TableCell>
                      <TableCell>Tiến độ</TableCell>
                      <TableCell>Số học viên</TableCell>
                      <TableCell>Người tạo</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Không tìm thấy bài kiểm tra nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => {
                        const totalScore =
                          assignment.questions?.reduce((sum, question) => sum + (question.score ?? 0), 0) || 0;
                        const assignedCount = assignment.assignmentEmployees?.[0]?.count ?? 0;
                        const submittedCount = assignment.submissions?.[0]?.count ?? 0;

                        return (
                          <TableRow key={assignment.id} hover sx={{ cursor: "pointer" }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {assignment.name}
                              </Typography>
                            </TableCell>
                            <Tooltip title={assignment.description}>
                              <TableCell className="max-w-3xs">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                                  className="line-clamp-2"
                                >
                                  {assignment.description}
                                </ReactMarkdown>
                              </TableCell>
                            </Tooltip>
                            <TableCell>{assignment.questions?.length || 0}</TableCell>
                            <TableCell>{totalScore}</TableCell>
                            <TableCell>{submittedCount}/{assignedCount}</TableCell>
                            <TableCell>{assignedCount}</TableCell>
                            <TableCell>
                              {assignment.createdBy?.profiles?.full_name || assignment.created_by}
                            </TableCell>
                            <TableCell>{formatDate(assignment.created_at)}</TableCell>
                            <TableCell align="center">
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, assignment.id)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
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
