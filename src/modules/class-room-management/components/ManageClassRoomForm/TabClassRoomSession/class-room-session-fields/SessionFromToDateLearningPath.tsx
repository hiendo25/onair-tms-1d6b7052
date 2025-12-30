"use client";
import React, { memo, useCallback, useMemo } from "react";
import { FormControl, FormHelperText, FormLabel } from "@mui/material";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Control, FieldErrors, useController } from "react-hook-form";

import { DAY_OFF_WEEK_OPTIONS } from "@/constants/date-time";
import DayOfWeekSelect, { DayOfWeekSelectProps } from "../../../DayOfWeekSelect";
import { type ClassRoom } from "../../classroom-form.schema";

type SessionWeeklyError = FieldErrors<{
  from: string;
  to: string;
}>;
interface SessionFromToDateLearningPathProps {
  sessionIndex: number;
  control: Control<ClassRoom>;
}
const SessionFromToDateLearningPath: React.FC<SessionFromToDateLearningPathProps> = ({ control, sessionIndex }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name: `classRoomSessions.${sessionIndex}.weeklySchedule` });

  console.log({ error });
  const handleSelectDay = useCallback(
    (direction: "from" | "to"): DayOfWeekSelectProps["onChange"] =>
      (optValue, option) => {
        let updateDayValue = { ...(value ?? {}) };
        if (direction === "from") {
          updateDayValue = {
            ...(updateDayValue || {}),
            from: {
              ...updateDayValue?.from,
              day: optValue,
            },
            to: undefined,
          };
        } else {
          updateDayValue = {
            ...(updateDayValue || {}),
            to: {
              ...updateDayValue?.to,
              day: optValue,
            },
          };
        }
        onChange(updateDayValue);
      },
    [onChange, value],
  );

  const handleChangeTime = useCallback(
    (direction: "from" | "to"): TimePickerProps["onChange"] =>
      (dateValue) => {
        if (!dateValue) return;

        let updateTimeValue = value ? { ...(value || {}) } : undefined;
        if (direction === "from") {
          updateTimeValue = {
            ...(updateTimeValue || {}),
            from: {
              ...updateTimeValue?.from,
              time: dateValue.toISOString(),
            },
            to: {
              ...updateTimeValue?.to,
              time: undefined,
            },
          };
        }

        if (direction === "to") {
          updateTimeValue = {
            ...(updateTimeValue || {}),
            to: {
              ...updateTimeValue?.to,
              time: dateValue.toISOString(),
            },
          };
        }
        onChange(updateTimeValue);
      },
    [value, onChange],
  );

  const getErrorMessage = (err: SessionWeeklyError) => {
    return err?.from?.message || err?.to?.message || err?.root?.message;
  };
  const filterDayOptionBySelectedFrom = useCallback(
    (options: typeof DAY_OFF_WEEK_OPTIONS) => {
      const dayValue = value?.from?.day;

      if (!dayValue) return options;

      const currentIndex = options.findIndex((opt) => opt.value === dayValue);
      const currentOption = options[currentIndex];
      if (currentIndex === -1 || !currentOption) return options;

      const nextOption = options[currentIndex + 1] ?? options[0];

      return nextOption ? [currentOption, nextOption] : [currentOption];
    },
    [value],
  );

  const maxFromTime = useMemo(() => {
    if (!value?.to?.time) return dayjs().endOf("day");

    if (value.to.time && value?.to?.day !== value?.from?.day) return dayjs().endOf("day");

    return dayjs(value.to.time);
  }, [value]);

  const minToTime = useMemo(() => {
    const baseTime = dayjs("2000-01-01");

    if (!value?.from?.time) return baseTime.startOf("day").add(15, "minutes");

    if (value?.from?.time && value?.to?.day !== value?.from?.day) return baseTime.startOf("day").add(15, "minutes");

    return dayjs(value?.from?.time).add(15, "minutes");
  }, [value]);

  return (
    <div>
      <FormLabel component="div">
        Ngày diễn ra định kỳ hàng tuần <span className="text-red-600">*</span>
      </FormLabel>
      <div className="h-6"></div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FormLabel component="div" className="text-nowrap w-24 inline-block mb-0">
            Từ ngày
          </FormLabel>
          <div className="flex-1 flex items-center gap-2 max-w-[320px]">
            <FormControl>
              <DayOfWeekSelect
                value={value?.from?.day}
                onChange={handleSelectDay("from")}
                options={DAY_OFF_WEEK_OPTIONS}
              />
            </FormControl>
            <FormControl>
              <TimePicker
                ampm={false}
                minutesStep={5}
                value={value?.from?.time ? dayjs(value?.from?.time) : null}
                closeOnSelect
                minTime={dayjs().startOf("day")}
                maxTime={maxFromTime}
                onChange={handleChangeTime("from")}
              />
            </FormControl>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FormLabel component="div" className="text-nowrap w-24 inline-block mb-0">
            Đến ngày
          </FormLabel>
          <div className="flex-1 flex items-center gap-2 max-w-[320px]">
            <FormControl>
              <DayOfWeekSelect
                value={value?.to?.day}
                onChange={handleSelectDay("to")}
                options={filterDayOptionBySelectedFrom(DAY_OFF_WEEK_OPTIONS)}
              />
            </FormControl>

            <FormControl>
              <TimePicker
                ampm={false}
                closeOnSelect
                value={value?.to?.time ? dayjs(value?.to.time) : null}
                onChange={handleChangeTime("to")}
                minTime={minToTime}
              />
            </FormControl>
          </div>
        </div>
      </div>

      {getErrorMessage(error as SessionWeeklyError) ? (
        <FormHelperText error>{getErrorMessage(error as SessionWeeklyError)}</FormHelperText>
      ) : null}
    </div>
  );
};
export default memo(SessionFromToDateLearningPath);
