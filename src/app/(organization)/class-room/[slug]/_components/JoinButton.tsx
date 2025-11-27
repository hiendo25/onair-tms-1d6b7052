import { Database } from "@/types/supabase.types";
import { QrCode } from "@mui/icons-material";
import { Button } from "@mui/material";

interface JoinButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isAdminView?: boolean;
  session_type?: Database["public"]["Enums"]["class_session_type"];
}

export default function JoinButton({ onClick, disabled = false, isAdminView = false, session_type }: JoinButtonProps) {
  if (!session_type || session_type === "online") return null;
  const isLive = session_type === "live";
  return (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      sx={{ textTransform: "none" }}
      endIcon={isLive ? undefined : <QrCode />}
      disabled={disabled}
      onClick={onClick}
    >
      {isLive ? "Vào lớp học" : isAdminView ? "Xem mã QR điểm danh" : "Quét mã QR điểm danh"}
    </Button>
  );
}
