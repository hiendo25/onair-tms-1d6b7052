import { FORMAT_DATE_LABEL_WITHOUT_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { CloseIcon } from "@/shared/assets/icons";
import { Image } from "@/shared/ui/Image";
import { QrCode } from "@mui/icons-material";
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
import JoinButton from "./JoinButton";

const EnterClassRoomsDialog = ({
  open,
  onClose,
  thumbnail,
  isOnline,
  isAdminView = false,
  sessions = [],
  onClickJoin,
}: {
  open: boolean;
  onClose: () => void;
  thumbnail?: string;
  isOnline: boolean;
  isAdminView?: boolean;
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
          {sessions.map((session, index) => (
            <Stack key={session.id} flexDirection="row" alignItems="center" gap={2}>
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
                  {dayjs(session.start_at).isSame(dayjs(session.end_at), "day")
                    ? `${dayjs(session.start_at).format(FORMAT_TIME)} - ${dayjs(session.end_at).format(FORMAT_TIME)}, 
                    ${dayjs(session.start_at).format(FORMAT_DATE_LABEL_WITHOUT_YEAR)}`
                    : `${dayjs(session.start_at).format(FORMAT_DATE_TIME_SHORTER)} - 
                    ${dayjs(session.end_at).format(FORMAT_DATE_TIME_SHORTER)}`}
                </Typography>
                <Typography variant="subtitle1" color="textPrimary">
                  {session.title}
                </Typography>
              </Box>

              <JoinButton
                isOnline={isOnline}
                onClick={() => { onClickJoin(session.id); }}
                disabled={dayjs().isAfter(dayjs(session.end_at))}
                isAdminView={isAdminView}
              />
            </Stack>
          ))}
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
