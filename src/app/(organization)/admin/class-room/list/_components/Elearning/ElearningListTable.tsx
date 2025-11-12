"use client";
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { grey } from "@mui/material/colors";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useRouter } from "next/navigation";
import { TABLE_HEAD_ELEARNING } from "../../constants";
import { ElearningCourseDto } from "@/types/dto/elearning/elearning.dto";
import { useDeleteElearningCourseMutation } from "@/modules/elearning/operations/mutation";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/ui/custom-dialog";
import { useState } from "react";
import AirplayOutlinedIcon from '@mui/icons-material/AirplayOutlined';

const formatOrder = (value: number) => value.toString().padStart(2, "0");
type ElearningTeacher = NonNullable<
    NonNullable<ElearningCourseDto["teacherAssignments"]>[number]["teacher"]
>;

interface ElearningListTableProps {
    elearnings: ElearningCourseDto[];
    page: number;
    pageSize: number;
    isAdmin: boolean;
}

export default function ElearningListTable({
    elearnings,
    page,
    pageSize,
    isAdmin,
}: ElearningListTableProps) {
    const startIndex = (page - 1) * pageSize;
    const router = useRouter();
    const [isOpenDialogDelete, setIsOpenDialogDelete] = useState(false);
    const [isAllowDelete, setIsAllowDelete] = useState(false);
    const [courseId, setCourseId] = useState<string>("");

    const queryClient = useQueryClient();

    const { mutateAsync: deleteElearningCourse, isPending } = useDeleteElearningCourseMutation();


    const handleOpenDeleteCourseDialog = (course: ElearningCourseDto) => {
        setIsOpenDialogDelete(true)
        setCourseId(course.id)
        if (course.status === "draft") {
            setIsAllowDelete(true);
        } else if (course.status === "published" && Number(course?.studentCount?.[0]?.count) === 0) {
            setIsAllowDelete(true);
        } else {
            setIsAllowDelete(false);
        }
    }

    const handleDeleteElearningCourse = async () => {
        if (courseId) {
            await deleteElearningCourse(courseId);
            queryClient.invalidateQueries({ queryKey: ["elearning-courses"] })
        }
    }

    const handleNavigateToStudents = (courseId?: string | null) => {
        if (!courseId) {
            return;
        }
        router.push(`/admin/elearning/${courseId}/students`);
    };

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
                                {TABLE_HEAD_ELEARNING.map((item) => {
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
                            {elearnings.map((course, index) => {
                                const order = formatOrder(startIndex + index + 1);
                                const studentCount = course.studentCount?.[0]?.count ?? 0;
                                const teacherMap = new Map<string, ElearningTeacher>();

                                (course.teacherAssignments ?? []).forEach((assignment) => {
                                    const teacher = assignment.teacher;
                                    if (!teacher?.id || teacherMap.has(teacher.id)) {
                                        return;
                                    }
                                    teacherMap.set(teacher.id, teacher);
                                });

                                const teachers = Array.from(teacherMap.values());

                                return (
                                    <TableRow
                                        key={course.id ?? `${course.title}-${index}`}
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
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" fontWeight={600} className="line-clamp-2">
                                                    {course.title || "--"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="inline-flex items-center gap-1.5 bg-[#FFAB0029] text-[#B76E00] rounded-xl px-1.5 py-0.5 text-xs">
                                                <AirplayOutlinedIcon className="text-[#B76E00] w-5 h-5" />
                                                Môn học eLearning
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                                <PeopleAltOutlinedIcon fontSize="small" />
                                                <Typography variant="body2" fontWeight={600}>
                                                    {studentCount}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            {teachers.length > 0 ? (
                                                <AvatarGroup sx={{ justifyContent: "center" }} max={4}>
                                                    {teachers.map((teacher) => (
                                                        <Tooltip key={teacher.id} title={teacher.profile?.full_name ?? "Chưa cập nhật"}>
                                                            <Avatar
                                                                alt={teacher.profile?.full_name ?? undefined}
                                                                src={teacher.profile?.avatar ?? undefined}
                                                                sx={{ width: 30, height: 30 }}
                                                            >
                                                                {teacher.profile?.full_name?.charAt(0) ?? "?"}
                                                            </Avatar>
                                                        </Tooltip>
                                                    ))}
                                                </AvatarGroup>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    --
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <PopupState variant="popover" popupId={`elearning-row-${course.id ?? index}`}>
                                                {(popupState) => (
                                                    <>
                                                        <IconButton {...bindTrigger(popupState)}>
                                                            <GridMoreVertIcon />
                                                        </IconButton>
                                                        <Menu {...bindMenu(popupState)}>
                                                            <MenuItem onClick={() => popupState.close()}>
                                                                Xem chi tiết khóa học
                                                            </MenuItem>
                                                            <MenuItem onClick={() => popupState.close()}>
                                                                Truy cập học
                                                            </MenuItem>
                                                            <MenuItem onClick={() => popupState.close()} disabled={!isAdmin}>
                                                                Chỉnh sửa
                                                            </MenuItem>
                                                            <MenuItem onClick={() => {
                                                                popupState.close();
                                                                handleOpenDeleteCourseDialog(course)
                                                            }}
                                                                disabled={!isAdmin}>
                                                                Xoá khóa học
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    popupState.close();
                                                                    handleNavigateToStudents(course.id);
                                                                }}
                                                                disabled={!course.id}
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
                title={isAllowDelete ? "Xác nhận xoá khóa học" : "Không thể xoá khóa học"}
                content={isAllowDelete ? "Bạn có chắc muốn xoá khóa học này? Hành động này sẽ xoá toàn bộ thông tin đã tạo và không thể hoàn tác." : "Khóa học này đã có học viên tham gia. Vui lòng gỡ học viên ra khỏi trước khi thực hiện thao tác này."}
                action={
                    <>
                        <Button variant="contained" color="error" onClick={handleDeleteElearningCourse} disabled={!isAllowDelete}>
                            Xoá lớp học
                        </Button>
                    </>
                }
            />
        </>
    );
}
