import { PATHS } from "@/constants/path.contstants";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

interface UseClassRoomJoinOptions {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
}

interface JoinSessionOptions {
  sessionId: string;
  isOnline: boolean;
}

export const useClassRoomJoin = ({ data, isAdminView = false }: UseClassRoomJoinOptions) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrViewOpen, setQrViewOpen] = useState(false);
  const [selectedSessionForQR, setSelectedSessionForQR] = useState<string | null>(null);

  const isSingleSession = useMemo(() => data?.room_type === "single", [data?.room_type]);

  const isAllOnline = useMemo(() => data?.sessions.every((session) => session.is_online) ?? true, [data?.sessions]);

  const firstSessionId = useMemo(() => data?.sessions[0]?.id, [data?.sessions]);

  const classRoomSlug = useMemo(() => data?.slug || "", [data?.slug]);

  const canJoin = useMemo(() => {
    return dayjs().isBefore(dayjs(data?.end_at));
  }, [data?.end_at]);

  const openQRDialog = useCallback((sessionId: string) => {
    setSelectedSessionForQR(sessionId);
    setQrDialogOpen(true);
  }, []);

  const closeQRDialog = useCallback(() => {
    setQrDialogOpen(false);
    setSelectedSessionForQR(null);
  }, []);

  const openQRView = useCallback(() => {
    setQrViewOpen(true);
  }, []);

  const closeQRView = useCallback(() => {
    setQrViewOpen(false);
  }, []);

  const navigateToClassRoomCountDown = useCallback(
    (sessionId: string) => {
      router.push(PATHS.CLASSROOMS.COUNTDOWN_CLASSROOM(classRoomSlug, sessionId));
    },
    [router, classRoomSlug],
  );

  const joinSession = useCallback(
    ({ sessionId, isOnline }: JoinSessionOptions) => {
      if (!isOnline) {
        // For admin view, show QR view dialog instead of scanner
        if (isAdminView) {
          openQRView();
          return;
        }
        openQRDialog(sessionId);
        return;
      }

      navigateToClassRoomCountDown(sessionId);
    },
    [openQRDialog, openQRView, navigateToClassRoomCountDown, isAdminView],
  );

  const handleClickJoin = useCallback(() => {
    if (!isSingleSession) {
      setDialogOpen(true);
      return;
    }

    if (!firstSessionId) {
      console.error("No session found");
      return;
    }

    joinSession({
      sessionId: firstSessionId,
      isOnline: isAllOnline,
    });
  }, [isSingleSession, firstSessionId, isAllOnline, joinSession]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setDialogOpen(false);

      const selectedSession = data?.sessions.find((session) => session.id === sessionId);
      const isOnline = selectedSession?.is_online ?? true;

      joinSession({
        sessionId,
        isOnline,
      });
    },
    [data?.sessions, joinSession],
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return {
    dialogOpen,
    qrDialogOpen,
    qrViewOpen,
    selectedSessionForQR,

    isSingleSession,
    isAllOnline,
    isAdminView,
    canJoin,

    handleClickJoin,
    handleSelectSession,
    handleCloseDialog,
    openQRDialog,
    closeQRDialog,
    openQRView,
    closeQRView,

    joinSession,
  };
};
