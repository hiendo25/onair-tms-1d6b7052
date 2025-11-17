import React, { useState } from "react";
import { CloseIcon, FilePdf02Icon, FileWord02Icon, VideoIcon } from "@/shared/assets/icons";
import { IconButton, Typography } from "@mui/material";
import { LessonType } from "@/model/lesson.model";
import { cn } from "@/utils";
export interface LessonTypeSelectorProps {
  onSelect: (type: LessonType) => void;
  onCancel?: () => void;
}
const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({ onSelect, onCancel }) => {
  const [lessonType, setLessonType] = useState<LessonType>();

  const handleSelect = (type: LessonType) => () => {
    setLessonType(type);
    onSelect(type);
  };
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Typography sx={{ fontWeight: "bold" }}>Tạo Bài giảng</Typography>
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div
          className={cn("border flex items-center justify-center rounded-xl p-6 cursor-pointer", {
            "border-blue-600": lessonType === "video",
            "border-gray-300": lessonType !== "video",
          })}
          onClick={handleSelect("video")}
        >
          <div>
            <VideoIcon className="w-[72px] h-[72px] mb-3" />
            <Typography sx={{ textAlign: "center", fontWeight: 600 }} variant="body2">
              Video
            </Typography>
          </div>
        </div>
        <div
          className={cn("border flex items-center justify-center rounded-xl p-6 cursor-pointer", {
            "border-blue-600": lessonType === "file",
            "border-gray-300": lessonType !== "file",
          })}
          onClick={handleSelect("file")}
        >
          <div>
            <FilePdf02Icon className="w-[72px] h-[72px] mb-3" />
            <Typography sx={{ textAlign: "center", fontWeight: 600 }} variant="body2">
              File Pdf
            </Typography>
          </div>
        </div>
        <div
          className={cn("border flex items-center justify-center border-gray-300 rounded-xl p-6 cursor-pointer", {
            "border-blue-600": lessonType === "assessment",
            "border-gray-300": lessonType !== "assessment",
          })}
          onClick={handleSelect("assessment")}
        >
          <div>
            <FileWord02Icon className="w-[72px] h-[72px] mb-3" />
            <Typography sx={{ textAlign: "center", fontWeight: 600 }} variant="body2">
              Bài kiểm tra
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LessonTypeSelector;
