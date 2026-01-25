"use client";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

import { ShareIcon } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";

export default function InstallNotificationPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="install prompt-guild">
      <Typography sx={{ fontWeight: 600 }} gutterBottom>
        Cài đặt ứng dụng
      </Typography>
      {isIOS && <ContentIOSInstructionGuide />}
    </div>
  );
}

const ContentIOSInstructionGuide = () => {
  return (
    <div className="text-sm">
      <Typography sx={{ fontSize: 14 }}>
        Để cài đặt thông báo trên thiết bị nhấn nút{" "}
        <span className="inline-block text-blue-700 font-medium">
          chia sẻ <ShareIcon className="w-4 h-4 -mt-[3px] stroke-blue-700" />
        </span>
        , sau đó nhấn{" "}
        <span className="inline-block text-blue-700 font-medium">
          thêm vào màn hình <PlusIcon className="w-4 h-4 -mt-[3px]" />
        </span>
        .
      </Typography>
    </div>
  );
};
