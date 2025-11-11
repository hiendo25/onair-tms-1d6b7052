"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
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
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PageContainer from "@/shared/ui/PageContainer";
import { useGetAssignmentStudentsQuery } from "@/modules/assignment-management/operations/query";
import { useGetAssignmentQuery } from "@/modules/assignment-management/operations/query";
import { PATHS } from "@/constants/path.contstants";

export default function AssignmentStudentList() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentQuery(assignmentId);
  const { data: paginatedResult, isLoading: isLoadingStudents, error } = useGetAssignmentStudentsQuery(
    assignmentId,
    page,
    rowsPerPage
  );

  const isLoading = isLoadingAssignment || isLoadingStudents;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => {
    router.push(PATHS.ASSIGNMENTS.ROOT);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, employeeId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudentId(employeeId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedStudentId(null);
  };

  const handleSubmitAssignment = () => {
    if (selectedStudentId) {
      router.push(PATHS.ASSIGNMENTS.SUBMIT(assignmentId, selectedStudentId));
      handleCloseMenu();
    }
  };

  const handleGradeAssignment = () => {
    if (selectedStudentId) {
      router.push(PATHS.ASSIGNMENTS.GRADE(assignmentId, selectedStudentId));
      handleCloseMenu();
    }
  };

  const handleViewResult = () => {
    if (selectedStudentId) {
      router.push(PATHS.ASSIGNMENTS.RESULT(assignmentId, selectedStudentId));
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

  const students = paginatedResult?.data || [];
  const totalCount = paginatedResult?.total || 0;

  return (
    <PageContainer
      title={assignment ? `Danh sách học viên - ${assignment.name}` : "Danh sách học viên"}
      breadcrumbs={[
        { title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT },
        { title: "Danh sách học viên" },
      ]}
    >
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Quay lại
            </Button>
            {assignment && (
              <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                {assignment.name}
              </Typography>
            )}
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
              Có lỗi xảy ra khi tải danh sách học viên
            </Alert>
          ) : !students || students.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Chưa có học viên nào được phân công
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã học viên</TableCell>
                      <TableCell>Họ và tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Trạng thái nộp</TableCell>
                      <TableCell>Trạng thái chấm</TableCell>
                      <TableCell>Ngày nộp</TableCell>
                      <TableCell align="center">Điểm</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.employee_id} hover>
                        <TableCell>{student.employee_code}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {student.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={student.has_submitted ? "Đã nộp" : "Chưa nộp"}
                            color={student.has_submitted ? "success" : "default"}
                            size="small"
                            sx={{ minWidth: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          {student.status ? (
                            <Chip
                              label={student.status === "graded" ? "Đã chấm" : "Chờ chấm"}
                              color={student.status === "graded" ? "primary" : "warning"}
                              size="small"
                              sx={{ minWidth: 80 }}
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(student.submitted_at)}
                        </TableCell>
                        <TableCell align="center">
                          {student.score !== null && student.max_score !== null ? (
                            <Typography variant="body2" fontWeight={500}>
                              {student.score}/{student.max_score}
                            </Typography>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, student.employee_id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

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
                  disabled={
                    selectedStudentId
                      ? students?.find((s) => s.employee_id === selectedStudentId)?.has_submitted
                      : false
                  }
                >
                  Nộp bài
                </MenuItem>
                <MenuItem
                  onClick={handleGradeAssignment}
                  disabled={
                    selectedStudentId
                      ? !students?.find((s) => s.employee_id === selectedStudentId)?.has_submitted
                      : false
                  }
                >
                  Chấm điểm
                </MenuItem>
                <MenuItem
                  onClick={handleViewResult}
                  disabled={
                    selectedStudentId
                      ? students?.find((s) => s.employee_id === selectedStudentId)?.status !== "graded"
                      : false
                  }
                >
                  Xem kết quả
                </MenuItem>
              </Menu>

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
                  `${from}-${to} của ${count}`
                }
              />
            </>
          )}
        </Card>
      </Box>
    </PageContainer>
  );
}

