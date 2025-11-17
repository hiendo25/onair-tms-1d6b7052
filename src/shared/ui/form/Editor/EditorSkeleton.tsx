import { cn } from "@/utils";
import { Typography } from "@mui/material";
import { memo } from "react";

interface EditorSkeletonProps {
  aspect?: "video" | "square" | "auto" | string;
  className?: string;
}
const EditorSkeleton: React.FC<EditorSkeletonProps> = ({ aspect = "video", className }) => {
  return (
    <div
      className={cn(
        "editor-loading w-full rounded-lg border border-gray-200 overflow-hidden flex flex-col",
        className,
        {
          "aspect-video": aspect === "video",
          "aspect-square": aspect === "square",
        },
      )}
    >
      <div className="editor-loading__top bg-white p-4">
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center animate-pulse">
            <div className="bg-slate-100 w-20 h-6 rounded-lg"></div>
            <div className="bg-slate-100 w-10 h-6 rounded-lg"></div>
            <div className="bg-slate-100 w-6 h-6 rounded-lg"></div>
            <div className="bg-slate-100 w-6 h-6 rounded-lg"></div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex gap-2 items-center animate-pulse">
            <div className="bg-slate-100 w-6 h-6 rounded-lg"></div>
            <div className="bg-slate-100 w-6 h-6 rounded-lg"></div>
            <div className="bg-slate-100 w-6 h-6 rounded-lg"></div>
          </div>
        </div>
      </div>
      <div className="editor-loading__content bg-gray-100 flex items-center justify-center flex-1 py-6">
        <div>
          <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
            Đang tải...
          </Typography>
        </div>
      </div>
    </div>
  );
};
export default memo(EditorSkeleton);
