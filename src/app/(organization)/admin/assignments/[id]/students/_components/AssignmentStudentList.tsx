"use client";

import * as React from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { useGetAssignmentStudentsQuery } from "@/modules/assignment-management/operations/query";
import { useGetAssignmentQuery } from "@/modules/assignment-management/operations/query";
import { calculateAssignmentTotals } from "@/modules/assignment-management/utils/assignment.utils";
import {
  getStudentGradingStatus,
  getStudentProgressStatus,
  getStudentResultStatus,
  getStudentScoreLabel,
} from "@/modules/assignment-management/utils/assignment-student.utils";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import type { AssignmentStudentDto, AssignmentStudentProgressStatus, AssignmentStudentSummaryDto } from "@/types/dto/assignments";

const PAGE_SIZE = 10;
type AssignmentStudentRow = AssignmentStudentDto & {
  id: string;
  displayIndex: string;
};
const STATUS_OPTIONS: Array<{ value: "all" | AssignmentStudentProgressStatus; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "completed", label: "Hoàn thành" },
  { value: "in_progress", label: "Đang làm" },
  { value: "not_started", label: "Chưa bắt đầu" },
];

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

const SummaryCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 3,
      boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          backgroundColor: "#E8F1FF",
          color: "#1D4ED8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

export default function AssignmentStudentList() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | AssignmentStudentProgressStatus>("all");

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: assignment, isLoading: isLoadingAssignment } = useGetAssignmentQuery(assignmentId);
  const {
    data: paginatedResult,
    isLoading: isLoadingStudents,
    error,
  } = useGetAssignmentStudentsQuery(assignmentId, {
    page: page - 1,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const isLoading = isLoadingAssignment || isLoadingStudents;

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Không giới hạn";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Không giới hạn";
    const formatted = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatted.replaceAll("/", ".");
  };

  const students = paginatedResult?.data || [];
  const totalCount = paginatedResult?.total || 0;
  const summary: AssignmentStudentSummaryDto = paginatedResult?.summary ?? {
    total_students: 0,
    completed_count: 0,
    in_progress_count: 0,
    not_started_count: 0,
  };

  const assignmentTotals = React.useMemo(() => calculateAssignmentTotals(assignment ?? null), [assignment]);
  const passScoreValue = assignment?.pass_score ?? null;
  console.log("assignment", assignment);

  const passScoreLabel =
    passScoreValue !== null && assignmentTotals.totalScore > 0
      ? `${passScoreValue}/${assignmentTotals.totalScore}`
      : passScoreValue !== null
        ? `${passScoreValue}`
        : "--";
  const durationLabel =
    assignment?.attempt_duration_minutes !== null && assignment?.attempt_duration_minutes !== undefined
      ? `${assignment.attempt_duration_minutes} phút`
      : "Không giới hạn";
  const dueDateLabel = formatDate(assignment?.available_to ?? null);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleNavigateToResult = (employeeId: string) => {
    router.push(PATHS.ASSIGNMENTS.RESULT(assignmentId, employeeId));
  };

  const handleNavigateToGrade = (employeeId: string) => {
    router.push(PATHS.ASSIGNMENTS.GRADE(assignmentId, employeeId));
  };

  const handleNavigateToSubmission = (employeeId: string) => {
    router.push(PATHS.ASSIGNMENTS.SUBMIT(assignmentId, employeeId));
  };

  const tableRows = React.useMemo<AssignmentStudentRow[]>(() => {
    const offset = (page - 1) * PAGE_SIZE;
    const placeholders: AssignmentStudentRow[] = Array.from({ length: offset }, (_, index) => ({
      id: `placeholder-${index + 1}`,
      displayIndex: "",
      employee_id: "",
      employee_code: "",
      full_name: "",
      email: "",
      avatar: null,
      department_name: null,
      has_submitted: false,
      submitted_at: null,
      score: null,
      max_score: null,
      status: null,
    }));

    const currentRows = students.map((student, index) => ({
      ...student,
      id: student.employee_id,
      displayIndex: String(offset + index + 1).padStart(2, "0"),
    }));

    return [...placeholders, ...currentRows];
  }, [students, page]);

  const columns = React.useMemo<TableDataProps<AssignmentStudentRow>["columns"]>(
    () => [
      {
        id: "index",
        field: "displayIndex",
        headerName: "STT",
        width: 80,
      },
      {
        id: "student",
        field: "full_name",
        headerName: "Học viên",
        sx: { minWidth: 260 },
        renderCell: (_value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        ),
      },
      {
        id: "score",
        field: "score",
        headerName: "Điểm",
        renderCell: (_value, row) => getStudentScoreLabel(row),
      },
      {
        id: "result",
        field: "result",
        headerName: "Kết quả",
        renderCell: (_value, row) => {
          const resultStatus = getStudentResultStatus(row, passScoreValue);
          if (resultStatus === "none") {
            return "-";
          }
          return (
            <Chip
              label={resultStatus === "pass" ? "Đạt" : "Không đạt"}
              size="small"
              sx={{
                backgroundColor: resultStatus === "pass" ? "#E7F8EC" : "#FFE7EE",
                color: resultStatus === "pass" ? "#159947!" : "#E11D48!",
                fontWeight: 600,
              }}
            />
          );
        },
      },
      {
        id: "grading-status",
        field: "status",
        headerName: "Trạng thái chấm",
        renderCell: (_value, row) => {
          const progressStatus = getStudentProgressStatus(row);
          const gradingStatus = getStudentGradingStatus(row);
          const gradingLabel =
            progressStatus === "completed"
              ? gradingStatus === "graded"
                ? "Đã chấm"
                : "Chưa chấm"
              : progressStatus === "in_progress"
                ? "Đang làm"
                : "Chưa nộp";

          return (
            <Chip
              label={gradingLabel}
              size="small"
              sx={{
                backgroundColor: "#F3F4F6",
                fontWeight: 500,
              }}
            />
          );
        },
      },
      {
        id: "department",
        field: "department_name",
        headerName: "Phòng ban",
        renderCell: (_value, row) =>
          row.department_name ? (
            <Chip
              label={row.department_name}
              size="small"
              color="info"
            />
          ) : (
            "-"
          ),
      },
      {
        id: "action",
        field: "employee_id",
        headerName: "Thao tác",
        align: "right",
        renderCell: (_value, row) => {
          const actionLabel =
            row.status === "graded" ? "Xem chi tiết" : row.has_submitted ? "Chấm điểm" : "Xem chi tiết";
          const handleAction =
            row.status === "graded"
              ? () => handleNavigateToResult(row.employee_id)
              : row.has_submitted
                ? () => handleNavigateToGrade(row.employee_id)
                : () => handleNavigateToSubmission(row.employee_id);

          return (
            <Button variant="text" onClick={handleAction} sx={{ fontWeight: 600, textTransform: "none" }}>
              {actionLabel}
            </Button>
          );
        },
      },
    ],
    [handleNavigateToGrade, handleNavigateToResult, handleNavigateToSubmission, passScoreValue],
  );

  return (
    <PageContainer
      title={assignment ? assignment.name : "Danh sách học viên"}
      breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }, { title: "Danh sách học viên" }]}
    >
      <Box sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Card sx={{ p: { xs: 2, md: 3 }, boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)", borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Thời gian
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {durationLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Số câu hỏi
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {assignmentTotals.totalQuestions} câu
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Điểm đạt tối thiểu
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {passScoreLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="error.main">
                  Hạn nộp
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {dueDateLabel}
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <SummaryCard
                title="Tổng học viên"
                value={formatNumber(summary.total_students)}
                icon={<PeopleAltOutlinedIcon fontSize="medium" />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <SummaryCard
                title="Hoàn thành"
                value={formatNumber(summary.completed_count)}
                icon={<TaskAltOutlinedIcon fontSize="medium" />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <SummaryCard
                title="Đang làm"
                value={formatNumber(summary.in_progress_count)}
                icon={<AccessTimeOutlinedIcon fontSize="medium" />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <SummaryCard
                title="Chưa bắt đầu"
                value={formatNumber(summary.not_started_count)}
                icon={<HourglassEmptyOutlinedIcon fontSize="medium" />}
              />
            </Grid>
          </Grid>

          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)" }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                pb={3}
              >
                <TextField
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Tìm kiếm"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: { md: 320 },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "grey.100",
                    },
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "all" | AssignmentStudentProgressStatus)}
                    sx={{
                      backgroundColor: "grey.100",
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                <Alert severity="error">Có lỗi xảy ra khi tải danh sách học viên</Alert>
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
                <TableData
                  rows={tableRows}
                  columns={columns}
                  loading={isLoading}
                  hoverRow
                  bordered={false}
                  minWidth={960}
                  pagination={{
                    page,
                    pageSize: PAGE_SIZE,
                    total: totalCount,
                    perPageOptions: [PAGE_SIZE],
                    onChangePage: handleChangePage,
                  }}
                />
              )}
            </Stack>
          </Card>
        </Stack>
      </Box>
    </PageContainer>
  );
}
