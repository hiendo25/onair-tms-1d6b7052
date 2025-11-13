"use client";
import EnterClassRoomsDialog from "@/app/(organization)/my-class/_components/EnterClassRooms";
import { PATHS } from "@/constants/path.contstants";
import { fDate, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { useDeleteClassRoomMutation } from "@/modules/class-room-management/operations/mutation";
import { ConfirmDialog } from "@/shared/ui/custom-dialog";
import { ClassRoomPriorityDto, EmployeeWithProfileDto } from "@/types/dto/classRooms/classRoom.dto";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useQueryClient } from "@tanstack/react-query";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { TABLE_HEAD_CLASS_ROOM } from "../constants";
import { ClassRoomStatusFilter, ClassRoomTypeFilter } from "../types/types";
import { getClassRoomStatusLabel, getClassRoomTypeLabel, getColorClassRoomStatus } from "../utils/status";
import ClassRoomType from "./ClassRoomType";
import ClassRoomRuntimeStatus from "./ClassRoomRuntimeStatus";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";

interface ClassRoomListTableProps {
  classRooms: ClassRoomPriorityDto[];
  page: number;
  pageSize: number;
  isAdmin: boolean;
}
const formatOrder = (index: number) => index.toString().padStart(2, "0");

export default function ClassRoomListTable({ classRooms, page, pageSize, isAdmin }: ClassRoomListTableProps) {
  const startIndex = (page - 1) * pageSize;
  const queryClient = useQueryClient();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClassRoom, setSelectedClassRoom] = useState<ClassRoomPriorityDto | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQRClassRoom, setSelectedQRClassRoom] = useState<ClassRoomPriorityDto | null>(null);

  const { mutateAsync: deleteClassRoom, isPending } = useDeleteClassRoomMutation();
  const [isOpenDialogDelete, setIsOpenDialogDelete] = useState(false);
  const [isAllowDelete, setIsAllowDelete] = useState(false);
  const [classRoomId, setClassRoomId] = useState<string>();

  const handleOpenDeleteClassRoom = (room: ClassRoomPriorityDto) => {
    setClassRoomId(room.id as string);
    setIsOpenDialogDelete(true);

    if (room.status === ClassRoomStatusFilter.Daft) {
      setIsAllowDelete(true);
    } else if (room.status === ClassRoomStatusFilter.Publish && room?.assignees?.length === 0) {
      setIsAllowDelete(true);
    } else {
      setIsAllowDelete(false);
    }
  };

  const handleDeleteClassRoom = async () => {
    if (classRoomId) {
      await deleteClassRoom(classRoomId);
      queryClient.invalidateQueries({ queryKey: ["class-rooms-priority"] });
      setIsOpenDialogDelete(false);
    }
  };

  const handleEditClassRoom = (isOnline: boolean, classRoomId: string) => {
    return router.push(PATHS.CLASSROOMS.EDIT_CLASSROOM(classRoomId))
  };

  const navigateToSession = useCallback(
    (sessionId?: string, slug?: string | null) => {
      if (!sessionId || !slug) {
        return;
      }
      router.push(`/class-room/cd/${slug}/${sessionId}`);
    },
    [router],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedClassRoom(null);
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (!selectedClassRoom) {
        return;
      }

      const isOnline = selectedClassRoom.class_sessions?.[0]?.is_online;
      if (!isOnline) {
        //  xử lý btn quét mã qr khi là lớp học offline chuỗi
        return;
      }

      const slug = selectedClassRoom.slug ?? undefined;

      setDialogOpen(false);
      navigateToSession(sessionId, slug);
      setSelectedClassRoom(null);
    },
    [navigateToSession, selectedClassRoom],
  );

  const handleEnterClassRoom = useCallback((room: ClassRoomPriorityDto) => {
    setSelectedClassRoom(room);
    setDialogOpen(true);
  }, []);

  const handleOpenQRDialog = useCallback((room: ClassRoomPriorityDto) => {
    setSelectedQRClassRoom(room);
    setQrDialogOpen(true);
  }, []);

  const handleCloseQRDialog = useCallback(() => {
    setQrDialogOpen(false);
    setSelectedQRClassRoom(null);
  }, []);

  const selectedSessions = selectedClassRoom?.class_sessions ?? [];
  const selectedThumbnail = selectedClassRoom?.thumbnail_url;
  const selectedTitle = selectedClassRoom?.title;
  const selectedIsOnline = selectedClassRoom?.class_sessions?.[0]?.is_online;
  const selectedActionLabel = selectedIsOnline === false ? "Quét mã QR" : undefined;

  return (
    <>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer>
          <Table
            aria-label="Danh sách lớp học trực tuyến"
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                py: 2,
                px: 2,
              },
            }}
          >
            <TableHead
              sx={{
                backgroundColor: grey[100],
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  color: grey[700],
                },
              }}
            >
              <TableRow>
                {TABLE_HEAD_CLASS_ROOM.map((item) => {
                  return (
                    <TableCell
                      key={item.id}
                      sx={{
                        width: item.width,
                        whiteSpace: "nowrap",
                      }}
                      align={item.align}
                    >
                      {item.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottomColor: grey[200],
                  verticalAlign: "middle",
                },
              }}
            >
              {classRooms.map((room, index) => {
                const order = formatOrder(startIndex + index + 1);
                const teacherAssignments =
                  room.class_sessions?.flatMap((session) => session.teacherAssignments ?? []) ?? [];

                const teacherMap = new Map<string, EmployeeWithProfileDto>();
                teacherAssignments.forEach((assignment) => {
                  const teacher = assignment.teacher;
                  if (!teacher?.id) {
                    return;
                  }
                  if (!teacherMap.has(teacher.id)) {
                    teacherMap.set(teacher.id, teacher);
                  }
                });

                const teachers = Array.from(teacherMap.values());
                const isOnline = room?.class_sessions?.[0]?.is_online;

                return (
                  <TableRow
                    key={room.id ?? `${room.title}-${index}`}
                    sx={{
                      "&:last-child td": { borderBottom: "none" },
                      "&:hover": {
                        backgroundColor: grey[50],
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {order}
                    </TableCell>
                    <TableCell align="left">
                      <Stack direction="column" alignItems="flex-start">
                        <Chip
                          label={getClassRoomTypeLabel(room?.room_type as ClassRoomTypeFilter)}
                          color={room?.room_type === "single" ? "warning" : "primary"}
                        />
                        <Tooltip title={room.title}>
                          <Typography variant="subtitle2" fontWeight={600} className="line-clamp-2">
                            {room.title || "--"}
                          </Typography>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <ClassRoomType isOnline={isOnline!} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PeopleAltOutlinedIcon className="w-4 h-4" />
                        <Typography className="text-xs">{room?.studentCount?.[0].count}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <ClassRoomRuntimeStatus runtimeStatus={room?.runtime_status as any} />
                    </TableCell>
                    <TableCell align="center">
                      <AvatarGroup sx={{ justifyContent: "center" }} variant="circular" max={4}>
                        {teachers.map((teacher) => {
                          return (
                            <Tooltip key={teacher.profile?.id} title={teacher.profile?.full_name}>
                              <Avatar
                                alt={teacher.profile?.full_name}
                                src={teacher.profile?.avatar as string}
                                sx={{ width: 24, height: 24 }}
                              />
                            </Tooltip>
                          );
                        })}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getClassRoomStatusLabel(room?.status as ClassRoomStatusFilter)}
                        size="small"
                        color={getColorClassRoomStatus(room?.status as ClassRoomStatusFilter)}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {fDate(room.start_at, FORMAT_DATE_TIME_CLEANER)} <br />
                      {fDate(room.end_at, FORMAT_DATE_TIME_CLEANER)}
                    </TableCell>
                    <TableCell align="center">
                      <PopupState variant="popover" popupId="demo-popup-menu">
                        {(popupState) => (
                          <>
                            <IconButton {...bindTrigger(popupState)}>
                              <MoreVertIcon />
                            </IconButton>
                            <Menu {...bindMenu(popupState)}>
                              <MenuItem
                                onClick={() => {
                                  router.push(PATHS.CLASSROOMS.DETAIL_CLASSROOM(room.slug as string));
                                }}
                              >
                                Xem chi tiết lớp học
                              </MenuItem>
                              <MenuItem onClick={() => handleEnterClassRoom(room)} disabled={!isOnline!}>
                                Vào lớp học
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleOpenQRDialog(room);
                                  popupState.close();
                                }}
                                disabled={isOnline!}
                              >
                                QR điểm danh
                              </MenuItem>
                              <MenuItem
                                onClick={() => handleEditClassRoom(isOnline!, room?.id as string)}
                                disabled={!isAdmin}
                              >
                                Chỉnh sửa
                              </MenuItem>
                              <MenuItem onClick={() => handleOpenDeleteClassRoom(room)} disabled={!isAdmin}>
                                Xoá lớp học
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  router.push(`${room.id}/students`);
                                }}
                              >
                                Danh sách học viên
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
        </TableContainer>
      </Box>

      <ConfirmDialog
        open={isOpenDialogDelete}
        onClose={() => setIsOpenDialogDelete(false)}
        title={isAllowDelete ? "Xác nhận xoá lớp học trực tuyến" : "Không thể xoá lớp học"}
        content={
          isAllowDelete
            ? "Bạn có chắc muốn xoá lớp học này? Hành động này sẽ xoá toàn bộ thông tin đã tạo và không thể hoàn tác."
            : "Lớp học này đã có học viên tham gia. Vui lòng gỡ học viên ra khỏi trước khi thực hiện thao tác này."
        }
        action={
          <>
            <Button variant="contained" color="error" onClick={handleDeleteClassRoom} disabled={!isAllowDelete}>
              Xoá lớp học
            </Button>
          </>
        }
      />

      <EnterClassRoomsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        sessions={selectedSessions}
        thumbnail={selectedThumbnail}
        classTitle={selectedTitle}
        actionLabel={selectedActionLabel}
        onSelectSession={handleSelectSession}
      />

      {selectedQRClassRoom && (
        <QRCodeViewDialog
          open={qrDialogOpen}
          onClose={handleCloseQRDialog}
          classRoom={selectedQRClassRoom}
        />
      )}
    </>
  );
}
