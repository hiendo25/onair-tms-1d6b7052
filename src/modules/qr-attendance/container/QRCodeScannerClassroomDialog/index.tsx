"use client";
import React, { Activity, forwardRef, memo, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { flushSync } from "react-dom";

import { useStudentClassRoomCheckInWithQRMutation } from "@/modules/class-room-management/operation/qr-attendance";
import { useUserOrganization } from "@/modules/organization";
import { CloseIcon } from "@/shared/assets/icons";
import Html5QRScanner, { Html5QRScannerProps, Html5QRScannerRef } from "../../components/Html5QRScanner";

import { ScanningContentAlert, ScanningContentLoader, ScanningContentSuccess } from "./dialog-content";
type ClassRoomContentDialog = {
  title?: string;
  startAt?: string;
  endAt?: string;
  classRoomId: string;
  classSessionId: string;
  content?: React.ReactNode;
};

type StudentCheckedInResult = {
  fullName?: string;
  codeClass?: string;
  checkedInAt?: string;
  employeeCode?: string;
};

export interface QRCodeScannerClassRoomDialogRef {
  onOpen: (
    content: ClassRoomContentDialog,
    options?: { onSuccess?: Html5QRScannerProps["onScanSuccess"]; onError?: Html5QRScannerProps["onScanError"] },
  ) => void;
}
export interface QRCodeScannerClassRoomDialogProps {
  open?: boolean;
  autoClose?: boolean;
}
const QRCodeScannerClassRoomDialog = forwardRef<QRCodeScannerClassRoomDialogRef, QRCodeScannerClassRoomDialogProps>(
  (props, ref) => {
    const employeeId = useUserOrganization((state) => state.currentOrganization.employeeId);

    const [classRoomData, setClassRoomData] = useState<ClassRoomContentDialog>();
    const [checkedInResult, setCheckedInResult] = useState<StudentCheckedInResult>();
    const [isScanned, setIsScanned] = useState(false);
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrormessage] = useState<string>();
    const scannerStatusRef = useRef<"starting" | "scanning" | "idle">("idle");
    const scannerRef = useRef<Html5QRScannerRef>(null);

    const { mutate: doCheckIn, isPending: isLoadingScan } = useStudentClassRoomCheckInWithQRMutation();

    const handleOpenDialog = () => setOpen(true);

    const handleCloseDialog = () => setOpen(false);

    const handleStartScanQRCode = () => {
      scannerRef.current?.start({
        onSuccess: (qrCode, result) => {
          if (!classRoomData) return;

          if (scannerStatusRef.current === "scanning") return;

          scannerStatusRef.current = "scanning";

          doCheckIn(
            {
              classRoomId: classRoomData.classRoomId,
              classSessionId: classRoomData.classSessionId,
              employeeId: employeeId,
              qrCode,
            },
            {
              onSuccess({ data }, variables, onMutateResult, context) {
                if (data) {
                  setCheckedInResult({
                    checkedInAt: data.checkedInAt,
                    codeClass: data.classSessionId,
                    fullName: data.fullName,
                    employeeCode: data.employeeCode,
                  });
                }
              },
              onError(error, variables, onMutateResult, context) {
                console.log({ error });
                if (error.code === "STUDENT_ALREADY_CHECKED_IN") {
                  setErrormessage("Học viên đã điểm danh, vui lòng trở lại hoặc điểm danh lớp học khác.");
                } else {
                  setErrormessage(error?.message);
                }
              },
              onSettled() {
                scannerRef.current?.stop?.();
                setIsScanned(true);
              },
            },
          );
        },
      });
    };

    const handleModalTransitionEnd: DialogProps["onTransitionEnd"] = async () => {
      if (scannerStatusRef.current !== "idle") return;
      scannerStatusRef.current = "starting";
      handleStartScanQRCode();
    };
    const handleModalTransitionExited: DialogProps["onTransitionExited"] = () => {
      scannerStatusRef.current = "idle";
      setIsScanned(false);
    };

    const handleReScan = () => {
      flushSync(() => {
        scannerStatusRef.current = "starting";
        setErrormessage(undefined);
        setCheckedInResult(undefined);
        setIsScanned(false);
      });
      handleStartScanQRCode();
    };

    const isShowQrScan = useMemo(() => {
      return (
        !isScanned &&
        (scannerStatusRef.current === "idle" ||
          scannerStatusRef.current === "starting" ||
          scannerStatusRef.current === "scanning")
      );
    }, [isScanned]);

    useImperativeHandle(ref, () => ({
      onOpen(content, options) {
        handleOpenDialog();
        if (content) setClassRoomData(content);
      },
    }));

    return (
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        aria-modal
        fullWidth
        disableAutoFocus
        disableEnforceFocus
        scroll="body"
        transitionDuration={100}
        onTransitionEnd={handleModalTransitionEnd}
        onTransitionExited={handleModalTransitionExited}
        slotProps={{
          paper: {
            sx: (theme) => ({ borderWidth: "0px !important" }),
          },
        }}
      >
        <DialogTitle component="div">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Quét mã QRCode
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small" className="-mr-2 bg-transparent hover:bg-transparent">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Activity mode={isShowQrScan ? "visible" : "hidden"}>
          <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
            {isLoadingScan ? <ScanningContentLoader /> : <Html5QRScanner ref={scannerRef} />}
          </div>
        </Activity>

        <DialogContent>
          {classRoomData?.title ? (
            <div className="classroom-information mb-4">
              <Typography sx={{ fontWeight: 500 }}>{classRoomData?.title}</Typography>
            </div>
          ) : null}
          <Activity mode={isScanned ? "visible" : "hidden"}>
            {checkedInResult ? (
              <ScanningContentSuccess
                fullName={checkedInResult?.fullName}
                codeClass={checkedInResult?.codeClass}
                checkInTime={checkedInResult?.checkedInAt}
                employeeCode={checkedInResult?.employeeCode}
              />
            ) : null}

            {errorMessage && <ScanningContentAlert severity="error" message={errorMessage} />}

            {/* <ScanningContentAlert severity="warning" message="1232132131231" /> */}
          </Activity>
          <div className="h-6"></div>
          <DialogActions sx={{ px: 0, py: 0 }}>
            <Button variant="outlined" onClick={handleCloseDialog} className="w-24" size="small">
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleReScan}
              disableElevation
              disableRipple
              disableTouchRipple
              disableFocusRipple
              disabled={!isScanned}
              className="w-24"
              size="small"
            >
              Quét lại
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );
  },
);
export default memo(QRCodeScannerClassRoomDialog);
