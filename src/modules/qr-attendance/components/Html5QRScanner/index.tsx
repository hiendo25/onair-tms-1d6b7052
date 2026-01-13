import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { styled, Typography } from "@mui/material";
import {
  CameraDevice,
  Html5Qrcode as Html5QRCode,
  Html5QrcodeScannerState,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats as Html5QRCodeFormat,
  QrcodeErrorCallback as ErrorCallback,
  QrcodeSuccessCallback as SuccessCallback,
} from "html5-qrcode";
import { QrDimensionFunction } from "html5-qrcode/esm/core";
import { Html5QrcodeScannerConfig as Html5QRScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

import NotAllowedCameraContent from "./NotAllowedCameraContent";

const CAMERA_RENDER_ID = "qr-reader-id" as const;
const SHADE_BOX_ZONE = 100;
const HTML5QR_CONFIG: Html5QRScannerConfig = {
  fps: 10,
  qrbox: { width: 280, height: 280 },
  formatsToSupport: [
    Html5QRCodeFormat.CODE_128,
    Html5QRCodeFormat.QR_CODE,
    Html5QRCodeFormat.CODE_39,
    Html5QRCodeFormat.CODE_93,
  ],
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};
export type Html5QRScannerRef = {
  stop: () => Promise<void>;
  start: (callbacks?: { onSuccess?: SuccessCallback; onError?: ErrorCallback }) => Promise<void>;
};
export type Html5QRScannerProps = {
  verbose?: boolean;
  config?: Html5QRScannerConfig;
  onScanSuccess?: SuccessCallback;
  onScanError?: ErrorCallback;
};

const Html5QRScanner = forwardRef<Html5QRScannerRef, Html5QRScannerProps>(
  ({ verbose = false, config = HTML5QR_CONFIG, onScanSuccess = () => {}, onScanError = () => {} }, ref) => {
    const html5QrCodeRef = useRef<Html5QRCode>(null);
    const [error, setError] = useState<Error>();
    const [devices, setDevices] = useState<CameraDevice[]>();
    const regionId = useId();
    const [shadeBoxSize, setShadeBoxSize] = useState<{
      width: number;
      height: number;
    }>({ width: 0, height: 0 });
    const CAMERA_REGION_ID = `${CAMERA_RENDER_ID}-${regionId}`;

    const qrBoxDimension: QrDimensionFunction = useCallback((viewfinderWidth, viewfinderHeight) => {
      const minEdgePercentage = 0.6;
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      let scanBoxSize = Math.floor(minEdgeSize * minEdgePercentage);
      setShadeBoxSize({ width: scanBoxSize, height: scanBoxSize });
      scanBoxSize = scanBoxSize > 560 ? 380 : scanBoxSize;
      return {
        width: scanBoxSize,
        height: scanBoxSize,
      };
    }, []);

    const handleStopScanning = async () => {
      const html5QRCode = html5QrCodeRef.current;
      if (!html5QRCode) return;
      await html5QRCode.stop();
    };

    const handleStartScanning: Html5QRScannerRef["start"] = async (options) => {
      try {
        const deviceId = devices?.[0]?.id;

        const html5QRCode = html5QrCodeRef.current;

        if (!deviceId) throw new Error("No camera found");

        if (!html5QRCode) throw new Error("No html5QRCode Api");

        const callbackSuccess = options?.onSuccess || onScanSuccess;
        const callbackError = options?.onError || onScanError;
        await html5QRCode.start(
          deviceId,
          {
            ...config,
            qrbox: qrBoxDimension,
            disableFlip: false,
            videoConstraints: { facingMode: "user" },
          },
          callbackSuccess,
          callbackError,
        );
      } catch (err) {
        setError(err as Error);
      }
    };

    useEffect(() => {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5QRCode(CAMERA_REGION_ID, {
          verbose,
          useBarCodeDetectorIfSupported: true,
        });
      }
      return () => {
        if (html5QrCodeRef.current && html5QrCodeRef?.current?.getState() === Html5QrcodeScannerState.SCANNING) {
          html5QrCodeRef.current?.stop();
        }
      };
    }, [CAMERA_REGION_ID, verbose]);

    useEffect(() => {
      Html5QRCode.getCameras()
        .then((devices) => {
          setDevices(devices);
        })
        .catch((err: Error) => {
          setError(err);
        });
    }, []);

    useImperativeHandle(ref, () => ({
      stop: handleStopScanning,
      start: handleStartScanning,
    }));

    return (
      <div className="scanner-container relative w-full h-full">
        {error?.name === "NotAllowedError" ? <NotAllowedCameraContent /> : null}
        <CameraRegionContainer
          id={CAMERA_REGION_ID}
          className="relative w-full h-full flex items-center justify-center"
        />
        <div
          className="qr-content text-xs text-center absolute top-1/2 left-0 right-0 max-w-[280px] mx-auto"
          style={{
            transform: `translateY(calc(50% + ${shadeBoxSize?.height / 2}px))`,
            color: "red",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "white" }}>Đặt mã QR của bạn vào khung scan QR</Typography>
        </div>
      </div>
    );
  },
);
export default memo(Html5QRScanner);

const CameraRegionContainer = styled("div")`
  video {
    width: 100% !important;
    height: 100%;
    object-fit: cover;
    // transform: rotateY(180deg);
    // transform: skewY(180deg);
  }
  #qr-shaded-region {
    // border-color: transparent !important;
    // div {
    // 	display: none;
    // }
  }
`;
