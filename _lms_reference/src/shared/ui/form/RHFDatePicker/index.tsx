import React, { useCallback, useMemo } from "react";
import type { DatePickerProps } from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs, { Dayjs } from "dayjs";
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

interface RHFDatePickerProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: React.ReactNode | string;
  control: Control<T>;
  name: Path<T>;
  format?: DatePickerFormat;
  required?: boolean;
  minDate?: Dayjs | null;
}
const RHFDatePicker = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  placeholder,
  format = "DD/MM/YYYY",
  required,
  minDate,
}: RHFDatePickerProps<T>) => {
  const datePickerProps = useMemo<Omit<DatePickerProps<Dayjs>, "value" | "onChange">>(() => {
    return {
      format,
      label,
      required,
      placeholder,
      className: cn("date-picker", className),
      minDate,
    };
  }, [format, label, required, placeholder, className, minDate]);

  const getValueDatePicker = useCallback((value: PathValue<T, Path<T>>) => {
    if (!value) return null;
    return dayjs(value).isValid() ? dayjs(value) : null;
  }, []);

  const formatDateToIsoStr = useCallback((value: PickerValue) => {
    if (!value) return null;
    return dayjs(value).isValid() ? dayjs(value).toISOString() : null;
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
          onChange={(value) => onChange(formatDateToIsoStr(value))}
          helperText={error?.message}
          error={!!error}
        />
      )}
    />
  );
};
export default RHFDatePicker;
