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
  fullName?: string;
  codeClass?: string;
  checkInTime?: string;
  employeeCode?: string;
}
export const ScanningContentSuccess: React.FC<ScanningSuccessProps> = ({
  fullName,
  checkInTime,
  codeClass,
  employeeCode,
}) => {
  return (
    <Box>
      <Box component="div" className="mb-6">
        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2">Họ tên</Typography>
          <Typography variant="body2" fontWeight="600">
            {fullName || "--"}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2">Mã học viên</Typography>
          <Typography variant="body2" fontWeight="600">
            {employeeCode || "--"}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2">Mã lớp học</Typography>
          <Typography variant="body2" fontWeight="600">
            {codeClass || "--"}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">Thời gian điểm danh</Typography>
          <Typography variant="body2" fontWeight="600">
            {checkInTime ? fDateTime(checkInTime) : "--"}
          </Typography>
        </Box>
      </Box>
      <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
        <AlertTitle sx={{ fontWeight: "semibold" }} color="success" className="mb-0">
          Điểm danh Thành công
        </AlertTitle>
      </Alert>
    </Box>
  );
};

interface ScanningContentAlertProps {
  title?: string;
  severity?: "warning" | "error";
  message?: string;
  onClose?: () => void;
  onReScan?: () => void;
}
export const ScanningContentAlert: React.FC<ScanningContentAlertProps> = ({ title = "", message = "", severity }) => {
  return (
    <>
      <Alert severity={severity}>
        {title ? <AlertTitle sx={{ fontWeight: "bold" }}>{title}</AlertTitle> : null}
        {message}
      </Alert>
    </>
  );
};
