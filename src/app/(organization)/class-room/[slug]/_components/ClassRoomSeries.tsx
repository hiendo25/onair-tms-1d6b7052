"use client";
import { useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import { CLASS_SESSION_TYPE } from "../_constants";
import { useClassRoomJoin } from "../_hooks/useClassRoomJoin";

import ClassRoomQrDialogs from "./ClassRoomQrDialogs";
import ClassRoomSeriesCard from "./ClassRoomSeriesCard";
import ClassRoomSeriesSessionDetail from "./ClassRoomSeriesSessionDetail";

type ClassRoomSession = NonNullable<ClassRoomDetailWithProgress["sessions"]>[number];

interface ClassRoomSeriesProps {
  data: ClassRoomDetailWithProgress;
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
}

const ClassRoomSeries = ({ data, isAdminView, isFromLearningPath }: ClassRoomSeriesProps) => {
  const [selectedSession, setSelectedSession] = useState<
    (ClassRoomSession & { index: number }) | null
  >(null);

  const sessions = useMemo(() => {
    return (data?.sessions ?? []).map((session) => ({
      ...session,
      thumbnail_url: data?.thumbnail_url,
    }));
  }, [data?.sessions, data?.thumbnail_url]);

  const { joinSession, qrDialogOpen, qrViewOpen, selectedSessionForQR, closeQRDialog, closeQRView } = useClassRoomJoin({
    data,
    isAdminView,
    isFromLearningPath,
  });

  const isSingle = data?.room_type === "single";

  if (isSingle) return null;

  const onClickJoinSession = (sessionId: string) => {
    setSelectedSession(null);

    const selectedSessionData = data?.sessions.find((session) => session.id === sessionId);
    const isOnline = selectedSessionData?.session_type !== CLASS_SESSION_TYPE.OFFLINE;

    joinSession({ sessionId, isOnline });
  };

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[28px]">
          Chuỗi lớp học
        </Typography>
        <Stack
          mt={3}
          flexDirection={"row"}
          gap={2}
          overflow="auto"
          p={3}
          sx={{
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: (theme) => theme.palette.divider,
            width: { xs: "100%", md: "fit-content" },
            borderRadius: "12px",
          }}
        >
          {sessions?.map((session, index) => (
            <ClassRoomSeriesCard
              key={session.id}
              session={session}
              thumbnail={data?.thumbnail_url || undefined}
              index={index}
              isAdminView={isAdminView}
              isFromLearningPath={isFromLearningPath}
              onSelectDetail={(selected, selectedIndex) =>
                setSelectedSession({ ...selected, index: selectedIndex })
              }
              onClickJoin={onClickJoinSession}
            />
          ))}
        </Stack>
      </Box>

      <ClassRoomSeriesSessionDetail
        session={selectedSession}
        thumbnail={data?.thumbnail_url || undefined}
        classRoomTitle={data?.title || ""}
        isAdminView={isAdminView}
        open={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        onClickJoin={onClickJoinSession}
        isFromLearningPath={isFromLearningPath}
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
};

export default ClassRoomSeries;
