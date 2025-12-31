import React, { memo } from "react";
import { IconButton } from "@mui/material";

import { CloseIcon } from "@/shared/assets/icons";

interface VideoItemViewProps {
  videoUrl: string;
  onClickRemove?: () => void;
}
const VideoItemView: React.FC<VideoItemViewProps> = ({ videoUrl, onClickRemove }) => {
  console.log("render");
  return (
    <div className="aspect-video rounded-lg w-[460px] overflow-hidden relative">
      <video src={videoUrl} controls className="absolute left-0 top-0 w-full h-full object-cover" />
      <IconButton className="w-6 h-6 absolute top-1 right-1" onClick={onClickRemove}>
        <CloseIcon className="w-4 h-4" />
      </IconButton>
    </div>
  );
};
export default memo(VideoItemView, (prev, next) => prev.videoUrl === next.videoUrl);
