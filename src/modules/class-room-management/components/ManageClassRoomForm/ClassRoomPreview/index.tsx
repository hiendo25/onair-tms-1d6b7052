import React, { memo } from "react";
import { Control, useFormContext, UseFormReturn, useWatch } from "react-hook-form";

import { ClassRoom } from "../classroom-form.schema";

import ClassTitle from "./ClassTitle";
import WallpaperPreview from "./WallpaperPreview";

interface ClassRoomPreviewProps {
  control: Control<ClassRoom>;
}
const ClassRoomPreview: React.FC<ClassRoomPreviewProps> = ({ control }) => {
  // const data = useWatch({ control: control });
  console.log("data");

  return (
    <div className="pewview-ui p-6 bg-white rounded-xl overflow-hidden">
      <div className="pewview-ui__header">
        <div className="bg-blue-600/10 -mx-6 -mt-6 px-6 pt-4 pb-2 flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-4">
              <div className="bar w-15 h-5 bg-white rounded-md"></div>
              <div className="bar w-30 h-5 bg-white rounded-md"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <div className="w-5 h-5 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="pewview-ui__body w-full bg-white rounded-lg pt-6">
        <WallpaperPreview control={control} />
        <div className="pt-6">
          <ClassTitle control={control} />
        </div>
      </div>
    </div>
  );
};
export default memo(ClassRoomPreview);
