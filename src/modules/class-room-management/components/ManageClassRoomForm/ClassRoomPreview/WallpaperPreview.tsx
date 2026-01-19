import React from "react";
import { Control, useController } from "react-hook-form";

import { Image } from "@/shared/ui/Image";
import { ClassRoomFormValues } from "../classroom-form.schema";

export interface WallpaperPreviewProps {
  control: Control<ClassRoomFormValues>;
}
const WallpaperPreview: React.FC<WallpaperPreviewProps> = ({ control }) => {
  const {
    field: { value: thumbnail },
  } = useController({ control, name: "thumbnailUrl" });
  return (
    <div>
      <div className="pewview-ui__thumbnail aspect-video w-full rounded-xl relative overflow-hidden">
        {thumbnail ? (
          <Image src={thumbnail} alt="preview" fill style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="w-full bg-blue-600/10 h-full"></div>
        )}
      </div>
    </div>
  );
};
export default WallpaperPreview;
