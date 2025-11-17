import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { Control, useController } from "react-hook-form";
import { ClassRoom } from "../../upsert-course.schema";
import { useClassRoomFormContext } from "../../UpsertCourseFormContainer";
import dayjs from "dayjs";

import { memo, useMemo } from "react";
import { FormLabel } from "@mui/material";
interface ClassRoomSessionFromToDateProps {
  control: Control<ClassRoom>;
  index: number;
}
const ClassRoomSessionFromToDate: React.FC<ClassRoomSessionFromToDateProps> = ({ control, index }) => {
  const { getValues } = useClassRoomFormContext();
  const sessions = getValues("classRoomSessions");
  // const allStartAndEndDate = sessions.map((it) => ({ startDate: it.startDate, endDate: it.endDate }));

  const leftSessionList = useMemo(() => [...sessions].splice(0, index), [sessions]);
  const rightSessionList = useMemo(() => [...sessions].splice(index + 1), [sessions]);

  // console.table({ index, leftSessionList, rightSessionList });

  const maxDateLeft = leftSessionList.reduce<string | undefined>((maxD, it) => {
    const dateMap = new Map();
    let dateList: number[] = [];
    if (maxD) {
      const maxDateTimeValue = dayjs(maxD).valueOf();
      dateList = [...dateList, maxDateTimeValue];
      dateMap.set(maxDateTimeValue, maxD);
    }

    if (it.startDate) {
      const stDateVal = dayjs(it.startDate).valueOf();
      dateList = [...dateList, stDateVal];
      dateMap.set(stDateVal, it.startDate);
    }

    if (it.endDate) {
      const enDateVal = dayjs(it.endDate).valueOf();
      dateMap.set(enDateVal, it.endDate);
      dateList = [...dateList, enDateVal];
    }
    return dateMap.get(Math.max(...dateList));
  }, undefined);

  const minDateRight = rightSessionList.reduce<string | undefined>((minD, it) => {
    const dateMap = new Map();
    let dateList: number[] = [];

    if (minD) {
      const minDateVal = dayjs(minD).valueOf();
      dateList = [...dateList, minDateVal];
      dateMap.set(minDateVal, minD);
    }
    if (it.startDate) {
      const stDateVal = dayjs(it.startDate).valueOf();
      dateMap.set(stDateVal, it.startDate);
      dateList = [...dateList, stDateVal];
    }

    if (it.endDate) {
      const enDateVal = dayjs(it.endDate).valueOf();
      dateMap.set(enDateVal, it.endDate);
      dateList = [...dateList, enDateVal];
    }

    const minDateUnix = Math.min(...dateList);
    return dateMap.get(minDateUnix);
  }, undefined);

  // console.table({ minDateRight, maxDateLeft });

  const { field: startDateField } = useController({ control: control, name: `classRoomSessions.${index}.startDate` });
  const { field: endDateField } = useController({ control: control, name: `classRoomSessions.${index}.endDate` });

  return (
    <div className="date">
      <FormLabel component="div">
        Thời gian diễn ra <span className="text-red-600">*</span>
      </FormLabel>
      <div className="flex gap-4 max-w-[680px]">
        <RHFDateTimePicker
          control={control}
          name={`classRoomSessions.${index}.startDate`}
          // label="Thời gian bắt đầu"
          minDateTime={maxDateLeft ? dayjs(maxDateLeft) : dayjs()}
          maxDateTime={endDateField?.value ? dayjs(endDateField.value) : undefined}
          // required
        />
        <RHFDateTimePicker
          control={control}
          name={`classRoomSessions.${index}.endDate`}
          // label="Thời gian kết thúc"
          minDateTime={startDateField.value ? dayjs(startDateField.value) : undefined}
          maxDateTime={minDateRight ? dayjs(minDateRight) : undefined}
          // required
        />
      </div>
    </div>
  );
};
export default memo(ClassRoomSessionFromToDate);
