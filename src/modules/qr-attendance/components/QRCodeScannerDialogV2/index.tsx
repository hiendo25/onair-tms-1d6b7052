import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { CloseIcon } from "@/shared/assets/icons";
import Html5QRScanner from "../Html5QRScanner";

type DialogContent = {
  title?: string;
  description?: string;
};

export interface QRCodeScannerV2Ref {
  onOpen: (content: DialogContent) => void;
}
export interface QRCodeScannerV2Props {
  open?: boolean;
}
const QRCodeScannerV2 = forwardRef<QRCodeScannerV2Ref, QRCodeScannerV2Props>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<DialogContent>({
    title: "Quét mã QRCode",
    description: "",
  });

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    onOpen(content) {
      handleOpenDialog();
      if (content) setDialogContent(content);
    },
  }));
  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth disableAutoFocus disableEnforceFocus>
      <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {dialogContent?.title}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Html5QRScanner />
      </DialogContent>
    </Dialog>
  );
});
export default QRCodeScannerV2;
