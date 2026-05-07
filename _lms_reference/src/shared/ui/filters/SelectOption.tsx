"use client";

import * as React from "react";
import { FormControl, MenuItem, Select, SxProps, Theme } from "@mui/material";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface StatusSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  size?: "small" | "medium";
  minWidth?: number;
  sx?: SxProps<Theme>;
}

const SelectOption = <T extends string>({
  value,
  onChange,
  options,
  size = "small",
  minWidth = 200,
  sx,
}: StatusSelectProps<T>) => {
  return (
    <FormControl size={size} sx={{ minWidth }}>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        sx={{
          backgroundColor: "grey.200",
          color: "grey.400",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          ...sx,
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default React.memo(SelectOption) as typeof SelectOption;
