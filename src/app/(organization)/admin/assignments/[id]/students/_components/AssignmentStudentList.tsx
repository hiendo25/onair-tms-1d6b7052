"use client";

import * as React from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import useDebounce from "@/hooks/useDebounce";
import { fDate, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { useGetAssignmentStudentsQuery } from "@/modules/assignment-management/operations/query";
import { useGetAssignmentQuery } from "@/modules/assignment-management/operations/query";
import { calculateAssignmentTotals } from "@/modules/assignment-management/utils/assignment.utils";
import {
  getStudentGradingStatus,
  getStudentProgressStatus,
  getStudentResultStatus,
  getStudentScoreLabel,
} from "@/modules/assignment-management/utils/assignment-student.utils";
import SearchTextField from "@/shared/ui/filters/SearchTextField";
import SelectOption from "@/shared/ui/filters/SelectOption";
import PageContainer from "@/shared/ui/PageContainer";
import TableData, { TableDataProps } from "@/shared/ui/TableData";
import type { AssignmentStudentDto, AssignmentStudentProgressStatus, AssignmentStudentSummaryDto } from "@/types/dto/assignments";

const PAGE_SIZE = 10;
type AssignmentStudentRow = AssignmentStudentDto & {
  id: string;
  displayIndex: string;
};
const PROGRESS_STATUS_LABELS: Record<AssignmentStudentProgressStatus, string> = {
  completed: "Hoàn thành",
  in_progress: "Đang làm",
  not_started: "Chưa bắt đầu",
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
      borderRadius: 2,
      boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.08)",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          backgroundColor: "#E6F2FF",
          color: "#004999",
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
  const dueDateLabel = fDate(assignment?.available_to ?? null, FORMAT_DATE_TIME_CLEANER);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleNavigateToResult = (employeeId: string) => {
    router.push(PATHS.ASSIGNMENTS.RESULT(assignmentId, employeeId));
  };

  const handleNavigateToGrade = (employeeId: string) => {
    router.push(PATHS.ASSIGNMENTS.GRADE(assignmentId, employeeId));
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
            <>
              {
                resultStatus === "pass" ? (
                  <Box className="py-1 px-1.5 bg-[#22C55E29] text-[#118D57] rounded-md inline-block font-bold text-[10px]">
                    Đạt
                  </Box>
                )
                  :
                  (
                    <Box className="py-1 px-1.5 bg-[#F63D6814] text-[#F63D68] rounded-md inline-block font-bold text-[10px]">
                      Không đạt
                    </Box>
                  )
              }
            </>
          );
        },
      },
      {
        id: "progress-status",
        field: "progress_status",
        headerName: "Trạng thái làm bài",
        renderCell: (_value, row) => {
          const progressStatus = getStudentProgressStatus(row);
          const progressLabel = PROGRESS_STATUS_LABELS[progressStatus];

          return (
            <Box className="py-1 px-1.5 bg-[#F9FAFB] text-[#000000] rounded-md inline-block font-normal text-[12px]">
              {progressLabel}
            </Box>
          );
        },
      },
      {
        id: "grading-status",
        field: "grading_status",
        headerName: "Trạng thái chấm",
        renderCell: (_value, row) => {
          const progressStatus = getStudentProgressStatus(row);
          const gradingStatus = getStudentGradingStatus(row);
          const gradingLabel =
            progressStatus === "completed" ? (gradingStatus === "graded" ? "Đã chấm" : "Chưa chấm") : "-";

          return (
            <>
              <Box className="py-1 px-1.5 bg-[#F9FAFB] text-[#000000] rounded-md inline-block font-normal text-[12px]">
                {gradingLabel}
              </Box>
            </>
          );
        },
      },
      {
        id: "department",
        field: "department_name",
        headerName: "Phòng ban",
        renderCell: (_value, row) =>
          <Box className="py-1 px-1.5 bg-[#F9FAFB] text-[#000000] rounded-md inline-block font-normal text-[12px]">
            {row.department_name ?? "--"}
          </Box>
      },
      {
        id: "action",
        field: "employee_id",
        headerName: "Thao tác",
        align: "right",
        renderCell: (_value, row) => {
          const progressStatus = getStudentProgressStatus(row);
          const gradingStatus = getStudentGradingStatus(row);
          const isActionDisabled = progressStatus !== "completed";
          const actionLabel = isActionDisabled
            ? ""
            : gradingStatus === "graded"
              ? "Xem chi tiết"
              : "Chấm điểm";
          const handleAction =
            gradingStatus === "graded"
              ? () => handleNavigateToResult(row.employee_id)
              : () => handleNavigateToGrade(row.employee_id);

          return (
            <Button
              variant="text"
              onClick={handleAction}
              disabled={isActionDisabled}
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              {actionLabel}
            </Button>
          );
        },
      },
    ],
    [handleNavigateToGrade, handleNavigateToResult, passScoreValue],
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
                <Typography variant="body1" color="text.secondary">
                  Thời gian
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {durationLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Số câu hỏi
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {assignmentTotals.totalQuestions} câu
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Điểm đạt tối thiểu
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {passScoreLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" color="error.main">
                  Hạn nộp
                </Typography>
                <Typography variant="h6" fontWeight={600} color="error.main">
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
                sx={{
                  display: "grid",
                  gap: 2,
                  width: "100%",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    lg: "minmax(240px, 320px) 240px",
                  },
                }}
                pb={3}
              >
                <SearchTextField value={searchInput} onChange={setSearchInput} placeholder="Tìm kiếm" />
                <SelectOption
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as "all" | AssignmentStudentProgressStatus)}
                  options={STATUS_OPTIONS}
                />
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
