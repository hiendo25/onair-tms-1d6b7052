import React from "react";
import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from "@mui/material";

import { fDateTime } from "@/lib";
import { CheckCircleIcon } from "@/shared/assets/icons";

export const ScanningContentLoader = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Đang xử lý điểm danh...
      </Typography>
    </Box>
  );
};

interface ScanningSuccessProps {
  fullName: string;
  codeClass: string;
  checkInTime: string;
  onClose: () => void;
}
export const ScanningContentSuccess: React.FC<ScanningSuccessProps> = ({
  fullName,
  checkInTime,
  codeClass,
  onClose,
}) => {
  return (
    <Box>
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: "semibold" }} color="success">
          Điểm danh Thành công
        </AlertTitle>
      </Alert>

      <Box sx={{ bgcolor: "grey.50", borderRadius: 2, p: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2" color="text.secondary">
            Họ tên
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {fullName}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2" color="text.secondary">
            Mã lớp học
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {codeClass}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Thời gian điểm danh
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {fDateTime(checkInTime)}
          </Typography>
        </Box>
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" type="button" onClick={onClose}>
          Đóng
        </Button>
      </Box>
    </Box>
  );
};

interface ScanningContentAlertProps {
  title?: string;
  severity?: "warning" | "error";
  message?: React.ReactNode;
  onClose?: () => void;
  onReScan?: () => void;
}
export const ScanningContentAlert: React.FC<ScanningContentAlertProps> = ({
  title = "Title",
  message,
  onClose,
  onReScan,
  severity,
}) => {
  return (
    <Box>
      <Alert severity={severity} sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: "bold" }}>{title}</AlertTitle>
        <Typography>{message}</Typography>
      </Alert>

      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" type="button" onClick={onClose}>
          Đóng
        </Button>
        <Button variant="contained" type="button" onClick={onReScan}>
          Quét lại
        </Button>
      </Box>
    </Box>
  );
};
