import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { CloseIcon } from "@/shared/assets/icons";
import Html5QRScanner, { Html5QRScannerProps, Html5QRScannerRef } from "../Html5QRScanner";

type DialogContent = {
  title?: string;
  description?: React.ReactNode;
};

export interface QRCodeScannerV2Ref {
  onOpen: (
    content: DialogContent,
    options?: { onSuccess?: Html5QRScannerProps["onScanSuccess"]; onError?: Html5QRScannerProps["onScanError"] },
  ) => void;
}
export interface QRCodeScannerV2Props {
  open?: boolean;
}
const QRCodeScannerV2 = forwardRef<QRCodeScannerV2Ref, QRCodeScannerV2Props>((props, ref) => {
  const [open, setOpen] = useState(false);
  const [callbackActions, setCallbackActions] = useState<{
    onSuccess: Html5QRScannerProps["onScanSuccess"];
    onError: Html5QRScannerProps["onScanError"];
  }>();
  const [dialogContent, setDialogContent] = useState<DialogContent>({
    title: "Quét mã QRCode",
    description: "",
  });

  const scannerRef = useRef<Html5QRScannerRef>(null);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    onOpen(content, options) {
      handleOpenDialog();
      if (content) setDialogContent(content);

      if (options) setCallbackActions({ onSuccess: options?.onSuccess, onError: options?.onError });
    },
  }));

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      disableAutoFocus
      disableEnforceFocus
      scroll="body"
      onTransitionEnd={() => {
        scannerRef.current?.start({
          onSuccess: callbackActions?.onSuccess,
          onError: callbackActions?.onError,
        });
      }}
      slotProps={{
        paper: {
          sx(theme) {
            return {
              borderWidth: "0px !important",
            };
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {dialogContent?.title}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small" className="-mr-2 bg-transparent hover:bg-transparent">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <div className="w-full aspect-square">
          <Html5QRScanner ref={scannerRef} />
        </div>
        {dialogContent.description ? <div className="dialog-content p-6">{dialogContent.description}</div> : null}
      </DialogContent>
    </Dialog>
  );
});
export default QRCodeScannerV2;
