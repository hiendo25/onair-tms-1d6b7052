import React, { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { styled } from "@mui/material";
import {
  Html5Qrcode as Html5QRCode,
  Html5QrcodeScannerState,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats as Html5QRCodeFormat,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";
import { QrDimensionFunction } from "html5-qrcode/esm/core";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

const CAMERA_RENDER_ID = "qr-reader-id" as const;
const SHADE_BOX_ZONE = 100 as const;
const CONFIG: Html5QrcodeScannerConfig = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  formatsToSupport: [
    Html5QRCodeFormat.CODE_128,
    Html5QRCodeFormat.QR_CODE,
    Html5QRCodeFormat.CODE_39,
    Html5QRCodeFormat.CODE_93,
  ],
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};

export type Html5QRScannerProps = {
  verbose?: boolean;
  config?: Html5QrcodeScannerConfig;
  onScanSuccess?: QrcodeSuccessCallback;
  onScanError?: QrcodeErrorCallback;
  onWatchShadeBoxSize?: (size: { width: number; height: number }) => void;
  onWatchDeviceList?: (devices: { id: string; label: string }[]) => void;
  onWatchCameraId?: (cameraId: string) => void;
};
const Html5QRScanner: React.FC<Html5QRScannerProps> = ({
  verbose = false,
  config = CONFIG,
  onScanSuccess = () => {},
  onScanError = () => {},
  onWatchShadeBoxSize,
  onWatchDeviceList,
  onWatchCameraId,
}) => {
  const html5QrCodeRef = useRef<Html5QRCode>(null);
  const [cameraError, setCameraError] = useState(false);
  const [shadeBoxSize, setShadeBoxSize] = useState<{
    width: number;
    height: number;
  }>();
  const [cameraId, setCameraId] = useState<string>();
  const regionId = useId();

  const CAMERA_REGION_ID = `${CAMERA_RENDER_ID}-${regionId}`;

  const qrBoxDimension: QrDimensionFunction = useCallback(
    (viewfinderWidth, viewfinderHeight) => {
      const minEdgePercentage = 0.6;
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      let scanBoxSize = Math.floor(minEdgeSize * minEdgePercentage);

      scanBoxSize = scanBoxSize > 560 ? 420 : scanBoxSize;
      setShadeBoxSize({ width: scanBoxSize, height: scanBoxSize });
      onWatchShadeBoxSize?.({ width: scanBoxSize, height: scanBoxSize });

      return {
        width: scanBoxSize,
        height: scanBoxSize,
      };
    },
    [onWatchShadeBoxSize],
  );

  useEffect(() => {
    const html5QRCode = html5QrCodeRef.current;

    console.log({ html5QRCode });
    html5QRCode &&
      cameraId &&
      html5QRCode
        .start(
          cameraId,
          {
            qrbox: qrBoxDimension,
            fps: config.fps,
            disableFlip: false,
            videoConstraints: { facingMode: "user" },
          },
          onScanSuccess,
          onScanError,
        )
        .then(() => {
          // camera started
          console.log("camera start");
        })
        .catch(() => {
          // camera start failed
          console.log("camera start failed");
        })
        .finally(() => {
          console.log("camera final");
        });
  }, [cameraId, verbose, config.fps, onScanError, onScanSuccess, qrBoxDimension]);

  useEffect(() => {
    if (html5QrCodeRef.current) return;

    html5QrCodeRef.current = new Html5QRCode(CAMERA_REGION_ID, {
      verbose,
      useBarCodeDetectorIfSupported: true,
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef?.current?.getState() === Html5QrcodeScannerState.SCANNING) {
        html5QrCodeRef.current
          ?.stop()
          .then(() => {
            console.log("Camera stop success");
          })
          .catch(() => {
            console.log("Camera fail to stop.");
          });
      }
    };
  }, [CAMERA_REGION_ID, verbose]);

  useEffect(() => {
    (async () => {
      await Html5QRCode.getCameras()
        .then((devices) => {
          console.log({ devices });
          const deviceId = devices[0]?.id;

          onWatchDeviceList?.(devices);

          if (!deviceId) return;

          setCameraId(deviceId);
          onWatchCameraId?.(deviceId);
        })
        .catch((err) => {
          setCameraError(err);
          console.log({ err });
        });
    })();
  }, []);

  return (
    <div className="relative w-full h-full">
      <CameraRegionContainer
        id={CAMERA_REGION_ID}
        className="relative w-full h-full flex items-center justify-center"
      ></CameraRegionContainer>
    </div>
  );
};
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
