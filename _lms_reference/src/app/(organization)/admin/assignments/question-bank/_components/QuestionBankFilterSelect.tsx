import React, { memo } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";

type QuestionBankFilterOption = {
  label: string;
  value: string;
};

interface QuestionBankFilterSelectProps {
  value: string;
  placeholder: string;
  options: QuestionBankFilterOption[];
  onChange: (value: string) => void;
}

const QuestionBankFilterSelect = ({
  value,
  placeholder,
  options,
  onChange,
}: QuestionBankFilterSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span className="text-gray-400">{placeholder}</span>;
          }

          return options.find((option) => option.value === selected)?.label || selected;
        }}
        sx={{
          backgroundColor: "grey.200",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      >
        <MenuItem value="">
          <em>Tất cả</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default memo(QuestionBankFilterSelect);
export type { QuestionBankFilterOption };
