import React, { memo } from "react";
import { MenuItem, Select, SelectProps, Typography } from "@mui/material";

import { DAY_OFF_WEEK_OPTIONS } from "@/constants/date-time";
import { DayOfWeek } from "@/model/enum-type.model";

export interface DayOfWeekSelectProps {
  value?: DayOfWeek;
  onChange?: (value: DayOfWeek, option?: (typeof DAY_OFF_WEEK_OPTIONS)[number]) => void;
  options?: typeof DAY_OFF_WEEK_OPTIONS;
}
const DayOfWeekSelect: React.FC<DayOfWeekSelectProps> = ({ value, onChange, options = [] }) => {
  const handleChange: SelectProps["onChange"] = (evt) => {
    const optValue = evt.target.value as DayOfWeek;
    const option = options.find((opt) => opt.value === optValue);

    if (optValue) onChange?.(optValue, option);
  };
  const getOptionFromValue = (optValue: DayOfWeek | string) => {
    return options.find((opt) => opt.value === optValue);
  };

  console.log("render selecttt");
  return (
    <Select
      value={value || ""}
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
export default memo(DayOfWeekSelect);
