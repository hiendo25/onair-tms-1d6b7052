import React, { useId } from "react";
import { alpha, FormControl, FormHelperText, FormLabel } from "@mui/material";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";

import { cn } from "@/utils";
export interface CustomDatePickerFieldProps extends DatePickerProps {
  helperText?: string;
  error?: boolean;
  required?: boolean;
}
const CustomDatePickerField: React.FC<CustomDatePickerFieldProps> = ({
  label,
  className,
  helperText,
  error,
  required,
  ...restProps
}) => {
  const fieldId = useId();
  return (
    <FormControl
      className={cn("custom-time-picker-field", className, {
        "is-error": !!error,
      })}
      error={error}
      sx={(theme) => ({
        ".MuiPickersSectionList-root": {
          padding: "0.75rem 0",
        },
        "&.is-error": {
          ".MuiPickersOutlinedInput-notchedOutline": {
            borderColor: `${theme.palette.error.main} !important`,
            background: alpha(theme.palette.error.main, 0.05),
          },
        },
        ".MuiButtonBase-root": {
          width: "2rem",
          height: "2rem",
          ".MuiSvgIcon-root": {
            fontSize: "1.2rem",
          },
        },
      })}
    >
      {label ? (
        <FormLabel htmlFor={fieldId}>
          {label} {required ? <span>*</span> : null}
        </FormLabel>
      ) : null}
      <DatePicker {...restProps} />
      {helperText ? <FormHelperText error={!!error}>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
export default CustomDatePickerField;
