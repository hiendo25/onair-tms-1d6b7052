"use client";
import { memo } from "react";
import TextEditor from "@/shared/ui/form/RHFRichEditor";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { Typography } from "@mui/material";
import SlugField from "./fields/SlugField";
import CategorySelector from "./fields/CategorySelector";

import { useUpsertCourseFormContext } from "../UpsertCourseFormContainer";

interface TabCourseInformationProps {
  className?: string;
}
const TabCourseInformation: React.FC<TabCourseInformationProps> = () => {
  const { control } = useUpsertCourseFormContext();
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
      <div>
        <RHFTextField
          control={control}
          name="title"
          label="Tên môn học"
          placeholder="Nhập tên môn học"
          required
          helpText={<Typography className="text-xs text-gray-600 text-right">Tối đa 200 ký tự</Typography>}
        />
        <div className="h-3"></div>
        <SlugField control={control} />
      </div>
      <CategorySelector control={control} />
      <TextEditor label="Mô tả môn học" control={control} name="description" required />
    </div>
  );
};
export default memo(TabCourseInformation);
