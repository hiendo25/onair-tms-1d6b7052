import { QrCode } from "@mui/icons-material";
import { Button } from "@mui/material";

import { Database } from "@/types/supabase.types";
import { CLASS_SESSION_TYPE } from "../_constants";

interface JoinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isAdminView?: boolean;
  session_type?: Database["public"]["Enums"]["class_session_type"];
  fullWidth?: boolean;
}

export default function JoinButton({
  onClick,
  disabled = false,
  isAdminView = false,
  session_type,
  fullWidth = false,
}: JoinButtonProps) {
  if (!session_type || session_type === CLASS_SESSION_TYPE.ONLINE) return null;
  const isLive = session_type === CLASS_SESSION_TYPE.LIVE;
  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth={fullWidth}
      endIcon={isLive ? undefined : <QrCode />}
      disabled={disabled}
      onClick={onClick}
      className="font-medium text-[14px]"
    >
      {isLive ? "Vào lớp học" : isAdminView ? "Xem mã QR điểm danh" : "Quét mã QR điểm danh"}
    </Button>
  );
}
