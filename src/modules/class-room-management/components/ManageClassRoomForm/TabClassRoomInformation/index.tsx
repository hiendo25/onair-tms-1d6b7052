"use client";
import { memo } from "react";
import TextEditor from "@/shared/ui/form/RHFRichEditor";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { Typography } from "@mui/material";
import { type ClassRoom } from "../classroom-form.schema";
import { useFormContext } from "react-hook-form";
import ThumbnailUploader from "./fields/ThumbailUploader";
import ClassRoomSlugField from "./fields/ClassRoomSlugField";
import ClassFieldSelector from "./fields/ClassFieldSelector";
import DocumentFields from "./fields/DocumentFields";
import ForWhomFields from "./fields/ForWhomFields";

interface TabClassRoomInformationProps {
  className?: string;
}
const TabClassRoomInformation: React.FC<TabClassRoomInformationProps> = () => {
  const { control } = useFormContext<ClassRoom>();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
        <div>
          <RHFTextField
            control={control}
            label="Tên lớp học"
            placeholder="Tên lớp học"
            name="title"
            required
            helpText={<Typography className="text-xs text-gray-600 text-right">Tối đa 100 ký tự</Typography>}
          />
          {/* <div className="h-3"></div>
          <ClassRoomSlugField control={control} /> */}
        </div>
        <ThumbnailUploader
          label="Ảnh bìa đại diện"
          subTitle="Hình ảnh đại diện cho lớp học của bạn"
          control={control}
          description={
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Typography className="text-xs">
                Kích thước chuẩn: <strong>1152 x 480 px (21:9)</strong>
              </Typography>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <Typography className="text-xs">File đuôi jpg, png</Typography>
            </div>
          }
        />
        <DocumentFields />
        <ClassFieldSelector control={control} />
        <TextEditor label="Nội dung khóa học" control={control} name="description" required />
        <ForWhomFields />
      </div>
    </div>
  );
};
export default memo(TabClassRoomInformation);
