"use client";

import { useMemo } from "react";

import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import QRCodeViewDialog from "@/modules/qr-attendance/components/QRCodeViewDialog";
import QRScannerDialog from "@/modules/qr-attendance/components/QRScannerDialog";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { mapClassRoomToQrView } from "../_utils/classRoomQr.utils";

interface ClassRoomQrDialogsProps {
  classRoom: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
  qrDialogOpen: boolean;
  qrViewOpen: boolean;
  selectedSessionForQR: string | null;
  onCloseQrDialog: () => void;
  onCloseQrView: () => void;
}

const ClassRoomQrDialogs = ({
  classRoom,
  isAdminView = false,
  qrDialogOpen,
  qrViewOpen,
  selectedSessionForQR,
  onCloseQrDialog,
  onCloseQrView,
}: ClassRoomQrDialogsProps) => {
  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);
  const qrClassRoom = useMemo(() => mapClassRoomToQrView(classRoom), [classRoom]);

  if (isAdminView) {
    if (!qrClassRoom) {
      return null;
    }

    return <QRCodeViewDialog open={qrViewOpen} onClose={onCloseQrView} classRoom={qrClassRoom} />;
  }

  return (
    <QRScannerDialog
      open={qrDialogOpen}
      onClose={onCloseQrDialog}
      employeeId={employeeId}
      classRoomId={classRoom?.id || ""}
      sessionId={selectedSessionForQR || ""}
      classTitle={classRoom?.title || ""}
    />
  );
};

export default ClassRoomQrDialogs;
