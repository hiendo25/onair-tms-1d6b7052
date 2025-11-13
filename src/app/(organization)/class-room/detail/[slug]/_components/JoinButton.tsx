import { QrCode } from "@mui/icons-material";
import { Button } from "@mui/material";

interface JoinButtonProps {
  isOnline?: boolean | null;
  onClick: () => void;
  disabled?: boolean;
  isAdminView?: boolean;
}

export default function JoinButton({ isOnline = true, onClick, disabled = false, isAdminView = false }: JoinButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      sx={{ textTransform: "none" }}
      endIcon={isOnline ? undefined : <QrCode />}
      disabled={disabled}
      onClick={onClick}
    >
      {isOnline ? "Vào lớp học" : isAdminView ? "Xem mã QR điểm danh" : "Quét mã QR điểm danh"}
    </Button>
  );
}
