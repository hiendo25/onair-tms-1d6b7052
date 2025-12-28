"use client";
import React, { memo } from "react";
import { FormControl, FormLabel, MenuItem, Select, SelectProps, Typography } from "@mui/material";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Control, useController } from "react-hook-form";

import { DAY_OFF_WEEK_OPTIONS } from "@/constants/date-time";
import { DayOfWeek } from "@/model/enum-type.model";
import { type ClassRoom } from "../../classroom-form.schema";

interface SessionFromToDateLearningPathProps {
  control: Control<ClassRoom>;
  sessionIndex: number;
}
const SessionFromToDateLearningPath: React.FC<SessionFromToDateLearningPathProps> = ({ control, sessionIndex }) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: `classRoomSessions.${sessionIndex}.weeklySchedule` });

  const handleSelectDay =
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
          to: {
            day: "",
            time: "",
          },
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
      onChange(updateDayValue);
    };

  const handleChangeTime =
    (direction: "from" | "to"): TimePickerProps["onChange"] =>
    (dateValue) => {
      if (!dateValue) return;
      const updateTimeValue = {
        ...(value || {}),
        [direction]: {
          ...value?.[direction],
          time: dateValue.toISOString(),
        },
      };
      onChange(updateTimeValue);
    };
  console.log({ value });
  const filterDayOptionBySelectedFrom = (options: typeof DAY_OFF_WEEK_OPTIONS) => {
    const dayValue = value?.from.day;

    if (!dayValue) return options;

    const currentIndex = options.findIndex((opt) => opt.value === dayValue);
    const currentOption = options[currentIndex];
    if (currentIndex === -1 || !currentOption) return options;

    const nextOption = options[currentIndex + 1] ?? options[0];

    return nextOption ? [currentOption, nextOption] : [currentOption];
  };

  return (
    <div>
      <FormLabel>
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
                value={value?.from.time ? dayjs(value?.from.time) : dayjs().startOf("day")}
                closeOnSelect
                maxTime={value?.to?.time ? dayjs(value.to.time) : undefined}
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
                value={value?.to?.time ? dayjs(value?.to.time) : dayjs().startOf("day").add(15, "minutes")}
                onChange={handleChangeTime("to")}
                minTime={value?.from?.time ? dayjs(value.from.time).add(15, "minutes") : undefined}
              />
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(SessionFromToDateLearningPath);

interface DayOfWeekSelectProps {
  value?: DayOfWeek | string;
  onChange: (value: DayOfWeek, option?: (typeof DAY_OFF_WEEK_OPTIONS)[number]) => void;
  options: typeof DAY_OFF_WEEK_OPTIONS;
}
const DayOfWeekSelect: React.FC<DayOfWeekSelectProps> = ({ value = "", onChange, options }) => {
  const handleChange: SelectProps["onChange"] = (evt) => {
    const optValue = evt.target.value as DayOfWeek;
    const option = options.find((opt) => opt.value === optValue);

    if (optValue) onChange(optValue, option);
  };
  const getOptionFromValue = (optValue: DayOfWeek | string) => {
    return options.find((opt) => opt.value === optValue);
  };
  return (
    <Select
      value={value ?? ""}
      displayEmpty
      onChange={handleChange}
      renderValue={(selected) => {
        return selected ? (
          getOptionFromValue(selected)?.label
        ) : (
          <Typography className="text-sm text-gray-500">Chọn ngày</Typography>
        );
      }}
    >
      <MenuItem disabled value="">
        <Typography className="text-sm font-medium">Chọn ngày</Typography>
      </MenuItem>
      {options.map((day) => (
        <MenuItem key={day.value} value={day.value}>
          <div key={day.value}>
            <Typography className="text-sm font-medium">{day.label}</Typography>
          </div>
        </MenuItem>
      ))}
    </Select>
  );
};
