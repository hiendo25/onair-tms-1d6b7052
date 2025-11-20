import * as React from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

import { panelSx } from "./mock/panelSx";
import Link from "next/link";
import { PATHS } from "@/constants/path.contstants";
import dayjs from "dayjs";
import { useGetClassRoomsPriorityQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { fDate } from "@/lib";
import { EmployeeWithProfileDto } from "@/types/dto/classRooms/classRoom.dto";

type DashboardCourseRow = {
  id: string;
  label: string;
  name: string;
  mode: "Trực tuyến (Online)" | "Trực tiếp (Offline)";
  students: number;
  teachers: EmployeeWithProfileDto[];
  start_at: Date;
  end_at: Date;
};

const CourseTable = () => {
  const user = useUserOrganization((state) => state.data);

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

    return { ...baseFilters, employeeId: user.id, organizationId: user.organization?.id };
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
          sessions.flatMap(s => s.teacherAssignments ?? [])
            .map(a => [a?.teacher?.id, a.teacher])
        ).values()
      ];

      const sessionForMode = sessions.find((session) => session.is_online !== null && session.is_online !== undefined);
      const isOnline = sessionForMode?.is_online ?? sessions[0]?.is_online ?? false;

      return {
        id: classRoom.id,
        label: classRoom.room_type === "multiple" ? "Chuỗi" : "Đơn",
        name: classRoom.title ?? "Lớp học",
        mode: isOnline ? "Trực tuyến (Online)" : "Trực tiếp (Offline)",
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
          <Button variant="outlined" size="small" color="primary">
            Tạo khảo sát
          </Button>
          <Link href={PATHS.CLASSROOMS.ROOT}>
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
            gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr 1fr",
            bgcolor: "#f8fafc",
            px: 2,
            py: 1.5,
            gap: 1,
          }}
        >
          {["Tên lớp học", "Loại lớp học", "Học viên", "Giảng viên", "Thời gian diễn ra"].map(
            (col) => (
              <Typography
                key={col}
                variant="body2"
                color="text.secondary"
                fontWeight={700}
              >
                {col}
              </Typography>
            ),
          )}
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
              <Box
                key={row.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 0.8fr 1.2fr 1fr",
                  px: 2,
                  py: 1.75,
                  gap: 1,
                  alignItems: "center",
                  bgcolor: "#fff",
                }}
              >
                <Stack spacing={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={row.label}
                      size="small"
                      sx={{
                        bgcolor: row.mode === "Trực tuyến (Online)" ? "#FF662B1F" : "#0050FF29",
                        color: row.mode === "Trực tuyến (Online)" ? "#9A3E1A" : "#0038B2",
                        height: 24,
                        "& .MuiChip-label": {
                          color: "unset",
                        },
                      }}
                    />
                  </Stack>
                  <Typography className="font-normal text-xs text-[#212B36] line-clamp-2">
                    {row.name}
                  </Typography>
                </Stack>

                <Chip
                  label={row.mode}
                  size="small"
                  sx={{
                    bgcolor: row.mode === "Trực tuyến (Online)" ? "#FF662B29" : "#9723F93D",
                    color: row.mode === "Trực tuyến (Online)" ? "#9A3E1A" : "#6E05C6",
                    height: 26,
                    justifySelf: "flex-start",
                    "& .MuiChip-label": {
                      color: "unset",
                    },
                  }}
                />

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <PeopleAltOutlinedIcon className="w-4 h-4" />
                  <Typography className="font-normal text-xs text-[#212B36]">
                    {row.students}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AvatarGroup sx={{ justifyContent: "center" }} variant="circular" max={4}>
                    {row.teachers.map((teacher) => {
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
                </Stack>

                <Stack spacing={0.5}>
                  <Typography className="font-normal text-xs text-[#212B36]">
                    {fDate(row.start_at)}
                  </Typography>
                  <Typography className="font-normal text-xs text-[#212B36]">
                    {fDate(row.end_at)}
                  </Typography>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default CourseTable;
