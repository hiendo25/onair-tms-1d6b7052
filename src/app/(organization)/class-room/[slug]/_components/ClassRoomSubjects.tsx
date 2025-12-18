import { useMemo } from "react";
import { AccessTime, MenuBook as MenuBookIcon, OndemandVideo } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { PATHS } from "@/constants/path.constant";
import { FORMAT_DATE_TIME_SHORTER } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";

type CoursePeriod = NonNullable<
  NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"][number]["courses_period"]
>[number];

interface ClassRoomSubjectsProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}

const getTeacherName = (teacher: CoursePeriod["teacher"]): string => {
  return teacher?.profile?.full_name || "Chưa có giáo viên";
};

const getTeacherAvatar = (teacher: CoursePeriod["teacher"]): string | undefined => {
  return teacher?.profile?.avatar || undefined;
};

const SubjectCard = ({ coursePeriod }: { coursePeriod: CoursePeriod }) => {
  const formattedStartDate = dayjs(coursePeriod.start_at).format(FORMAT_DATE_TIME_SHORTER);
  const teacherName = getTeacherName(coursePeriod.teacher);
  const teacherAvatar = getTeacherAvatar(coursePeriod.teacher);

  const sectionCount = coursePeriod.course?.sections_count?.[0]?.count ?? 0;
  const lessonCount =
    coursePeriod.course?.lessons_count?.reduce(
      (sum, lesson) => sum + (lesson.lessons.reduce((s, l) => s + (l.count || 0), 0) || 0),
      0,
    ) ?? 0;

  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      component={"a"}
      href={PATHS.STUDENTS.LEARNINNG(coursePeriod.course.id || "")}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={600} noWrap>
            {coursePeriod.course?.title || "Chưa có tên môn học"}
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {formattedStartDate}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <MenuBookIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {sectionCount} học phần
              </Typography>
            </Stack>

            <Box component="span" sx={{ width: 4, height: 4, bgcolor: "text.secondary", borderRadius: "50%" }} />

            <Stack direction="row" spacing={0.5} alignItems="center">
              <OndemandVideo sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {lessonCount} bài giảng
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Avatar src={teacherAvatar} alt={teacherName} sx={{ width: 24, height: 24 }}>
              {!teacherAvatar && teacherName.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {teacherName}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function ClassRoomSubjects({ data }: ClassRoomSubjectsProps) {
  const coursePeriods = useMemo(() => {
    if (data.sessions.length !== 1) return [];

    return data.sessions[0]?.courses_period || [];
  }, [data.sessions]);

  if (coursePeriods.length === 0) return null;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} alignItems="center">
        <MenuBookIcon sx={{ fontSize: 24 }} />
        <Typography variant="h5" fontWeight={600}>
          Môn học trong lớp
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {coursePeriods.map((coursePeriod) => (
          <SubjectCard key={coursePeriod.id} coursePeriod={coursePeriod} />
        ))}
      </Box>
    </Stack>
  );
}
