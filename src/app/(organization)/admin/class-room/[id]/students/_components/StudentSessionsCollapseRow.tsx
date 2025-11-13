"use client";

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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { fDate, fDateTime, FORMAT_DATE_TIME } from "@/lib";
import type { ClassRoomStudentDto } from "@/types/dto/classRooms/classRoom.dto";

type StudentSessionList =
  | NonNullable<NonNullable<ClassRoomStudentDto["class_rooms"]>["sessions"]>
  | [];

interface StudentSessionsCollapseRowProps {
  student: ClassRoomStudentDto;
  sessions: StudentSessionList;
  colSpan: number;
  isExpanded: boolean;
  isMarkingAttendance: boolean;
  onMarkAttendance: (
    sessionId: string,
    employeeId?: string,
  ) => void | Promise<void>;
}

export const StudentSessionsCollapseRow = ({
  student,
  sessions,
  colSpan,
  isExpanded,
  isMarkingAttendance,
  onMarkAttendance,
}: StudentSessionsCollapseRowProps) => {
  const disableManualAttendance =
    Boolean(sessions?.[0]?.is_online) || isMarkingAttendance;

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
              Danh sách buổi học
            </Typography>

            {sessions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1.5 }}
              >
                Lớp học chưa có buổi học nào.
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
                    <TableCell width={60}>#</TableCell>
                    <TableCell>Tên buổi học</TableCell>
                    <TableCell width={140}>Hình thức</TableCell>
                    <TableCell width={180}>Bắt đầu</TableCell>
                    <TableCell width={180}>Kết thúc</TableCell>
                    <TableCell width={160} align="center">
                      Điểm danh
                    </TableCell>
                    <TableCell width={160} align="center">
                      Giờ tham dự
                    </TableCell>
                    <TableCell width={160} align="center">
                      Loại
                    </TableCell>
                    <TableCell width={160} align="center">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session, sessionIndex) => {
                    const sessionAttendance = session.class_attendances?.[0];
                    const hasAttendance = Boolean(
                      sessionAttendance?.attended_at,
                    );

                    return (
                      <TableRow
                        key={`${student.id}-${session.id}`}
                        sx={{
                          "&:last-child td": {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <TableCell>{sessionIndex + 1}</TableCell>
                        <TableCell>{session.title ?? "Buổi học"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={session.is_online ? "warning" : "secondary"}
                            label={session.is_online ? "Trực tuyến" : "Trực tiếp"}
                          />
                        </TableCell>
                        <TableCell>{fDateTime(session.start_at)}</TableCell>
                        <TableCell>{fDateTime(session.end_at)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            color={hasAttendance ? "success" : "default"}
                            label={
                              hasAttendance ? "Đã điểm danh" : "Chưa điểm danh"
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          {fDate(
                            sessionAttendance?.attended_at,
                            FORMAT_DATE_TIME,
                          ) ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {sessionAttendance?.attendance_method ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          <PopupState
                            variant="popover"
                            popupId={`session-actions-${student.id}-${session.id}`}
                          >
                            {(popupState) => (
                              <>
                                <IconButton {...bindTrigger(popupState)}>
                                  <MoreVertIcon />
                                </IconButton>
                                <Menu {...bindMenu(popupState)}>
                                  <MenuItem
                                    onClick={() =>
                                      onMarkAttendance(session.id, student.employee?.id)
                                    }
                                    disabled={disableManualAttendance}
                                  >
                                    Điểm danh thủ công
                                  </MenuItem>
                                </Menu>
                              </>
                            )}
                          </PopupState>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

export default StudentSessionsCollapseRow;
