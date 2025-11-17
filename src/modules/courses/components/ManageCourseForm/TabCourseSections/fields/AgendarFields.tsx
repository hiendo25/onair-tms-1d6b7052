import { Box, Button, FormLabel, IconButton, Typography } from "@mui/material";
import { memo } from "react";

import { useClassRoomFormContext } from "../../UpsertCourseFormContainer";
import { Control, useController, useFieldArray } from "react-hook-form";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { TrashIcon1 } from "@/shared/assets/icons";
import { ClassRoom } from "../../upsert-course.schema";
import RHFTextAreaField from "@/shared/ui/form/RHFTextAreaField";
import { cn } from "@/utils";
import dayjs from "dayjs";

export const getAgendaInitData = (): ClassRoom["classRoomSessions"][number]["agendas"][number] => {
  return {
    description: "",
    endDate: "",
    startDate: "",
    title: "",
  };
};
interface AgendarFieldsProps {
  sessionIndex: number;
  className?: string;
}
const AgendarFields: React.FC<AgendarFieldsProps> = ({ sessionIndex, className }) => {
  const { control, trigger } = useClassRoomFormContext();

  const {
    fields: agendaFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.agendas`,
    keyName: "_agendaId",
  });

  const handleAddAgendaItem = async () => {
    const isValid = await trigger(`classRoomSessions.${sessionIndex}.agendas`);
    if (!isValid) return;
    append(getAgendaInitData());
  };
  return (
    <div className={cn(className)}>
      <div className="flex items-center">
        <div className="pr-6 flex-1">
          <FormLabel component="div">
            Agenda <span className="text-xs text-gray-500 font-normal">(Lịch trình lớp học)</span>
          </FormLabel>
          <Typography className="text-xs text-gray-600">
            Lên kế hoạch chi tiết cho từng buổi trong ngày đào tạo, đảm bảo tiến độ và người phụ trách rõ ràng.
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="fill" onClick={handleAddAgendaItem}>
            Thêm
          </Button>
        </div>
      </div>
      {agendaFields.length ? (
        <div className="flex flex-col gap-4 mt-6">
          {agendaFields.map((field, _index) => (
            <AgendaFieldBox
              key={field._agendaId}
              control={control}
              index={_index}
              sessionIndex={sessionIndex}
              remove={remove}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
export default memo(AgendarFields);

interface AgendaFieldBoxProps {
  index: number;
  sessionIndex: number;
  remove: (index: number) => void;
  control: Control<ClassRoom>;
}
const AgendaFieldBox: React.FC<AgendaFieldBoxProps> = ({ sessionIndex, index, remove, control }) => {
  const {
    field: { value: sessionStartDate },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.startDate`,
  });
  const {
    field: { value: sessionEndDate },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.endDate`,
  });

  const {
    field: { value: agendaStartDate },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.agendas.${index}.startDate`,
  });

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

          <IconButton
            className="w-[28px] h-[28px] bg-white border rounded-md border-gray-300"
            onClick={() => remove(index)}
          >
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        </div>
        <div>
          <FormLabel component="div">
            Thời gian diễn ra <span className="text-red-600">*</span>
          </FormLabel>
          <div className="flex items-center gap-4">
            <RHFDateTimePicker
              name={`classRoomSessions.${sessionIndex}.agendas.${index}.startDate`}
              minDateTime={sessionStartDate ? dayjs(sessionStartDate) : dayjs()}
              maxDateTime={sessionEndDate ? dayjs(sessionEndDate) : dayjs()}
              control={control}
            />
            <RHFDateTimePicker
              name={`classRoomSessions.${sessionIndex}.agendas.${index}.endDate`}
              minDateTime={
                agendaStartDate ? dayjs(agendaStartDate) : sessionStartDate ? dayjs(sessionStartDate) : dayjs()
              }
              maxDateTime={sessionEndDate ? dayjs(sessionEndDate) : dayjs()}
              control={control}
            />
          </div>
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
