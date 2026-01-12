import { memo, useEffect, useId, useRef, useState } from "react";
import { styled } from "@mui/material";
import {
  Html5Qrcode,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
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
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
  ],
  rememberLastUsedCamera: true,
  supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
};

export type Html5QrCodeScannerPluginProps = {
  id?: string;
  verbose?: boolean;
  config?: Html5QrcodeScannerConfig;
  onCodeScanedSuccess: QrcodeSuccessCallback;
  onCodeScanedError?: QrcodeErrorCallback;
  onWatchShadeBoxSize?: (size: { width: number; height: number }) => void;
  onWatchDeviceList?: (devices: { id: string; label: string }[]) => void;
  onWatchCameraId?: (cameraId: string) => void;
};
const Html5QrCodeScannerPlugin: React.FC<Html5QrCodeScannerPluginProps> = ({
  id,
  verbose = false,
  config = CONFIG,
  onCodeScanedSuccess,
  onCodeScanedError,
  onWatchShadeBoxSize,
  onWatchDeviceList,
  onWatchCameraId,
}) => {
  const html5QrcodeRef = useRef<Html5Qrcode>();
  const [cameraError, setCameraError] = useState(false);
  const [shadeBoxSize, setShadeBoxSize] = useState<{
    width: number;
    height: number;
  }>();
  const [cameraId, setCameraId] = useState<string>();
  const regionId = id ? id : useId();

  const CAMERA_REGION_ID = `${CAMERA_RENDER_ID}-${regionId}`;

  const qrBoxDimension: QrDimensionFunction = function (viewfinderWidth, viewfinderHeight) {
    const minEdgePercentage = 0.6;
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    let scanboxSize = Math.floor(minEdgeSize * minEdgePercentage);

    scanboxSize = scanboxSize > 560 ? 420 : scanboxSize;
    setShadeBoxSize({ width: scanboxSize, height: scanboxSize });
    onWatchShadeBoxSize?.({ width: scanboxSize, height: scanboxSize });

    return {
      width: scanboxSize,
      height: scanboxSize,
    };
  };

  /**
   * Html5QrcodeScannerState.UNKNOWN - 0
   * Html5QrcodeScannerState.NOT_STARTED - 1
   * Html5QrcodeScannerState.SCANNING - 2
   * Html5QrcodeScannerState.PAUSED - 3
   */

  useEffect(() => {
    if (!html5QrcodeRef.current) {
      html5QrcodeRef.current = new Html5Qrcode(CAMERA_REGION_ID, {
        verbose,
        useBarCodeDetectorIfSupported: true,
      });
    }
    cameraId &&
      html5QrcodeRef.current
        .start(
          cameraId,
          {
            qrbox: qrBoxDimension,
            fps: config.fps,
            disableFlip: false,
            videoConstraints: { facingMode: "environment" },
          },
          onCodeScanedSuccess,
          onCodeScanedError,
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

    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef?.current?.getState() === 2) {
        html5QrcodeRef.current
          ?.stop()
          .then(() => {
            console.log("Camera stop success");
          })
          .catch(() => {
            console.log("Camera fail to stop.");
          });
      }
    };
  }, [CAMERA_REGION_ID, cameraId, verbose, config.fps]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log({ devices });
        onWatchDeviceList?.(devices);
        if (devices.length) {
          const cameraId = devices[0].id;
          setCameraId(cameraId);
          onWatchCameraId?.(cameraId);
        }
      })
      .catch((err) => {
        setCameraError(err);
        console.log({ err });
      });
  }, []);

  return (
    <div className="relative w-full h-full">
      {shadeBoxSize && (
        <div
          className="shade-border absolute z-[2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg%20width%3D%22355%22%20height%3D%22355%22%20viewBox%3D%220%200%20355%20355%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20clip-path%3D%22url(%23clip0_576_13387)%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M0%2047.25C0%2021.1545%2021.1545%200%2047.25%200H94.5C101.024%200%20106.312%205.28863%20106.312%2011.8125C106.312%2018.3364%20101.024%2023.625%2094.5%2023.625H47.25C34.2023%2023.625%2023.625%2034.2023%2023.625%2047.25V94.5C23.625%20101.024%2018.3364%20106.312%2011.8125%20106.312C5.28863%20106.312%200%20101.024%200%2094.5V47.25ZM248.062%2011.8125C248.062%205.28863%20253.351%200%20259.875%200H307.125C333.221%200%20354.375%2021.1545%20354.375%2047.25V94.5C354.375%20101.024%20349.087%20106.312%20342.562%20106.312C336.038%20106.312%20330.75%20101.024%20330.75%2094.5V47.25C330.75%2034.2023%20320.172%2023.625%20307.125%2023.625H259.875C253.351%2023.625%20248.062%2018.3364%20248.062%2011.8125ZM11.8125%20248.062C18.3364%20248.062%2023.625%20253.351%2023.625%20259.875V307.125C23.625%20320.172%2034.2023%20330.75%2047.25%20330.75H94.5C101.024%20330.75%20106.312%20336.038%20106.312%20342.562C106.312%20349.087%20101.024%20354.375%2094.5%20354.375H47.25C21.1545%20354.375%200%20333.221%200%20307.125V259.875C0%20253.351%205.28863%20248.062%2011.8125%20248.062ZM342.562%20248.062C349.087%20248.062%20354.375%20253.351%20354.375%20259.875V307.125C354.375%20333.221%20333.221%20354.375%20307.125%20354.375H259.875C253.351%20354.375%20248.062%20349.087%20248.062%20342.562C248.062%20336.038%20253.351%20330.75%20259.875%20330.75H307.125C320.172%20330.75%20330.75%20320.172%20330.75%20307.125V259.875C330.75%20253.351%20336.038%20248.062%20342.562%20248.062Z%22%20fill%3D%22%23FFD000%22/%3E%3C/g%3E%3Cdefs%3E%3CclipPath%20id%3D%22clip0_576_13387%22%3E%3Crect%20width%3D%22354.375%22%20height%3D%22354.375%22%20fill%3D%22white%22/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E")',
            width: `${shadeBoxSize.width + SHADE_BOX_ZONE}px`,
            height: `${shadeBoxSize.height + SHADE_BOX_ZONE}px`,
            backgroundSize: `${shadeBoxSize.width + SHADE_BOX_ZONE}px ${shadeBoxSize.height + SHADE_BOX_ZONE}px`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      )}
      <RegionWraper
        id={CAMERA_REGION_ID}
        className="relative w-full h-full flex items-center justify-center"
      ></RegionWraper>
    </div>
  );
};
export default memo(Html5QrCodeScannerPlugin);

const RegionWraper = styled("div")`
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
