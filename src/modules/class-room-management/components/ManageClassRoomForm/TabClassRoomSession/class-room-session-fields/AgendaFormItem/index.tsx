import React, { memo } from "react";
import { Box, FormLabel, IconButton, Typography } from "@mui/material";
import { Control } from "react-hook-form";

import { TrashIcon1 } from "@/shared/assets/icons";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { ClassRoomFormValues } from "../../../classroom-form.schema";

import AgendaFromToDate from "./AgendaFromToDate";

interface AgendaFormItemProps {
  index: number;
  sessionIndex: number;
  remove: (index: number) => void;
  control: Control<ClassRoomFormValues>;
}
const AgendaFormItem: React.FC<AgendaFormItemProps> = ({ sessionIndex, index, remove, control }) => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.grey[200],
        padding: 2,
        borderRadius: 1,
      })}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 block rounded-xl"></span>
            <Typography sx={{ fontWeight: "bold" }}>Lịch trình {index + 1}</Typography>
          </div>
          <IconButton className="w-7 h-7 bg-white border rounded-md border-gray-300" onClick={() => remove(index)}>
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        </div>
        <div>
          <FormLabel component="div">
            Thời gian diễn ra <span className="text-red-600">*</span>
          </FormLabel>
          <AgendaFromToDate control={control} sessionIndex={sessionIndex} agendaIndex={index} />
        </div>
        <RHFTextField
          label="Tiêu đề"
          placeholder="Nhập tiêu đề"
          name={`classRoomSessions.${sessionIndex}.agendas.${index}.title`}
          control={control}
        />
        <RHFTextAreaField
          name={`classRoomSessions.${sessionIndex}.agendas.${index}.description`}
          label="Mô tả"
          placeholder="Nhập mô tả"
          control={control}
        />
      </div>
    </Box>
  );
};
export default memo(AgendaFormItem);
