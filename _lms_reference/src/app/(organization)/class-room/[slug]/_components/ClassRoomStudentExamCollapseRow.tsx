import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import type { ClassRoomStudentDto } from "@/types/dto/classRooms/classRoom.dto";
import { CLASSROOM_LIST_BREADCRUMB, CLASSROOM_STUDENT_STATUS_TEXT } from "../_constants";
import { useClassRoomStudentAssignmentsStatus } from "../_hooks/useClassRoomStudentAssignmentsStatus";

interface ClassRoomStudentExamCollapseRowProps {
  student: ClassRoomStudentDto;
  assignmentConfigIds: string[];
  classRoomId: string;
  classRoomSlug?: string | null;
  colSpan: number;
  isExpanded: boolean;
}

const EXAM_RESULT_COLOR = {
  passed: "success",
  failed: "error",
  pending: "default",
  not_submitted: "default",
} as const;

const GRADING_STATUS_COLOR = {
  graded: "success",
  submitted: "warning",
  not_submitted: "default",
} as const;

export default function ClassRoomStudentExamCollapseRow({
  student,
  assignmentConfigIds,
  classRoomId,
  classRoomSlug,
  colSpan,
  isExpanded,
}: ClassRoomStudentExamCollapseRowProps) {
  const router = useRouter();
  const employeeId = student.employee?.id;
  const returnPath = classRoomSlug ? `/class-room/${classRoomSlug}` : CLASSROOM_LIST_BREADCRUMB.path;
  const returnPathQuery = `?returnPath=${encodeURIComponent(returnPath)}`;

  const { data, isLoading } = useClassRoomStudentAssignmentsStatus({
    classRoomId,
    employeeId,
    assignmentConfigIds,
    enabled: isExpanded,
  });

  return (
    <TableRow
      sx={{
        backgroundColor: grey[50],
        "& > td": {
          borderBottom: "none",
          px: 0,
        },
      }}
    >
      <TableCell colSpan={colSpan}>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Danh sách bài kiểm tra
            </Typography>

            {assignmentConfigIds.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Lớp học chưa có bài kiểm tra nào.
              </Typography>
            ) : isLoading ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Đang tải dữ liệu...
              </Typography>
            ) : (
              <Table
                size="small"
                sx={{
                  mt: 1.5,
                  "& .MuiTableCell-root": {
                    borderColor: grey[200],
                    py: 1,
                    px: 1.5,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Tên bài kiểm tra</TableCell>
                    <TableCell width={140}>Kết quả</TableCell>
                    <TableCell width={160}>Trạng thái chấm</TableCell>
                    <TableCell width={140}>Điểm</TableCell>
                    <TableCell width={120} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.assignments ?? []).map((assignment) => (
                    <TableRow key={assignment.assignmentConfigId}>
                      <TableCell>{assignment.assignmentName ?? "Bài kiểm tra"}</TableCell>
                      <TableCell>
                        <Chip
                          label={CLASSROOM_STUDENT_STATUS_TEXT.EXAM_RESULT[assignment.examResult]}
                          size="small"
                          color={EXAM_RESULT_COLOR[assignment.examResult]}
                          variant={assignment.examResult === "pending" || assignment.examResult === "not_submitted" ? "outlined" : "filled"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={CLASSROOM_STUDENT_STATUS_TEXT.GRADING_STATUS[assignment.gradingStatus]}
                          size="small"
                          color={GRADING_STATUS_COLOR[assignment.gradingStatus]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.score !== null && assignment.maxScore !== null
                          ? `${assignment.score}/${assignment.maxScore}`
                          : assignment.score !== null
                            ? `${assignment.score}/${assignment.totalScore}`
                            : "--"}
                      </TableCell>
                      <TableCell align="right">
                        {employeeId ? (
                          <PopupState
                            variant="popover"
                            popupId={`exam-actions-${employeeId}-${assignment.assignmentConfigId}`}
                          >
                            {(popupState) => (
                              <>
                                <IconButton size="small" {...bindTrigger(popupState)}>
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                                <Menu {...bindMenu(popupState)}>
                                  <MenuItem
                                    onClick={() => {
                                      router.push(
                                        PATHS.ASSIGNMENTS.RESULT(
                                          assignment.assignmentConfigId,
                                          employeeId,
                                        ) + returnPathQuery,
                                      );
                                      popupState.close();
                                    }}
                                    disabled={assignment.gradingStatus !== "graded"}
                                  >
                                    Xem kết quả
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() => {
                                      router.push(
                                        PATHS.ASSIGNMENTS.GRADE(
                                          assignment.assignmentConfigId,
                                          employeeId,
                                        ) + returnPathQuery,
                                      );
                                      popupState.close();
                                    }}
                                    disabled={assignment.gradingStatus === "not_submitted"}
                                  >
                                    Chấm điểm
                                  </MenuItem>
                                </Menu>
                              </>
                            )}
                          </PopupState>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
}
