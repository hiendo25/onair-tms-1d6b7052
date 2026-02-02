import React, { useMemo, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useGetClassRoomStudentsQuery } from "@/modules/class-room-management/operations/query";
import type { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import EmptyData from "@/shared/ui/EmptyData";
import ProgressBar from "@/shared/ui/ProgressBar";
import { CLASSROOM_DETAIL_TEXT, CLASSROOM_STUDENT_STATUS_TEXT } from "../_constants";
import { useClassRoomExams } from "../_hooks/useClassRoomExams";
import { useClassRoomStudentsAssignmentStatus } from "../_hooks/useClassRoomStudentsAssignmentStatus";
import { useClassRoomStudentsProgress } from "../_hooks/useClassRoomStudentsProgress";
import {
  resolveStudentAttendanceStatus,
  resolveStudentDepartmentName,
} from "../_utils/classRoomStudent.utils";

import ClassRoomStudentExamCollapseRow from "./ClassRoomStudentExamCollapseRow";


interface ClassRoomStudentsSectionProps {
  data: ClassRoomDetailWithProgress;
  learningPathId?: string | null;
}

const PAGE_SIZE = 10;

const GRADING_STATUS_COLOR = {
  graded: "success",
  submitted: "warning",
  not_submitted: "default",
} as const;

const ATTENDANCE_STATUS_COLOR = {
  attended: "success",
  absent: "default",
} as const;

const TABLE_COLS = 8;

export default function ClassRoomStudentsSection({
  data,
  learningPathId,
}: ClassRoomStudentsSectionProps) {
  const [page, setPage] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: studentsResult, isLoading, isError } = useGetClassRoomStudentsQuery({
    classRoomId: data.id,
    page,
    limit: PAGE_SIZE,
  });

  const students = studentsResult?.data ?? [];
  const totalStudents = studentsResult?.total ?? 0;
  const totalPages = Math.max(Math.ceil(totalStudents / PAGE_SIZE), 1);

  const employeeIds = useMemo(
    () =>
      students
        .map((student) => student.employee?.id)
        .filter((employeeId): employeeId is string => Boolean(employeeId)),
    [students],
  );

  const { data: progressResult } = useClassRoomStudentsProgress({
    classRoomId: data.id,
    employeeIds,
    learningPathId,
  });

  const exams = useClassRoomExams(data);
  const primaryAssignmentId = exams[0]?.assignmentConfigId;
  const hasMultipleAssignments = exams.length > 1;
  const hasAssignment = exams.length > 0;
  const assignmentConfigIds = useMemo(
    () => exams.map((exam) => exam.assignmentConfigId),
    [exams],
  );

  const { data: assignmentStatusResult } = useClassRoomStudentsAssignmentStatus({
    classRoomId: data.id,
    assignmentConfigId: primaryAssignmentId,
    employeeIds,
  });

  const progressMap = useMemo(() => {
    return new Map(
      (progressResult?.students ?? []).map((item) => [item.employeeId, item]),
    );
  }, [progressResult?.students]);

  const assignmentMap = useMemo(() => {
    return new Map(
      (assignmentStatusResult?.students ?? []).map((item) => [item.employeeId, item]),
    );
  }, [assignmentStatusResult?.students]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleToggleRow = (studentId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Box className="flex items-center justify-center py-10">
          <CircularProgress />
        </Box>
      </Stack>
    );
  }

  if (isError || students.length === 0) {
    return (
      <Stack spacing={3}>
        <EmptyData
          title={CLASSROOM_DETAIL_TEXT.STUDENTS_EMPTY_TITLE}
          description={CLASSROOM_DETAIL_TEXT.STUDENTS_EMPTY_DESCRIPTION}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Table
        sx={{
          "& .MuiTableCell-head": {
            fontWeight: 600,
            backgroundColor: "grey.50",
          },
          "& .MuiTableCell-root": {
            borderColor: "grey.100",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell width={80}>STT</TableCell>
            <TableCell>Học viên</TableCell>
            <TableCell width={160}>Phòng ban</TableCell>
            <TableCell width={260}>Tiến độ học</TableCell>
            <TableCell width={160}>Trạng thái</TableCell>
            <TableCell width={160}>Trạng thái chấm</TableCell>
            <TableCell width={80} align="center">
              Chi tiết
            </TableCell>
            <TableCell width={60} />
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, index) => {
            const employeeId = student.employee?.id ?? "";
            const progress = progressMap.get(employeeId);
            const assignmentStatus = assignmentMap.get(employeeId);
            const attendanceStatus = resolveStudentAttendanceStatus(student);
            const departmentName = resolveStudentDepartmentName(student);
            const progressValue = progress?.progressPercentage ?? 0;
            const gradingStatus = assignmentStatus?.gradingStatus ?? "not_submitted";
            const isExpanded = Boolean(expandedRows[student.id]);

            return (
              <React.Fragment key={student.id}>
                <TableRow>
                  <TableCell>{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</TableCell>
                  <TableCell>
                    <Stack>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {student.employee?.profile?.full_name || "-"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.employee?.profile?.email || "-"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={departmentName}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: "grey.200" }}
                    />
                  </TableCell>
                  <TableCell>
                    <ProgressBar value={progressValue} height={12} borderRadius={12} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={CLASSROOM_STUDENT_STATUS_TEXT.ATTENDANCE[attendanceStatus]}
                      size="small"
                      color={ATTENDANCE_STATUS_COLOR[attendanceStatus]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {hasAssignment && !hasMultipleAssignments ? (
                      <Chip
                        label={CLASSROOM_STUDENT_STATUS_TEXT.GRADING_STATUS[gradingStatus]}
                        size="small"
                        color={GRADING_STATUS_COLOR[gradingStatus]}
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        --
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleToggleRow(student.id)}>
                      {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={handleOpenMenu}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <ClassRoomStudentExamCollapseRow
                  student={student}
                  assignmentConfigIds={assignmentConfigIds}
                  classRoomId={data.id}
                  classRoomSlug={data.slug}
                  colSpan={TABLE_COLS}
                  isExpanded={isExpanded}
                />
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <Stack alignItems="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Stack>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleCloseMenu}>Gỡ học viên</MenuItem>
      </Menu>
    </Stack>
  );
}
