"use client";
import React, { memo, useCallback, useMemo } from "react";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormHelperText,
  OutlinedInput,
  OutlinedInputProps,
} from "@mui/material";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Control, FieldErrors, useController, useWatch } from "react-hook-form";

import { DAY_OFF_WEEK_OPTIONS } from "@/constants/date-time";
import DayOfWeekSelect, { DayOfWeekSelectProps } from "@/modules/class-room-management/components/DayOfWeekSelect";
import { ArrowRightIcon } from "@/shared/assets/icons";
import { IOSSwitch } from "@/shared/ui/form/CustomSwitcher";
import type { ClassRoomFormValues } from "../../../classroom-form.schema";
type CoursePeriodWeeklyErrors = FieldErrors<{
  from: string;
  to: string;
  duration: string;
}>;
interface FromToDayTimeProps {
  control: Control<ClassRoomFormValues>;
  sessionIndex: number;
  coursePeriodIndex: number;
}
const FromToDayTime: React.FC<FromToDayTimeProps> = ({ control, coursePeriodIndex, sessionIndex }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}.weeklySchedule`,
  });

  const handleSelectDay = useCallback(
    (direction: "from" | "to"): DayOfWeekSelectProps["onChange"] =>
      (optValue, option) => {
        let updateDayValue = {};
        if (direction === "from") {
          updateDayValue = {
            ...(value || {}),
            [direction]: {
              ...value?.[direction],
              day: optValue,
            },
            to: undefined,
          };
        } else {
          updateDayValue = {
            ...(value || {}),
            [direction]: {
              ...value?.[direction],
              day: optValue,
            },
          };
        }
        onChange?.(updateDayValue);
      },
    [value, onChange],
  );

  const handleChangeTime = useCallback(
    (direction: "from" | "to"): TimePickerProps["onChange"] =>
      (dateValue) => {
        const updateTimeValue = {
          ...(value || {}),
          [direction]: {
            ...value?.[direction],
            time: dateValue?.toISOString(),
          },
        };
        onChange?.(updateTimeValue);
      },
    [value, onChange],
  );

  const handleChangeDurationTime = useCallback(
    (type: "hours" | "minutes"): OutlinedInputProps["onChange"] =>
      (evt) => {
        const timeValue = evt.target.value;

        const timeValueNumber = Number(timeValue);
        if (isNaN(timeValueNumber)) return;

        if (type === "hours" && (timeValueNumber > 24 || timeValueNumber < 0)) return;

        if (type === "minutes" && (timeValueNumber > 59 || timeValueNumber < 0)) return;

        const updateValue = {
          ...value,
          duration: {
            ...value?.duration,
            [type]: Number(timeValue),
          },
        };

        onChange?.(updateValue);
      },
    [value, onChange],
  );

  const toggleDuration = useCallback<Exclude<FormControlLabelProps["onChange"], undefined>>(
    (evt, checked) => {
      onChange?.({
        ...value,
        isDuration: checked,
      });
    },
    [value, onChange],
  );

  const getWeeklyScheduleErrorMessage = (error?: CoursePeriodWeeklyErrors) => {
    return error?.from?.message || error?.to?.message || error?.duration?.message;
  };

  const sessionWeeklySchedule = useWatch({
    control: control,
    name: `classRoomSessions.${sessionIndex}.weeklySchedule`,
    exact: true,
  });

  const selectDayOptionsBySessions = useMemo(() => {
    const dayFrom = sessionWeeklySchedule?.from?.day;
    const dayTo = sessionWeeklySchedule?.to?.day;
    const dayOfWeekMap = new Map(DAY_OFF_WEEK_OPTIONS.map((it) => [it.value, it]));

    let finalOptions: typeof DAY_OFF_WEEK_OPTIONS = [];
    const optDayFrom = dayFrom ? dayOfWeekMap.get(dayFrom) : undefined;
    const optDayTo = dayTo ? dayOfWeekMap.get(dayTo) : undefined;

    if (optDayFrom) {
      finalOptions = [optDayFrom];
    }

    if (optDayTo && optDayTo.value !== optDayFrom?.value) {
      finalOptions = [...finalOptions, optDayTo];
    }

    return finalOptions;
  }, [sessionWeeklySchedule]);

  const sessionRangeTime = useMemo(() => {
    return { minTime: sessionWeeklySchedule?.from?.time, maxTime: sessionWeeklySchedule?.to?.time };
  }, [sessionWeeklySchedule]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 max-w-[320px]">
            <FormControl>
              <DayOfWeekSelect
                value={value?.from?.day}
                onChange={handleSelectDay("from")}
                options={selectDayOptionsBySessions}
              />
            </FormControl>
            <FormControl>
              <TimePicker
                ampm={false}
                minutesStep={5}
                value={value?.from?.time ? dayjs(value?.from?.time) : null}
                closeOnSelect
                minTime={sessionRangeTime?.minTime ? dayjs(sessionRangeTime.minTime) : undefined}
                onChange={handleChangeTime("from")}
              />
            </FormControl>
          </div>
        </div>
        <div>
          <ArrowRightIcon className="text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 max-w-[320px]">
            <FormControl>
              <DayOfWeekSelect
                value={value?.to?.day}
                onChange={handleSelectDay("to")}
                options={selectDayOptionsBySessions}
              />
            </FormControl>
            <FormControl>
              <TimePicker
                ampm={false}
                closeOnSelect
                value={value?.to?.time ? dayjs(value?.to?.time) : null}
                onChange={handleChangeTime("to")}
                minTime={value?.from?.time ? dayjs(value.from.time) : undefined}
                maxTime={sessionRangeTime?.maxTime ? dayjs(sessionRangeTime.maxTime) : undefined}
              />
            </FormControl>
          </div>
        </div>
      </div>
      {getWeeklyScheduleErrorMessage(error) ? (
        <FormHelperText error>{getWeeklyScheduleErrorMessage(error)}</FormHelperText>
      ) : null}
      <div className="flex items-center  h-12">
        <FormControlLabel
          control={<IOSSwitch size="small" />}
          label="Thời lượng hoc"
          className="pl-3"
          sx={{
            ".MuiTypography-root": {
              marginLeft: "8px",
              fontSize: "0.875rem",
            },
          }}
          onChange={toggleDuration}
        />

        {value?.isDuration ? (
          <div className="flex items-center gap-2">
            <OutlinedInput
              value={value?.duration?.hours ?? 0}
              onChange={handleChangeDurationTime("hours")}
              type="number"
              size="small"
              sx={{
                width: 60,
              }}
            />
            <span>Giờ</span>
            <OutlinedInput
              size="small"
              onChange={handleChangeDurationTime("minutes")}
              type="number"
              value={value?.duration?.minutes ?? 0}
              sx={{
                width: 60,
              }}
            />
            <span>Phút</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default memo(FromToDayTime);
