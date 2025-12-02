import { DateField as XDateField } from "@mui/x-date-pickers";
import type { DateFieldProps } from "@mui/x-date-pickers";
import React, { memo, useCallback, useMemo } from "react";
import type { Control, PathValue, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { cn } from "@/utils";
import CustomDatePickerField from "../CustomDatePickerField";
export const DATE_PICKER_FORMAT = {
  "DD/MM/YYYY": "DD/MM/YYYY",
  "DD-MM-YYYY": "DD-MM-YYYY",
} as const;

export type DatePickerFormat = keyof typeof DATE_PICKER_FORMAT;

interface DatePickerProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: React.ReactNode | string;
  control: Control<T>;
  name: Path<T>;
  format?: DatePickerFormat;
  required?: boolean;
}
const DatePicker = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  placeholder,
  format = "DD/MM/YYYY",
  required,
}: DatePickerProps<T>) => {
  const datePickerProps = useMemo<DateFieldProps>(() => {
    return {
      format,
      label,
      required,
      placeholder,
      className: cn("date-picker", className),
    };
  }, [format, label, required, placeholder]);

  const getValueDatePicker = useCallback((value: PathValue<T, Path<T>>) => {
    if (value && typeof value === "string") {
      console.log(dayjs(value).isValid());
      return dayjs(value).isValid() ? dayjs(value) : null;
    }
  }, []);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <CustomDatePickerField
          {...datePickerProps}
          value={getValueDatePicker(value)?? null}
          onChange={onChange}
          helperText={error?.message} 
          error={!!error}
        />
      )}
    />
  );
};
export default DatePicker;
