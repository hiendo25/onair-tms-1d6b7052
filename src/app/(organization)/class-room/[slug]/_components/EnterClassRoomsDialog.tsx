import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import { FORMAT_DATE_LABEL_WITHOUT_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { CloseIcon } from "@/shared/assets/icons";
import { Image } from "@/shared/ui/Image";
import { buildScheduleDisplay } from "../_utils/classRoomSchedule.utils";

import JoinButton from "./JoinButton";

const EnterClassRoomsDialog = ({
  open,
  onClose,
  thumbnail,
  isAdminView = false,
  isFromLearningPath,
  sessions = [],
  onClickJoin,
}: {
  open: boolean;
  onClose: () => void;
  thumbnail?: string;
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
  sessions: NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"];
  onClickJoin: (sessionId: string) => void;
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ px: 3, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Vào lớp học
          </Typography>
          <IconButton aria-label="close-enter-classrooms-dialog" onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {sessions.map((session, index) => {
            const scheduleDisplay = buildScheduleDisplay({
              startAt: session.start_at,
              endAt: session.end_at,
              weeklySchedule: session.weekly_schedule,
              isFromLearningPath,
              sameDayDateFormat: FORMAT_DATE_LABEL_WITHOUT_YEAR,
              dateTimeFormat: FORMAT_DATE_TIME_SHORTER,
              timeFormat: FORMAT_TIME,
            });

            const scheduleLabel =
              scheduleDisplay.type === "same-day" &&
                scheduleDisplay.dateRange?.timeRangeLabel &&
                scheduleDisplay.dateRange?.dateLabel
                ? `${scheduleDisplay.dateRange.timeRangeLabel}, ${scheduleDisplay.dateRange.dateLabel}`
                : scheduleDisplay.type === "weekly" && scheduleDisplay.secondaryLabel
                  ? `${scheduleDisplay.primaryLabel} (${scheduleDisplay.secondaryLabel})`
                  : scheduleDisplay.primaryLabel;

            return (
              <Stack
                key={session.id}
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <Box
                  sx={{
                    width: { xs: "100%", sm: 152 },
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={thumbnail}
                    alt={session.title ?? `Buổi học ${index + 1}`}
                    ratio="16/9"
                    className="rounded-lg"
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Chip label={`Lớp học ${index + 1}`} color="primary" size="small" />

                  <Typography variant="body2" fontWeight={500}>
                    {scheduleLabel}
                  </Typography>
                  <Typography variant="subtitle1" color="textPrimary">
                    {session.title}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    display: { xs: "block", sm: "inline-flex" },
                    alignSelf: { xs: "stretch", sm: "center" },
                  }}
                >
                  <JoinButton
                    onClick={() => {
                      onClickJoin(session.id);
                    }}
                    disabled={dayjs().isAfter(dayjs(session.end_at))}
                    isAdminView={isAdminView}
                    session_type={session.session_type}
                    fullWidth
                  />
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnterClassRoomsDialog;
