import React, { memo } from "react";
import { IconButton } from "@mui/material";

import { CloseIcon, FilePdfIcon } from "@/shared/assets/icons";

interface FileViewItemProps {
  fileUrl: string;
  fileName: string;
  onClickRemove?: () => void;
}
const FileViewItem: React.FC<FileViewItemProps> = ({ fileUrl, onClickRemove, fileName }) => {
  console.log("render");
  return (
    <div className="w-32 px-1 mb-2">
      <div className="py-4 px-2 bg-gray-100 relative flex flex-col rounded-lg w-full h-full">
        <div className="file-icon mx-auto mb-4">
          <FilePdfIcon className="w-10 h-10" />
        </div>
        <div className="file-name line-clamp-2 text-xs text-center">
          <a href={fileUrl} target="__blank">
            {fileName}
          </a>
        </div>
        <IconButton className="w-6 h-6 absolute top-1 right-1" onClick={onClickRemove}>
          <CloseIcon className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
};
export default memo(FileViewItem, (prev, next) => prev.fileUrl === next.fileUrl);
