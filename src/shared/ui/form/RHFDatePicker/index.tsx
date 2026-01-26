import React, { memo, useCallback, useMemo } from "react";
import type { DateFieldProps } from "@mui/x-date-pickers";
import { DateField as XDateField } from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs, { Dayjs } from "dayjs";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

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
const RHFDatePicker = <T extends FieldValues>({
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
    if (!value) return null;
    return dayjs(value).isValid() ? dayjs(value) : null;
  }, []);

  const formatDateToIsoStr = useCallback((value: PickerValue) => {
    if (!value) return null;
    return dayjs(value).isValid() ? dayjs(value).toISOString() : null;
  }, []);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <CustomDatePickerField
          {...datePickerProps}
          value={getValueDatePicker(value)}
          onChange={(value) => onChange(formatDateToIsoStr(value))}
          helperText={error?.message}
          error={!!error}
        />
      )}
    />
  );
};
export default RHFDatePicker;
