import React, { memo, useCallback } from "react";
import { Box, Button, FormLabel, Typography } from "@mui/material";
import { Control, useFieldArray } from "react-hook-form";

import { cn } from "@/utils";
import { ClassRoom } from "../../classroom-form.schema";
import { useClassRoomFormContext } from "../../ClassRoomFormContainer";

import AgendaFormItem from "./AgendaFormItem";

export const getAgendaInitData = (): ClassRoom["classRoomSessions"][number]["agendas"][number] => {
  return {
    description: "",
    endDate: "",
    startDate: "",
    title: "",
  };
};
interface AgendaFieldsProps {
  sessionIndex: number;
  className?: string;
  control: Control<ClassRoom>;
}
const AgendaFieldsControl: React.FC<AgendaFieldsProps> = ({ sessionIndex, className, control }) => {
  const { trigger } = useClassRoomFormContext();

  const {
    fields: agendaFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.agendas`,
    keyName: "_agendaId",
  });

  const handleAddAgendaItem = useCallback(async () => {
    const isValid = await trigger(`classRoomSessions.${sessionIndex}.agendas`);
    if (!isValid) return;
    append(getAgendaInitData());
  }, [append, trigger, sessionIndex]);

  return (
    <div className={cn(className)}>
      <AgendaHeader
        title="Agenda"
        subTitle="(Lịch trình lớp học)"
        description="Lên kế hoạch chi tiết cho từng buổi trong ngày đào tạo, đảm bảo tiến độ và người phụ trách rõ ràng."
        onClick={handleAddAgendaItem}
      />
      {agendaFields.length ? (
        <div className="flex flex-col gap-4 mt-6">
          {agendaFields.map((field, _index) => (
            <AgendaFormItem
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
export default memo(AgendaFieldsControl);

interface AgendaHeaderProps {
  title?: React.ReactNode;
  subTitle?: string;
  description?: string;
  onClick?: () => void;
}
const AgendaHeader: React.FC<AgendaHeaderProps> = memo(({ title, description, subTitle, onClick }) => {
  return (
    <div className="flex items-center">
      <div className="pr-6 flex-1">
        <FormLabel component="div">
          {title} {subTitle ? <span className="text-xs text-gray-500 font-normal">{subTitle}</span> : null}
        </FormLabel>
        <Typography className="text-xs text-gray-600">{description}</Typography>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="fill" onClick={onClick}>
          Thêm
        </Button>
      </div>
    </div>
  );
});
