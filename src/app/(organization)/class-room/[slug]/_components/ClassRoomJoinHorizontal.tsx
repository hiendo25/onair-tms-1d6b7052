import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";

import { FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR, FORMAT_DATE_TIME_SHORTER } from "@/lib";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { Image } from "@/shared/ui/Image";
import { CLASS_SESSION_TYPE } from "../_constants";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";
import { buildScheduleDisplay } from "../_utils/classRoomSchedule.utils";

// import Image from "next/image";
import EnterClassRoomsDialog from "./EnterClassRoomsDialog";
import JoinButton from "./JoinButton";

interface ClassRoomJoinProps {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
}

export default function ClassRoomJoinHorizontal({
  data,
  isAdminView = false,
  isFromLearningPath,
}: ClassRoomJoinProps) {
  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);
  const primarySession = data?.sessions?.[0];
  const scheduleDisplay = buildScheduleDisplay({
    startAt: data?.start_at ?? primarySession?.start_at,
    endAt: data?.end_at ?? primarySession?.end_at,
    weeklySchedule: primarySession?.weekly_schedule,
    isFromLearningPath,
    sameDayDateFormat: FORMAT_DATE_LABEL_WITHOUT_HUMAN_DAY_AND_YEAR,
    dateTimeFormat: FORMAT_DATE_TIME_SHORTER,
  });

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
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent={{ xs: "flex-start", sm: "space-between" }}
        gap={{ xs: 1.5, sm: 2 }}
        bgcolor={"white"}
        px={2}
        width="100%"
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
          {data?.thumbnail_url && (
            <Image
              src={data?.thumbnail_url || ""}
              alt={"thumbnail"}
              width={135}
              height={56}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
          )}

          <Stack justifyContent={"space-between"} width="100%">
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                whiteSpace: { xs: "normal", sm: "nowrap" },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data?.title}
            </Typography>
            {scheduleDisplay.type === "same-day" ? (
              <Stack direction="row" alignItems="center" flexWrap="wrap" rowGap={0.5}>
                <Typography variant="body2" textTransform="capitalize">
                  {scheduleDisplay.secondaryLabel}
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
                <Typography variant="body2">{scheduleDisplay.primaryLabel}</Typography>
              </Stack>
            ) : scheduleDisplay.type === "multi-day" &&
              scheduleDisplay.dateRange?.startLabel &&
              scheduleDisplay.dateRange?.endLabel ? (
              <Stack direction="row" alignItems="center" flexWrap="wrap" rowGap={0.5}>
                <Typography variant="body2">{scheduleDisplay.dateRange.startLabel}</Typography>
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
                <Typography variant="body2">{scheduleDisplay.dateRange.endLabel}</Typography>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" flexWrap="wrap" rowGap={0.5}>
                <Typography variant="body2">{scheduleDisplay.primaryLabel}</Typography>
                {scheduleDisplay.secondaryLabel ? (
                  <>
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
                    <Typography variant="body2">{scheduleDisplay.secondaryLabel}</Typography>
                  </>
                ) : null}
              </Stack>
            )}
          </Stack>
        </Stack>
        <Box
          sx={{
            width: { xs: "100%", sm: "auto" },
            display: { xs: "block", sm: "inline-flex" },
            alignSelf: { xs: "stretch", sm: "center" },
          }}
        >
          <JoinButton
            onClick={handleClickJoin}
            disabled={dayjs().isAfter(dayjs(data?.end_at))}
            isAdminView={isAdminView}
            session_type={data?.sessions?.[0]?.session_type}
            fullWidth
          />
        </Box>
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
