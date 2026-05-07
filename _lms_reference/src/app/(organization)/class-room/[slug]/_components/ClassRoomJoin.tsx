import { Avatar, AvatarGroup, Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";

import ClassRoomQrDialogs from "./ClassRoomQrDialogs";
import CountDown from "./CountDown";
import EnterClassRoomsDialog from "./EnterClassRoomsDialog";
import JoinButton from "./JoinButton";

const MAX_AVATAR = 3;
const JOIN_BUTTON_WRAPPER_SX = {
  width: { xs: "100%", sm: "auto" },
  display: { xs: "block", sm: "inline-flex" },
};

interface ClassRoomJoinProps {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
}

export default function ClassRoomJoin({ data, isAdminView, isFromLearningPath }: ClassRoomJoinProps) {
  const employees = data?.employees || [];

  const {
    dialogOpen,
    qrDialogOpen,
    qrViewOpen,
    selectedSessionForQR,
    handleClickJoin,
    handleSelectSession,
    handleCloseDialog,
    closeQRDialog,
    closeQRView,
  } = useClassRoomJoin({ data, isAdminView, isFromLearningPath });

  return (
    <>
      <Stack
        gap={2}
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        {isFromLearningPath ? (
          <Box sx={JOIN_BUTTON_WRAPPER_SX}>
            <JoinButton
              onClick={handleClickJoin}
              disabled={dayjs().isAfter(dayjs(data?.end_at))}
              isAdminView={isAdminView}
              session_type={data?.sessions?.[0]?.session_type}
              fullWidth
            />
          </Box>
        ) : (
          <>
            <Stack
              sx={{
                bgcolor: "primary.lighter",
                px: 2,
                pt: 1,
                pb: 3,
                borderRadius: 2,
              }}
              spacing={1}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" align="left" flex={1} color="textPrimary">
                  Bắt đầu sau:
                </Typography>
                {data?.start_at && <CountDown startDate={data.start_at} disabled={false} />}
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AvatarGroup
                    spacing={6}
                    slotProps={{
                      additionalAvatar: {
                        sx: { width: 24, height: 24, fontSize: 10 },
                      },
                    }}
                    sx={{ ".MuiAvatarGroup-avatar": { fontSize: 10 } }}
                    total={Math.min(employees.length, MAX_AVATAR)}
                  >
                    {employees.map((element) => (
                      <Avatar
                        key={element.employee?.id}
                        sx={{ width: 16, height: 16 }}
                        alt={element?.employee?.profile?.full_name || "Unknown"}
                        src={element?.employee?.profile?.avatar || "/default-avatar.png"}
                      />
                    ))}
                  </AvatarGroup>
                  <Typography color="textPrimary" variant="subtitle2">
                    {employees.length - MAX_AVATAR > 0 && employees.length > 0
                      ? `+${employees.length - MAX_AVATAR} học viên`
                      : "học viên"}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Box sx={JOIN_BUTTON_WRAPPER_SX}>
              <JoinButton
                onClick={handleClickJoin}
                disabled={dayjs().isAfter(dayjs(data?.end_at))}
                isAdminView={isAdminView}
                session_type={data?.sessions?.[0]?.session_type}
                fullWidth
              />
            </Box>
          </>
        )}
      </Stack>
      <EnterClassRoomsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        thumbnail={data?.thumbnail_url || undefined}
        sessions={data?.sessions || []}
        isAdminView={isAdminView}
        isFromLearningPath={isFromLearningPath}
        onClickJoin={handleSelectSession}
      />
      <ClassRoomQrDialogs
        classRoom={data}
        isAdminView={isAdminView}
        qrDialogOpen={qrDialogOpen}
        qrViewOpen={qrViewOpen}
        selectedSessionForQR={selectedSessionForQR}
        onCloseQrDialog={closeQRDialog}
        onCloseQrView={closeQRView}
      />
    </>
  );
}
