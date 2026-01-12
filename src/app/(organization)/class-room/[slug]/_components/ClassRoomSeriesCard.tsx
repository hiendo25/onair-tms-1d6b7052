import { LocationOnOutlined, VideocamOutlined } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { ClockIcon } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Image from "next/image";

import { FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CLASS_SESSION_TYPE, ROOM_PROVIDERS } from "../_constants";
import { buildScheduleDisplay } from "../_utils/classRoomSchedule.utils";

import ClassRoomProgressBar from "./ClassRoomProgressBar";
import JoinButton from "./JoinButton";

type ClassRoomSession = NonNullable<ClassRoomDetailWithProgress["sessions"]>[number];

interface ClassRoomSeriesCardProps {
  session: ClassRoomSession;
  thumbnail?: string;
  isAdminView?: boolean;
  index: number;
  onSelectDetail: (session: ClassRoomSession, index: number) => void;
  onClickJoin: (sessionId: string) => void;
  isFromLearningPath?: boolean;
}

const CARD_WIDTH = { xs: 260, sm: 280, md: 300 };
const IMAGE_HEIGHT = 152;
const CARD_RADIUS = 16;
const IMAGE_RADIUS = 12;
const BADGE_BG_COLOR = "rgba(0, 0, 0, 0.78)";
const BADGE_TEXT_COLOR = "#C7FF4B";
const CARD_SHADOW = "0px 8px 24px rgba(15, 23, 42, 0.08)";
const IMAGE_SHADOW = "0px 6px 16px rgba(15, 23, 42, 0.12)";

const ClassRoomSeriesCard = ({
  session,
  thumbnail,
  isAdminView,
  index,
  onSelectDetail,
  onClickJoin,
  isFromLearningPath,
}: ClassRoomSeriesCardProps) => {
  const scheduleDisplay = buildScheduleDisplay({
    startAt: session.start_at,
    endAt: session.end_at,
    weeklySchedule: session.weekly_schedule,
    isFromLearningPath,
    sameDayDateFormat: FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR,
    dateTimeFormat: FORMAT_DATE_TIME_SHORTER,
    timeFormat: FORMAT_TIME,
  });
  const progressValue = session.progress?.progressPercentage ?? 0;

  const handleSelectDetail = () => {
    onSelectDetail(session, index);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: CARD_WIDTH,
        borderRadius: `${CARD_RADIUS}px`,
        borderColor: (theme) => theme.palette.divider,
        boxShadow: CARD_SHADOW,
        bgcolor: "common.white",
        flexShrink: 0,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box
          position="relative"
          sx={{
            width: "100%",
            height: IMAGE_HEIGHT,
            borderRadius: `${IMAGE_RADIUS}px`,
            overflow: "hidden",
            boxShadow: IMAGE_SHADOW,
          }}
        >
          <Image
            src={thumbnail || ""}
            alt={session.title || "thumbnail"}
            fill
            sizes="(max-width: 600px) 260px, (max-width: 900px) 280px, 300px"
            style={{ objectFit: "cover" }}
          />

          <Box
            position="absolute"
            bottom={8}
            right={8}
            bgcolor={BADGE_BG_COLOR}
            sx={{
              px: 1.25,
              py: 0.5,
              borderRadius: "12px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: BADGE_TEXT_COLOR,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.2,
              }}
            >
              Buổi học {index + 1}
            </Typography>
          </Box>

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              width: "100%",
              height: "100%",
              borderRadius: `${IMAGE_RADIUS}px`,
              transition: "opacity 0.3s",
              opacity: 0,
              "&:hover": {
                opacity: 1,
              },
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleSelectDetail}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
              }}
              onClick={handleSelectDetail}
            >
              Xem chi tiết
            </Button>
          </Box>
        </Box>

        <Stack mt={1.5} gap={1}>
          <Typography
            maxWidth="100%"
            className="line-clamp-2 text-sm font-semibold"
            textOverflow={"ellipsis"}
            sx={{ fontSize: 18, lineHeight: 1.4 }}
          >
            {session.title}
          </Typography>

          {isFromLearningPath && <ClassRoomProgressBar value={progressValue} size="xs" />}

          <Stack direction="row" gap={1} alignItems="center">
            <ClockIcon sx={{ width: 20, height: 20, color: "text.secondary" }} />
            {scheduleDisplay.type === "same-day" ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  {scheduleDisplay.primaryLabel},
                </Typography>
                <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                  {scheduleDisplay.secondaryLabel}
                </Typography>
              </>
            ) : scheduleDisplay.type === "weekly" ? (
              <Stack direction="column" alignItems="self-start" gap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {scheduleDisplay.primaryLabel}
                </Typography>
                {/* <Typography variant="caption" color="text.secondary">
                  {scheduleDisplay.secondaryLabel}
                </Typography> */}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                {scheduleDisplay.primaryLabel}
              </Typography>
            )}
          </Stack>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            {session.session_type !== CLASS_SESSION_TYPE.OFFLINE ? (
              <>
                <VideocamOutlined sx={{ width: 20, height: 20, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  maxWidth="100%"
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
                  maxWidth="100%"
                  className="line-clamp-1"
                  textOverflow={"ellipsis"}
                  color="text.secondary"
                >
                  {session.location || "Địa điểm chưa được cập nhật"}
                </Typography>
              </>
            )}
          </Stack>

          <Box
            mt={2}
            sx={{
              "& .MuiButton-root": {
                width: "100%",
                borderRadius: "12px",
                py: 1.1,
                fontWeight: 700,
                fontSize: 16,
                textTransform: "none",
              },
            }}
          >
            <JoinButton
              isAdminView={isAdminView}
              onClick={() => onClickJoin(session.id)}
              disabled={dayjs().isAfter(dayjs(session.end_at))}
              session_type={session.session_type}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ClassRoomSeriesCard;
