import * as React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import { panelSx } from "./mock/panelSx";
import Link from "next/link";
import { PATHS } from "@/constants/path.contstants";
import dayjs from "dayjs";
import { useGetClassRoomsPriorityQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { fDateTime, FORMAT_DATE_TIME_SHORTER } from "@/lib";
import { EmployeeWithProfileDto } from "@/types/dto/classRooms/classRoom.dto";

type DashboardCourseRow = {
  id: string;
  slug?: string | null;
  label: string;
  name: string;
  mode: "Online" | "Offline" | "Live";
  students: number;
  teachers: EmployeeWithProfileDto[];
  start_at: string | null;
  end_at: string | null;
};

const CourseTable = () => {
  const user = useUserOrganization((state) => state.data);
  const formatDateLabel = (date?: string | null) => fDateTime(date, FORMAT_DATE_TIME_SHORTER) ?? "Chưa có lịch";

  const monthRange = React.useMemo(
    () => ({
      from: dayjs().startOf("month").toISOString(),
      to: dayjs().endOf("month").toISOString(),
    }),
    [],
  );

  const queryInput = React.useMemo(() => {
    if (!user) {
      return undefined;
    }

    const baseFilters = {
      from: monthRange.from,
      to: monthRange.to,
      limit: 7,
      orderField: "start_at",
      orderBy: "asc" as const,
    };

    if (user.employeeType === "admin") {
      return user.organization?.id
        ? { ...baseFilters, organizationId: user.organization.id }
        : undefined;
    }

    return { ...baseFilters, employeeId: undefined, organizationId: user.organization?.id };
  }, [monthRange.from, monthRange.to, user]);

  const { data: classRoomsResult, isLoading, isError, refetch } = useGetClassRoomsPriorityQuery(queryInput ?? {});

  const courseRows = React.useMemo<DashboardCourseRow[]>(() => {
    if (!classRoomsResult?.data) {
      return [];
    }

    return classRoomsResult.data.map((classRoom) => {
      const sessions = [...(classRoom.class_sessions ?? [])].sort((a, b) => {
        const startA = a.start_at ? dayjs(a.start_at).valueOf() : 0;
        const startB = b.start_at ? dayjs(b.start_at).valueOf() : 0;
        return startA - startB;
      });

      const teachers = [
        ...new Map(
          sessions
            .flatMap((session) => session.teacherAssignments ?? [])
            .map((assignment) => [assignment?.teacher?.id, assignment.teacher]),
        ).values(),
      ].filter(Boolean) as EmployeeWithProfileDto[];

      const sessionForMode = sessions.find((session) => session.session_type !== null && session.session_type !== undefined);
      const mode = sessionForMode?.session_type === "online" ? "Online" : sessionForMode?.session_type === "offline" ? "Offline" : "Live";

      return {
        id: classRoom.id,
        slug: classRoom.slug,
        label: classRoom.room_type === "multiple" ? "Chuỗi" : "Đơn",
        name: classRoom.title ?? "Lớp học",
        mode,
        students: Number(classRoom.studentCount?.[0]?.count ?? 0),
        teachers: teachers,
        start_at: classRoom.start_at,
        end_at: classRoom.end_at,

      };
    });
  }, [classRoomsResult?.data]);

  return (
    <Paper sx={{ ...panelSx, p: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" fontWeight={600}>
          Lớp học trong tháng
        </Typography>
        <Stack direction="row" spacing={1}>
          <Link href={PATHS.SURVEYS.CREATE}>
            <Button variant="outlined" size="small" color="primary">
              Tạo khảo sát
            </Button>
          </Link>
          <Link href={PATHS.COURSES.CREATE}>
            <Button variant="outlined" size="small" color="primary">
              Tạo môn học
            </Button>
          </Link>
          <Link href={PATHS.CLASSROOMS.ROOT}>
            <Button variant="contained" size="small">
              Tạo lớp học
            </Button>
          </Link>
        </Stack>
      </Stack>

      <Box
        sx={{
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid #e7ebf3",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr",
            bgcolor: "#f8fafc",
            px: 2,
            py: 1.5,
            gap: 1,
          }}
        >
          {["Tên lớp học", "Loại lớp học", "Học viên", "Thời gian diễn ra"].map((col) => (
            <Typography
              key={col}
              variant="body2"
              color="text.secondary"
              fontWeight={700}
            >
              {col}
            </Typography>
          ))}
        </Box>

        <Stack spacing={0} divider={<Divider />}>
          {isLoading ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ px: 2, py: 2 }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Đang tải danh sách lớp học...
              </Typography>
            </Stack>
          ) : isError ? (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 2 }}
            >
              <Typography variant="body2" color="error">
                Không thể tải dữ liệu lớp học. Vui lòng thử lại.
              </Typography>
              <Button variant="outlined" size="small" onClick={() => refetch()}>
                Thử lại
              </Button>
            </Stack>
          ) : courseRows.length === 0 ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Không có lớp học nào trong tháng này.
              </Typography>
            </Box>
          ) : (
            courseRows.map((row) => (
              <Link
                key={row.id}
                href={PATHS.CLASSROOMS.DETAIL_CLASSROOM(row.slug || row.id)}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr",
                    px: 2,
                    py: 1.75,
                    gap: 1,
                    alignItems: "center",
                    bgcolor: "#fff",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, transform 0.1s ease",
                    "&:hover": {
                      bgcolor: "#f5f8ff",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack spacing={0.6}>
                    {/* <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={row.label}
                        size="small"
                        sx={{
                          bgcolor: row.label === "Chuỗi" ? "#FF662B1F" : "#0050FF29",
                          color: row.label === "Chuỗi" ? "#9A3E1A" : "#0038B2",
                          height: 24,
                          "& .MuiChip-label": {
                            color: "unset",
                          },
                        }}
                      />
                    </Stack> */}
                    <Typography className="font-normal text-sm text-[#212B36] line-clamp-2">
                      {row.name}
                    </Typography>
                  </Stack>

                  <Chip
                    label={`${row.mode} - ${row.label}`}
                    size="small"
                    sx={{
                      height: 26,
                      justifySelf: "flex-start",
                      bgcolor:
                        row.mode === "Online"
                          ? "rgba(155, 206, 255, 0.28) "     // LIVE - pastel red
                          : row.mode === "Offline"
                            ? "rgba(255, 179, 71, 0.28)"     // OFFLINE - pastel orange
                            : "rgba(255, 107, 107, 0.28)",   // OTHER - pastel blue
                      color:
                        row.mode === "Online"
                          ? "#64A9FF"
                          : row.mode === "Offline"
                            ? "#FFB347"
                            : "#FF6B6B",
                      fontWeight: 600,
                      "& .MuiChip-label": {
                        color: "inherit",
                      },
                    }}
                  />

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PeopleAltOutlinedIcon className="w-4 h-4" />
                    <Typography className="font-normal text-xs text-[#212B36]">
                      {row.students}
                    </Typography>
                  </Stack>

                  <Stack spacing={0.5}>
                    <Typography className="font-normal text-xs text-[#212B36]">
                      {formatDateLabel(row.start_at)}
                    </Typography>
                    <Typography className="font-normal text-xs text-[#212B36]">
                      {formatDateLabel(row.end_at)}
                    </Typography>
                  </Stack>
                </Box>
              </Link>
            ))
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default CourseTable;
