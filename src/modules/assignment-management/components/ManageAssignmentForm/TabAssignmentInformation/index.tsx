"use client";
import React, { memo } from "react";
import { Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import TextEditor from "@/shared/ui/form/RHFRichEditor";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { type Assignment } from "../../assignment-form.schema";

import AssignmentCategorySelector from "./AssignmentCategorySelector";

interface TabAssignmentInformationProps {}

const TabAssignmentInformation: React.FC<TabAssignmentInformationProps> = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<Assignment>();

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-xl p-3 md:p-6 flex flex-col gap-6 border border-gray-200">
        <div>
          <RHFTextField
            control={control}
            label="Tên bài kiểm tra"
            placeholder="Nhập tên bài kiểm tra"
            name="name"
            required
            helpText={<Typography className="text-xs text-gray-600 text-right">Tối đa 200 ký tự</Typography>}
          />
        </div>

        <TextEditor label="Mô tả bài kiểm tra" control={control} name="description" required />

        <AssignmentCategorySelector control={control} />
      </div>
    </div>
  );
};

export default memo(TabAssignmentInformation);
