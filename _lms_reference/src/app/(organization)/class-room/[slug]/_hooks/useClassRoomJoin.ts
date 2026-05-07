import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { resolveJoinUrl } from "@/utils/class-room-session";
import { CLASS_SESSION_TYPE } from "../_constants";

interface UseClassRoomJoinOptions {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
  isFromLearningPath?: boolean;
}

interface JoinSessionOptions {
  sessionId: string;
  isOnline: boolean;
}

export const useClassRoomJoin = ({
  data,
  isAdminView = false,
  isFromLearningPath = false,
}: UseClassRoomJoinOptions) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrViewOpen, setQrViewOpen] = useState(false);
  const [selectedSessionForQR, setSelectedSessionForQR] = useState<string | null>(null);

  const isSingleSession = useMemo(() => data?.room_type === "single", [data?.room_type]);

  const isAllOnline = useMemo(
    () =>
      data?.sessions.every((session) => session.session_type !== CLASS_SESSION_TYPE.OFFLINE) ?? true,
    [data?.sessions],
  );

  const firstSessionId = useMemo(() => data?.sessions[0]?.id, [data?.sessions]);

  const classRoomSlug = useMemo(() => data?.slug || "", [data?.slug]);

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

  const openJoinLink = useCallback(
    (sessionId: string) => {
      const selectedSession = data?.sessions.find((session) => session.id === sessionId);
      const joinUrl = resolveJoinUrl(selectedSession);

      if (!joinUrl) {
        return false;
      }

      window.open(joinUrl, "_blank");
      return true;
    },
    [data?.sessions],
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

      if (isFromLearningPath && openJoinLink(sessionId)) {
        return;
      }

      navigateToClassRoomCountDown(sessionId);
    },
    [openQRDialog, openQRView, navigateToClassRoomCountDown, isAdminView, isFromLearningPath, openJoinLink],
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
      const isOnline = selectedSession?.session_type !== CLASS_SESSION_TYPE.OFFLINE;

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
