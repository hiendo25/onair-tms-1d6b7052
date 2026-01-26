import React, { useCallback, useMemo } from "react";
import type { DateFieldProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

import { cn } from "@/utils";
import { parseDateInput } from "@/utils/date";
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
    if (!value) {
      return null;
    }

    if (dayjs.isDayjs(value)) {
      return value;
    }

    if (value instanceof Date) {
      return dayjs(value);
    }

    if (typeof value === "string" || typeof value === "number") {
      const parsed = typeof value === "string" ? parseDateInput(value) : new Date(value);
      return parsed ? dayjs(parsed) : null;
    }

    return null;
  }, []);

  const handleChange = useCallback(
    (nextValue: Dayjs | null, onChange: (value: string) => void) => {
      if (!nextValue || !nextValue.isValid()) {
        onChange("");
        return;
      }

      onChange(nextValue.format(format));
    },
    [format],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <CustomDatePickerField
          {...datePickerProps}
          value={getValueDatePicker(value)}
          onChange={(nextValue) => handleChange(nextValue, onChange)}
          helperText={error?.message}
          error={!!error}
        />
      )}
    />
  );
};
export default DatePicker;
