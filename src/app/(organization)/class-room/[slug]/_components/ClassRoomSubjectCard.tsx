import { AccessTime, MenuBook as MenuBookIcon, OndemandVideo, PersonOutline } from "@mui/icons-material";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { PATHS } from "@/constants/path.constant";
import { FORMAT_DATE_TIME_SHORTER } from "@/lib";
import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CLASSROOM_DETAIL_TEXT } from "../_constants";
import { formatWeeklyScheduleLabel } from "../_utils/classRoomSchedule.utils";

import ClassRoomProgressBar from "./ClassRoomProgressBar";

type CoursePeriod = NonNullable<
  NonNullable<ClassRoomDetailWithProgress["sessions"]>[number]["courses_period"]
>[number];

interface ClassRoomSubjectCardProps {
  coursePeriod: CoursePeriod;
  classRoomSlug?: string;
  isFromLearningPath?: boolean;
  classRoomEndAt?: string | null;
}

const getTeacherName = (teacher: CoursePeriod["teacher"]): string => {
  return teacher?.profile?.full_name || "Chưa có giáo viên";
};

const CARD_MIN_WIDTH = { xs: 260, sm: 280, md: 320 };
const CARD_RADIUS = 16;

export const ClassRoomSubjectCard = ({ coursePeriod, classRoomSlug, isFromLearningPath, classRoomEndAt }: ClassRoomSubjectCardProps) => {
  const weeklyScheduleLabel = isFromLearningPath ? formatWeeklyScheduleLabel(coursePeriod.weekly_schedule) : null;
  const scheduleLabel = weeklyScheduleLabel
    ? weeklyScheduleLabel
    : coursePeriod.start_at
      ? dayjs(coursePeriod.start_at).format(FORMAT_DATE_TIME_SHORTER)
      : CLASSROOM_DETAIL_TEXT.SCHEDULE_FALLBACK;
  const teacherName = getTeacherName(coursePeriod.teacher);
  const courseId = coursePeriod.course.id || "";
  const detailHref = isFromLearningPath
    ? PATHS.MY_LEARNING_PATHS.LEARNING_SCREEN(courseId)
    : PATHS.CLASSROOMS.LEARNING_SCREEN(classRoomSlug!, courseId);

  const sectionCount = coursePeriod.course?.sections_count?.[0]?.count ?? 0;
  const lessonCount =
    coursePeriod.course?.lessons_count?.reduce(
      (sum, lesson) => sum + (lesson.lessons.reduce((s, l) => s + (l.count || 0), 0) || 0),
      0,
    ) ?? 0;
  const progressValue = coursePeriod.course?.progress?.progressPercentage ?? 0;
  const shouldShowProgress = Boolean(coursePeriod.course?.progress);

  // Check if classroom has ended (is in the past)
  const isClassRoomEnded = classRoomEndAt ? dayjs(classRoomEndAt).isBefore(dayjs()) : false;

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: CARD_MIN_WIDTH,
        borderRadius: `${CARD_RADIUS}px`,
        borderColor: "divider",
        textDecoration: "none",
        color: "inherit",
        flexShrink: 0,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        opacity: isClassRoomEnded ? 0.6 : 1,
        cursor: isClassRoomEnded ? "not-allowed" : "pointer",
        pointerEvents: isClassRoomEnded ? "none" : "auto",
        "&:hover": {
          borderColor: isClassRoomEnded ? "divider" : "primary.light",
        },
      }}
      component={isClassRoomEnded ? "div" : "a"}
      href={isClassRoomEnded ? undefined : detailHref}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1" fontWeight={700} className="line-clamp-2" sx={{ lineHeight: 1.35 }}>
            {coursePeriod.course?.title || "Chưa có tên môn học"}
          </Typography>
          {shouldShowProgress ? <ClassRoomProgressBar value={progressValue} size="sm" /> : null}

          <Stack direction="row" spacing={0.75} alignItems="center">
            <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {scheduleLabel}
              </Typography>
              {weeklyScheduleLabel ? (
                <Typography variant="caption" color="text.secondary">
                  {CLASSROOM_DETAIL_TEXT.WEEKLY_LABEL}
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <MenuBookIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {sectionCount} học phần
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <OndemandVideo sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {lessonCount} bài giảng
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" mt={0.5}>
            <PersonOutline sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              GV {teacherName}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
