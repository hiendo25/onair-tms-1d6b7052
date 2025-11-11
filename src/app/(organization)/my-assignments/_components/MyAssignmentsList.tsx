"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PageContainer from "@/shared/ui/PageContainer";
import { useGetMyAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { PATHS } from "@/constants/path.contstants";

export default function MyAssignmentsList() {
  const router = useRouter();
  const { id: employeeId } = useUserOrganization((state) => state.data);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);

  const { data: paginatedResult, isLoading, error } = useGetMyAssignmentsQuery(page, rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, assignmentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignmentId(assignmentId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedAssignmentId(null);
  };

  const handleSubmitAssignment = () => {
    if (selectedAssignmentId && employeeId) {
      router.push(PATHS.MY_ASSIGNMENTS.SUBMIT(selectedAssignmentId, employeeId));
      handleCloseMenu();
    }
  };

  const handleViewResult = () => {
    if (selectedAssignmentId && employeeId) {
      router.push(PATHS.MY_ASSIGNMENTS.RESULT(selectedAssignmentId, employeeId));
      handleCloseMenu();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status: string | null, hasSubmitted: boolean) => {
    if (!hasSubmitted) {
      return <Chip label="Chưa nộp" color="warning" size="small" />;
    }
    if (status === "graded") {
      return <Chip label="Đã chấm" color="success" size="small" />;
    }
    if (status === "submitted") {
      return <Chip label="Đã nộp" color="info" size="small" />;
    }
    return <Chip label="Chưa nộp" color="warning" size="small" />;
  };

  const assignments = paginatedResult?.data || [];
  const totalCount = paginatedResult?.total || 0;

  const selectedAssignment = React.useMemo(() => {
    return assignments?.find((a) => a.assignment_id === selectedAssignmentId);
  }, [assignments, selectedAssignmentId]);

  if (isLoading) {
    return (
      <PageContainer
        title="Bài kiểm tra của tôi"
        breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        title="Bài kiểm tra của tôi"
        breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}
      >
        <Box p={3}>
          <Alert severity="error">
            {error instanceof Error ? error.message : "Không thể tải danh sách bài kiểm tra"}
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Bài kiểm tra của tôi"
      breadcrumbs={[{ title: "Bài kiểm tra của tôi" }]}
    >
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Danh sách bài kiểm tra được giao
          </Typography>

          {!assignments || assignments.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                Bạn chưa được giao bài kiểm tra nào
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tên bài kiểm tra</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Ngày nộp</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Điểm</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.assignment_id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assignment.assignment_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 300,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {assignment.assignment_description || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(assignment.submitted_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(assignment.status, assignment.has_submitted)}
                        </TableCell>
                        <TableCell>
                          {assignment.status === "graded" && assignment.score !== null ? (
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {assignment.score}/{assignment.max_score}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, assignment.assignment_id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
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
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} trong tổng số ${count}`
                }
              />
            </>
          )}
        </Card>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={handleSubmitAssignment}
            disabled={selectedAssignment?.status === "graded"}
          >
            Nộp bài
          </MenuItem>
          <MenuItem
            onClick={handleViewResult}
            disabled={selectedAssignment?.status !== "graded"}
          >
            Xem kết quả
          </MenuItem>
        </Menu>
      </Box>
    </PageContainer>
  );
}

