import { Typography } from "@mui/material";

import { VideoRecorderOffIcon } from "@/shared/assets/icons";
import { cn } from "@/utils";

const NotAllowedCameraContent = () => {
  return (
    <div className={cn("error-scanner flex items-center justify-center aspect-video", {})}>
      <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
        <VideoRecorderOffIcon />
        <div className="h-2"></div>
        <Typography gutterBottom variant="body2" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
          Camera không khả dụng.
        </Typography>
        <div className="h-2"></div>
        <Typography gutterBottom variant="body2" sx={{ fontSize: "0.75rem" }}>
          Bấm vào biểu tượng <VideoRecorderOffIcon className="w-3 h-3" /> trên thanh địa chỉ.
        </Typography>
        <Typography gutterBottom variant="body2" sx={{ fontSize: "0.75rem" }}>
          cho phép sử dụng camera sau đó tải lại trang
        </Typography>
      </div>
    </div>
  );
};
export default NotAllowedCameraContent;
