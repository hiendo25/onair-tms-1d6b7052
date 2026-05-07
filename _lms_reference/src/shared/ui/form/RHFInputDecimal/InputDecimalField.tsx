import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

import { formatNumber } from "@/utils/format-number";

interface InputDecimalFieldProps extends Omit<TextFieldProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export const InputDecimalField: React.FC<InputDecimalFieldProps> = ({ value, onChange, slotProps, ...other }) => {
  const parseNumber = (formattedValue: string): string => {
    return formattedValue.replace(/[^\d]/g, "");
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const formattedValue = e.target.value;
    const rawValue = parseNumber(formattedValue);
    onChange(rawValue);
  };

  return (
    <TextField
      {...other}
      value={formatNumber(value ?? "")}
      onChange={handleOnChange}
      slotProps={{
        ...slotProps,
      }}
    />
  );
};
