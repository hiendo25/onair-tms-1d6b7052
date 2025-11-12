import { FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR, FORMAT_DATE_TIME_SHORTER, FORMAT_TIME } from "@/lib";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { QrCode } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";
import EnterClassRoomsDialog from "./EnterClassRoomsDialog";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";
import JoinButton from "./JoinButton";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

interface ClassRoomJoinProps {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
}

export default function ClassRoomJoinHorizontal({ data, isAdminView = false }: ClassRoomJoinProps) {
  const employee = useUserOrganization((state) => state.data);

  const {
    dialogOpen,
    qrDialogOpen,
    qrViewOpen,
    selectedSessionForQR,
    isAllOnline,
    handleClickJoin,
    handleSelectSession,
    handleCloseDialog,
    closeQRDialog,
    closeQRView,
  } = useClassRoomJoin({ data, isAdminView });

  return (
    <>
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" bgcolor={"white"}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Image
            src={data?.thumbnail_url || ""}
            alt={data?.title || "thumbnail"}
            width={135}
            height={56}
            style={{ objectFit: "cover", borderRadius: 8 }}
          />

          <Stack justifyContent={"space-between"}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {data?.title}
            </Typography>
            {data?.start_at && data?.end_at ? (
              dayjs(data?.start_at).isSame(data?.end_at, "day") ? (
                <Stack direction="row" alignItems="center">
                  <Typography variant="body2" textTransform="capitalize">
                    {dayjs(data?.start_at).format(FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR)}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mx: 1,
                      width: 4,
                      height: 4,
                      bgcolor: "text.secondary",
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="body2">
                    {dayjs(data?.start_at).format(FORMAT_TIME)} - {dayjs(data?.end_at).format(FORMAT_TIME)}
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center">
                  <Typography variant="body2">{dayjs(data?.start_at).format(FORMAT_DATE_TIME_SHORTER)}</Typography>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      mx: 1,
                      width: 4,
                      height: 4,
                      bgcolor: "text.secondary",
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="body2">{dayjs(data?.end_at).format(FORMAT_DATE_TIME_SHORTER)}</Typography>
                </Stack>
              )
            ) : (
              <Typography variant="body2">Thời gian chưa được cập nhật</Typography>
            )}
          </Stack>
        </Stack>
        <JoinButton
          isOnline={isAllOnline}
          onClick={handleClickJoin}
          disabled={dayjs().isAfter(dayjs(data?.end_at))}
          isAdminView={isAdminView}
        />
      </Stack>

      <EnterClassRoomsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        isOnline={isAllOnline}
        thumbnail={data?.thumbnail_url || undefined}
        sessions={data?.sessions || []}
        isAdminView={isAdminView}
        onClickJoin={handleSelectSession}
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
}
