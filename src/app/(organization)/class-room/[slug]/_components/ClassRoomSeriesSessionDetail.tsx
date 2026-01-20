import {
  AccessTimeOutlined,
  ChevronRightRounded,
  Close,
  LocationOnOutlined,
  LockOutlined,
  MenuBook,
  PersonOutline,
  VideocamOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";

import { PATHS } from "@/constants/path.constant";
import { FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CLASS_SESSION_TYPE, CLASSROOM_DETAIL_TEXT, ROOM_PROVIDERS } from "../_constants";
import { buildScheduleDisplay, formatWeeklyScheduleLabel } from "../_utils/classRoomSchedule.utils";

import ClassRoomProgressBar from "./ClassRoomProgressBar";
import JoinButton from "./JoinButton";

type ClassRoomSession = NonNullable<ClassRoomDetailWithProgress["sessions"]>[number];
type ClassRoomSessionWithIndex = ClassRoomSession & { index: number };
type CoursePeriod = NonNullable<ClassRoomSession["courses_period"]>[number];

interface ClassRoomSeriesSessionDetailProps {
  session: ClassRoomSessionWithIndex | null;
  thumbnail?: string;
  classRoomTitle?: string;
  classRoomSlug?: string;
  isAdminView?: boolean;
  open: boolean;
  onClose: () => void;
  onClickJoin: (sessionId: string) => void;
  isFromLearningPath?: boolean;
}

const COVER_HEIGHT = 280;
const COVER_RADIUS = 14;
const DIALOG_RADIUS = 20;
const SERIES_BADGE_BG = "rgba(0, 80, 255, 0.12)";
const SERIES_BADGE_COLOR = "#1D4ED8";
const SESSION_BADGE_BG = "#111827";
const COURSE_ITEM_BG = "rgba(148, 163, 184, 0.08)";
const COURSE_ICON_BG = "rgba(59, 130, 246, 0.08)";

const getTeacherName = (coursePeriod: CoursePeriod): string => {
  return coursePeriod.teacher?.profile?.full_name || "Chưa có giáo viên";
};

const getCourseCountLabel = (coursePeriod: CoursePeriod): string => {
  const sectionCount = coursePeriod.course?.sections_count?.[0]?.count ?? 0;
  const lessonCount =
    coursePeriod.course?.lessons_count?.reduce(
      (sum, lesson) => sum + (lesson.lessons.reduce((innerSum, item) => innerSum + (item.count || 0), 0) || 0),
      0,
    ) ?? 0;

  return `${sectionCount} học phần - ${lessonCount} bài giảng`;
};

const getCourseScheduleLabel = (coursePeriod: CoursePeriod): string => {
  const weeklyLabel = formatWeeklyScheduleLabel(coursePeriod.weekly_schedule);
  if (weeklyLabel) {
    return weeklyLabel;
  }

  if (!coursePeriod.start_at || !coursePeriod.end_at) {
    return CLASSROOM_DETAIL_TEXT.SCHEDULE_FALLBACK;
  }

  const startAt = dayjs(coursePeriod.start_at);
  const endAt = dayjs(coursePeriod.end_at);
  if (!startAt.isValid() || !endAt.isValid()) {
    return CLASSROOM_DETAIL_TEXT.SCHEDULE_FALLBACK;
  }

  return `${startAt.format(FORMAT_TIME)} - ${endAt.format(FORMAT_TIME)}`;
};

const getSessionScheduleLabel = (scheduleDisplay: ReturnType<typeof buildScheduleDisplay>): string => {
  if (scheduleDisplay.type === "weekly") {
    return scheduleDisplay.primaryLabel;
  }

  if (scheduleDisplay.type === "same-day" && scheduleDisplay.secondaryLabel) {
    return `${scheduleDisplay.secondaryLabel}, ${scheduleDisplay.primaryLabel}`;
  }

  return scheduleDisplay.primaryLabel;
};

const ClassRoomSeriesSessionDetail = ({
  session,
  thumbnail,
  classRoomTitle,
  classRoomSlug,
  open,
  isAdminView,
  onClose,
  onClickJoin,
  isFromLearningPath,
}: ClassRoomSeriesSessionDetailProps) => {
  if (!session) return null;

  const coursePeriods = session.courses_period ?? [];
  const shouldShowProgress = Boolean(isFromLearningPath);

  const scheduleDisplay = buildScheduleDisplay({
    startAt: session.start_at,
    endAt: session.end_at,
    weeklySchedule: session.weekly_schedule,
    isFromLearningPath,
    sameDayDateFormat: FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR,
    dateTimeFormat: FORMAT_DATE_TIME_SHORTER,
    timeFormat: FORMAT_TIME,
  });

  const dialogTitle = classRoomTitle || session.title || "Chi tiết lớp học";
  const weeklySessionLabel = formatWeeklyScheduleLabel(session.weekly_schedule);
  const sessionScheduleLabel = weeklySessionLabel || getSessionScheduleLabel(scheduleDisplay);

  const getCourseDetailHref = (courseId: string) => {
    return isFromLearningPath
      ? PATHS.MY_LEARNING_PATHS.LEARNING_SCREEN(courseId)
      : PATHS.CLASSROOMS.LEARNING_SCREEN(classRoomSlug!, courseId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: `${DIALOG_RADIUS}px`, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {dialogTitle}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 2.5, py: 2 }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: COVER_HEIGHT,
            borderRadius: `${COVER_RADIUS}px`,
            overflow: "hidden",
          }}
        >
          <Image src={thumbnail || ""} alt={session.title || "thumbnail"} fill style={{ objectFit: "cover" }} />
        </Box>
        <Stack spacing={2} mt={2}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography
              variant="caption"
              sx={{
                bgcolor: SERIES_BADGE_BG,
                color: SERIES_BADGE_COLOR,
                px: 1,
                py: 0.5,
                borderRadius: "999px",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              Lớp học chuỗi
            </Typography>
            <Typography variant="body2" color="text.primary">
              {sessionScheduleLabel}
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography
              variant="caption"
              sx={{
                bgcolor: SESSION_BADGE_BG,
                color: "common.white",
                px: 1,
                py: 0.5,
                borderRadius: "999px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              Buổi {session.index + 1}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {session.title}
            </Typography>
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap={0.75}>
            {session.session_type !== CLASS_SESSION_TYPE.OFFLINE ? (
              <>
                <VideocamOutlined sx={{ width: 20, height: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  maxWidth={240}
                  className="line-clamp-1"
                  textOverflow={"ellipsis"}
                  color="text.secondary"
                >
                  Trực tiếp trên {ROOM_PROVIDERS?.[session.channel_provider || "zoom"]?.label || "Nền tảng khác"}
                </Typography>
              </>
            ) : (
              <>
                <LocationOnOutlined sx={{ width: 20, height: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  maxWidth={240}
                  className="line-clamp-1"
                  textOverflow={"ellipsis"}
                  color="text.secondary"
                >
                  {session.location || "Địa điểm chưa được cập nhật"}
                </Typography>
              </>
            )}
          </Stack>
          {coursePeriods.length > 0 ? (
            <Stack
              spacing={1.5}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.5,
                bgcolor: COURSE_ITEM_BG,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                Môn học trong lớp
              </Typography>
              <Stack spacing={1}>
                {coursePeriods.map((coursePeriod) => {
                  const courseId = coursePeriod.course?.id;
                  const courseHref = courseId ? getCourseDetailHref(courseId) : undefined;
                  const isClickable = Boolean(courseHref);
                  const teacherName = getTeacherName(coursePeriod);
                  const courseCountLabel = getCourseCountLabel(coursePeriod);
                  const courseScheduleLabel = getCourseScheduleLabel(coursePeriod);

                  return (
                    <Stack
                      key={coursePeriod.id}
                      spacing={1}
                      direction="row"
                      alignItems="center"
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2.5,
                        p: 1.5,
                        bgcolor: "common.white",
                        textDecoration: "none",
                        color: "inherit",
                        cursor: isClickable ? "pointer" : "default",
                        boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.06)",
                        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                        "&:hover": isClickable
                          ? {
                            borderColor: "primary.light",
                            boxShadow: "0px 12px 24px rgba(15, 23, 42, 0.12)",
                            transform: "translateY(-1px)",
                          }
                          : undefined,
                      }}
                      component={isClickable ? "a" : "div"}
                      href={courseHref}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: COURSE_ICON_BG,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MenuBook sx={{ fontSize: 22, color: "primary.main" }} />
                      </Box>
                      <Stack spacing={0.5} flex={1}>
                        <Typography variant="subtitle2" fontWeight={700} className="line-clamp-1">
                          {coursePeriod.course?.title || "Chưa có tên môn học"}{" "}
                          <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
                            ({courseCountLabel})
                          </Box>
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTimeOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {courseScheduleLabel}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PersonOutline sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                              GV - {teacherName}
                            </Typography>
                          </Stack>
                        </Stack>
                        {shouldShowProgress ? (
                          <ClassRoomProgressBar
                            value={coursePeriod.course?.progress?.progressPercentage ?? 0}
                            size="xs"
                          />
                        ) : null}
                      </Stack>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isClickable ? "text.primary" : "text.disabled",
                          flexShrink: 0,
                        }}
                      >
                        {isClickable ? <ChevronRightRounded /> : <LockOutlined fontSize="small" />}
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 2, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          Đóng
        </Button>
        <JoinButton
          isAdminView={isAdminView}
          onClick={() => onClickJoin(session.id)}
          disabled={dayjs().isAfter(dayjs(session.end_at))}
          session_type={session.session_type}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ClassRoomSeriesSessionDetail;
