"use client";
import { FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { LocationOnOutlined, VideocamOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { ClockIcon } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ROOM_PROVIDERS } from "../_constants";
import JoinButton from "./JoinButton";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

const ClassRoomSerieCard = ({
  session,
  thumbnail,
  isAdminView,
  index,
  setSelectedSession,
  onClickJoin,
}: {
  session: NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"][number];
  thumbnail?: string;
  isAdminView?: boolean;
  index: number;
  setSelectedSession: React.Dispatch<
    React.SetStateAction<
      | (NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"][number] & {
          index: number;
        })
      | null
    >
  >;
  onClickJoin: (sessionId: string) => void;
}) => {
  const isOnline = session.is_online;

  // const handleSelectSession = (sessionId: string) => {
  //   if (!isOnline) {
  //     // handle QR code
  //     return;
  //   }
  //   return router.push(PATHS.CLASSROOMS.COUNTDOWN_CLASSROOM(slug || "", sessionId));
  // };

  return (
    <Card variant="outlined" sx={{ px: "6px", pt: "6px", pb: "12px", minWidth: "214px", flexShrink: 0 }}>
      <CardContent>
        <Box position="relative" width={214} height={120}>
          <Image src={thumbnail || ""} alt={session.title || "thumbnail"} fill style={{ borderRadius: 8 }} />

          <Box
            position="absolute"
            bottom={4}
            right={4}
            bgcolor="rgba(0,0,0)"
            sx={{
              borderTopLeftRadius: "12px",
              borderBottomRightRadius: "12px",
              borderTopRightRadius: "4px",
              borderBottomLeftRadius: "4px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                background: "linear-gradient(277.06deg, #26FFE9 -12.36%, #E8FF3B 100.84%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                px: 1,
              }}
            >
              Lớp học {index + 1}
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
              borderRadius: 8,
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
            onClick={() => setSelectedSession({ ...session, index })}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
              }}
              onClick={() => setSelectedSession({ ...session, index })}
            >
              Xem chi tiết
            </Button>
          </Box>
        </Box>
        <Stack mt={1} px={0.4375} gap={0.5}>
          <Typography
            variant="body2"
            fontWeight="600"
            maxWidth={200}
            className="line-clamp-2"
            textOverflow={"ellipsis"}
          >
            {session.title}
          </Typography>
          <Stack direction="row" gap={0.5} alignItems="center">
            <ClockIcon style={{ width: "20px", height: "20px" }} />
            {session.start_at && session.end_at ? (
              dayjs(session.start_at).isSame(session.end_at, "day") ? (
                <>
                  <Typography variant="body2">
                    {dayjs(session.start_at).format(FORMAT_TIME)} - {dayjs(session.end_at).format(FORMAT_TIME)},
                  </Typography>
                  <Typography variant="body2" textTransform="capitalize">
                    {dayjs(session.start_at).format(FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" textTransform="capitalize">
                  {dayjs(session.start_at).format(FORMAT_DATE_TIME_SHORTER)}
                </Typography>
              )
            ) : (
              <Typography variant="body2">Thời gian chưa được cập nhật</Typography>
            )}
          </Stack>
          <Stack flexDirection="row" alignItems="center" gap={0.5}>
            {session.is_online ? (
              <>
                <VideocamOutlined sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" maxWidth={174} className="line-clamp-1" textOverflow={"ellipsis"}>
                  Trực tiếp trên {ROOM_PROVIDERS?.[session.channel_provider || "zoom"]?.label || "Nền tảng khác"}
                </Typography>
              </>
            ) : (
              <>
                <LocationOnOutlined sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" maxWidth={174} className="line-clamp-1" textOverflow={"ellipsis"}>
                  {session.location || "Địa điểm chưa được cập nhật"}
                </Typography>
              </>
            )}
          </Stack>
          <Box mt={2}>
            <JoinButton
              isOnline={isOnline}
              isAdminView={isAdminView}
              onClick={() => onClickJoin(session.id)}
              disabled={dayjs().isAfter(dayjs(session.end_at))}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SessionDetail = ({
  session,
  thumbnail,
  open,
  isAdminView,
  onClose,
  onClickJoin,
}: {
  session: (NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"][number] & { index: number }) | null;
  thumbnail?: string;
  isAdminView?: boolean;
  open: boolean;
  onClose: () => void;
  onClickJoin: (sessionId: string) => void;
}) => {
  if (!session) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thông tin chi tiết lớp học {session.index + 1}</DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ position: "relative", width: "100%", height: 280 }}>
          <Image src={thumbnail || ""} alt={session.title || "thumbnail"} fill style={{ objectFit: "cover" }} />
        </Box>
        <Stack spacing={1.75} mt={2}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                bgcolor: "#0050FF29",
                color: "#0038B2",
                px: "6px",
                py: 0.5,
                borderRadius: "6px",
                display: "inline-block",
              }}
            >
              Lớp học {session.index + 1}
            </Typography>
            {session.start_at && session.end_at ? (
              dayjs(session.start_at).isSame(session.end_at, "day") ? (
                <>
                  <Typography variant="body2">
                    {dayjs(session.start_at).format(FORMAT_TIME)} - {dayjs(session.end_at).format(FORMAT_TIME)},
                  </Typography>
                  <Typography variant="body2" textTransform="capitalize">
                    {dayjs(session.start_at).format(FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" textTransform="capitalize">
                  {dayjs(session.start_at).format(FORMAT_DATE_TIME_SHORTER)}
                </Typography>
              )
            ) : (
              <Typography variant="body2">Thời gian chưa được cập nhật</Typography>
            )}
          </Stack>
          <Typography variant="h6" fontWeight="600">
            {session.title}
          </Typography>
          <Stack flexDirection="row" alignItems="center" gap={0.5}>
            {session.is_online ? (
              <>
                <VideocamOutlined sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" maxWidth={174} className="line-clamp-1" textOverflow={"ellipsis"}>
                  Trực tiếp trên {ROOM_PROVIDERS?.[session.channel_provider || "zoom"]?.label || "Nền tảng khác"}
                </Typography>
              </>
            ) : (
              <>
                <LocationOnOutlined sx={{ width: 20, height: 20 }} />
                <Typography variant="body2" maxWidth={174} className="line-clamp-1" textOverflow={"ellipsis"}>
                  {session.location || "Địa điểm chưa được cập nhật"}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary" variant="outlined">
          Đóng
        </Button>
        <JoinButton isOnline={session.is_online} isAdminView={isAdminView} onClick={() => onClickJoin(session.id)} />
      </DialogActions>
    </Dialog>
  );
};

interface ClassRoomSeriesProps {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
}

const ClassRoomSeries = ({ data, isAdminView }: ClassRoomSeriesProps) => {
  const employee = useUserOrganization((state) => state.data);

  const [selectedSession, setSelectedSession] = useState<
    (NonNullable<GetClassRoomBySlugResponse["data"]>["sessions"][number] & { index: number }) | null
  >(null);

  const sessions = useMemo(() => {
    return data?.sessions.map((session) => ({
      ...session,
      thumbnail_url: data?.thumbnail_url,
    }));
  }, [data?.sessions, data?.thumbnail_url]);

  const { joinSession, qrDialogOpen, qrViewOpen, selectedSessionForQR, closeQRDialog, closeQRView } = useClassRoomJoin({ data, isAdminView });

  const isSingle = data?.room_type === "single";

  if (isSingle) return null;

  const onClickJoinSession = (sessionId: string) => {
    setSelectedSession(null);

    const selectedSessionData = data?.sessions.find((session) => session.id === sessionId);
    const isOnline = selectedSessionData?.is_online ?? true;

    joinSession({ sessionId, isOnline });
  };
  
  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Chuỗi lớp học
        </Typography>
        <Stack
          flexDirection={"row"}
          gap={2}
          overflow="auto"
          p={3}
          sx={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: (theme) => theme.palette.divider,
            width: "fit-content",
            borderRadius: "12px",
          }}
        >
          {sessions?.map((session, index) => (
            <ClassRoomSerieCard
              key={session.id}
              session={session}
              thumbnail={data?.thumbnail_url || undefined}
              index={index}
              isAdminView={isAdminView}
              setSelectedSession={setSelectedSession}
              onClickJoin={onClickJoinSession}
            />
          ))}
        </Stack>
      </Box>

      <SessionDetail
        session={selectedSession!}
        thumbnail={data?.thumbnail_url || undefined}
        isAdminView={isAdminView}
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        onClickJoin={onClickJoinSession}
      />

      {isAdminView ? (
        data && (
          <QRCodeViewDialog
            open={qrViewOpen}
            onClose={closeQRView}
            classRoom={{
              id: data.id,
              title: data.title,
              class_sessions: data.sessions?.map((s) => ({
                id: s.id,
                title: s.title,
                start_at: s.start_at,
                end_at: s.end_at,
                is_online: s.is_online,
              })),
            } as any}
          />
        )
      ) : (
        <QRScannerDialog
          open={qrDialogOpen}
          onClose={() => {
            closeQRDialog();
          }}
          employeeId={employee?.id || ""}
          classRoomId={data?.id || ""}
          sessionId={selectedSessionForQR || ""}
          classTitle={data?.title || ""}
        />
      )}
    </>
  );
};

export default ClassRoomSeries;
