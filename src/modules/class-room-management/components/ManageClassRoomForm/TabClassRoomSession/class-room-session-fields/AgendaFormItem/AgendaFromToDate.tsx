import React, { useMemo } from "react";
import dayjs from "dayjs";
import { Control, useWatch } from "react-hook-form";

import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { ClassRoom } from "../../../classroom-form.schema";

interface AgendaFromToDateProps {
  sessionIndex: number;
  control: Control<ClassRoom>;
  agendaIndex: number;
}
const AgendaFromToDate: React.FC<AgendaFromToDateProps> = ({ sessionIndex, control, agendaIndex }) => {
  const sessionStartDate = useWatch({ control, name: `classRoomSessions.${sessionIndex}.startDate` });
  const sessionEndDate = useWatch({ control, name: `classRoomSessions.${sessionIndex}.endDate` });
  const agendas = useWatch({ control, name: `classRoomSessions.${sessionIndex}.agendas` });

  const currentAgenDa = agendas[agendaIndex];

  const limitationDate = useMemo(() => {
    const limitDateMap = new Map(
      agendas.map((item, index) => [
        index,
        {
          startAt: item.startDate,
          endAt: item.endDate,
        },
      ]),
    );
    const prevLimitDate = agendaIndex > 0 ? limitDateMap.get(agendaIndex - 1) : undefined;
    const nextLimitDate = agendaIndex < agendas.length - 1 ? limitDateMap.get(agendaIndex + 1) : undefined;

    const minDate = prevLimitDate?.endAt
      ? prevLimitDate?.endAt
      : prevLimitDate?.startAt
      ? prevLimitDate?.startAt
      : undefined;

    const maxDate = nextLimitDate?.startAt
      ? nextLimitDate?.startAt
      : nextLimitDate?.endAt
      ? nextLimitDate?.endAt
      : undefined;

    return {
      minDate,
      maxDate,
    };
  }, [agendas, agendaIndex]);
  return (
    <div className="flex items-center gap-4">
      <RHFDateTimePicker
        name={`classRoomSessions.${sessionIndex}.agendas.${agendaIndex}.startDate`}
        minDateTime={
          limitationDate?.minDate ? dayjs(limitationDate.minDate) : sessionStartDate ? dayjs(sessionStartDate) : dayjs()
        }
        closeOnSelect
        slotProps={{
          actionBar: undefined,
        }}
        maxDateTime={
          currentAgenDa?.endDate
            ? dayjs(currentAgenDa.endDate)
            : limitationDate?.maxDate
            ? dayjs(limitationDate?.maxDate)
            : sessionEndDate
            ? dayjs(sessionEndDate)
            : undefined
        }
        control={control}
      />
      <RHFDateTimePicker
        control={control}
        name={`classRoomSessions.${sessionIndex}.agendas.${agendaIndex}.endDate`}
        closeOnSelect
        slotProps={{
          actionBar: undefined,
        }}
        minDateTime={
          currentAgenDa?.startDate
            ? dayjs(currentAgenDa.startDate)
            : limitationDate?.maxDate
            ? dayjs(limitationDate.maxDate)
            : sessionStartDate
            ? dayjs(sessionStartDate)
            : dayjs()
        }
        maxDateTime={
          limitationDate?.maxDate ? dayjs(limitationDate.maxDate) : sessionEndDate ? dayjs(sessionEndDate) : undefined
        }
      />
    </div>
  );
};
export default AgendaFromToDate;
