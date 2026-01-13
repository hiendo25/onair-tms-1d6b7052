"use client";
import React, { Activity, forwardRef, memo, useImperativeHandle, useRef, useState } from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { useCheckInWithQRMutation } from "@/modules/class-room-management/operation";
import { useStudentClassRoomCheckInWithQRMutation } from "@/modules/class-room-management/operation/qr-attendance";
import { useUserOrganization } from "@/modules/organization";
import { AttendanceCheckInPayload } from "@/repository/qr-attendance";
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
    const { mutate: checkInQR, isPending } = useCheckInWithQRMutation();
    const { mutate: checkInQRV2, isPending: isLoading } = useStudentClassRoomCheckInWithQRMutation();

    const employeeId = useUserOrganization((state) => state.currentOrganization.employeeId);
    const [classRoomData, setClassRoomData] = useState<ClassRoomContentDialog>();
    const [result, setResult] = useState();
    const scanningRef = useRef(false);

    const [open, setOpen] = useState(false);

    const scannerRef = useRef<Html5QRScannerRef>(null);

    const handleOpenDialog = () => setOpen(true);

    const handleCloseDialog = () => setOpen(false);

    // const getGeoLocation = () => {
    //   const geoPositionOptions = {
    //     enableHighAccuracy: true,
    //     timeout: 5000,
    //     maximumAge: 0,
    //   };
    //   navigator.geolocation.getCurrentPosition(
    //     (data) => {
    //       console.log(data);
    //     },
    //     (err) => {
    //       console.log(err);
    //     },
    //     geoPositionOptions,
    //   );
    // };

    const handleScanningSuccessClassroom: Html5QRScannerProps["onScanSuccess"] = (qrCode, result) => {
      if (scanningRef.current) return;

      scanningRef.current = true;

      if (!classRoomData) return;

      checkInQRV2(
        {
          classRoomId: classRoomData.classRoomId,
          classSessionId: classRoomData.classSessionId,
          employeeId: employeeId,
          qrCode,
        },
        {
          onSuccess(data, variables, onMutateResult, context) {
            console.log(data);
          },
          onError(error, variables, onMutateResult, context) {
            console.log(error);
          },
          onSettled: () => {
            scannerRef.current?.stop();
            scanningRef.current = false;
          },
        },
      );
    };
    const handleScanningErrorClassroom: Html5QRScannerProps["onScanError"] = (errormessage, error) => {
      console.log(errormessage, error);
      // getGeoLocation();
    };

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
        fullWidth
        disableAutoFocus
        disableEnforceFocus
        scroll="body"
        onTransitionEnd={() => {
          scannerRef.current?.start({
            onSuccess: handleScanningSuccessClassroom,
            onError: handleScanningErrorClassroom,
          });
        }}
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
        <Activity mode="visible">
          <div className="w-full aspect-square">
            <Html5QRScanner ref={scannerRef} />
          </div>
        </Activity>
        <Activity>
          <DialogContent>
            {classRoomData?.title ? (
              <div className="classroom-information mb-4">
                <Typography sx={{ fontWeight: 500 }}>{classRoomData?.title}</Typography>
              </div>
            ) : null}

            <Activity mode={"hidden"}>
              <ScanningContentLoader />
            </Activity>

            <Activity mode={"visible"}>
              <ScanningContentSuccess
                fullName="1231233"
                codeClass="12313"
                checkInTime="11/11/2025"
                onClose={() => {}}
              />
            </Activity>

            <Activity mode="visible">
              <ScanningContentAlert severity="error" message="1232132131231" />
            </Activity>

            <Activity mode="visible">
              <ScanningContentAlert severity="warning" message="1232132131231" />
            </Activity>
          </DialogContent>
        </Activity>
      </Dialog>
    );
  },
);
export default memo(QRCodeScannerClassRoomDialog);
