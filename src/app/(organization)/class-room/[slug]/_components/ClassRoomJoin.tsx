import { Avatar, AvatarGroup, Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { CLASS_SESSION_TYPE } from "../_constants";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";

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

  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);

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
      {isAdminView ? (
        data && (
          <QRCodeViewDialog
            open={qrViewOpen}
            onClose={closeQRView}
            classRoom={
              {
                id: data.id,
                title: data.title,
                class_sessions: data.sessions?.map((s) => ({
                  id: s.id,
                  title: s.title,
                  start_at: s.start_at,
                  end_at: s.end_at,
                  is_online: s.session_type !== CLASS_SESSION_TYPE.OFFLINE,
                })),
              } as any
            }
          />
        )
      ) : (
        <QRScannerDialog
          open={qrDialogOpen}
          onClose={() => {
            closeQRDialog();
          }}
          employeeId={employeeId}
          classRoomId={data?.id || ""}
          sessionId={selectedSessionForQR || ""}
          classTitle={data?.title || ""}
        />
      )}
    </>
  );
}
