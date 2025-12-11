import React, { memo, useCallback } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import CustomDateTimePickerField, { CustomDateTimePickerFieldProps } from "../CustomDateTimePickerField";
import { PickerValue } from "@mui/x-date-pickers/internals";

export const DATE_TIME_PICKER_FORMAT = {
  "HH:mm DD/MM/YYYY": "HH:mm DD/MM/YYYY",
} as const;

export type DateTimePickerFormat = keyof typeof DATE_TIME_PICKER_FORMAT;

interface RHFDateTimePickerProps<T extends FieldValues> extends CustomDateTimePickerFieldProps {
  className?: string;
  label?: React.ReactNode;
  control: Control<T>;
  name: Path<T>;
  format?: DateTimePickerFormat;
}
const RHFDateTimePicker = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  format = "HH:mm DD/MM/YYYY",
  ...restProps
}: RHFDateTimePickerProps<T>) => {
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
        <CustomDateTimePickerField
          {...restProps}
          value={getValueDatePicker(value)}
          ampm={false}
          format={format}
          onChange={(value) => onChange(formatDateToIsoStr(value))}
          error={!!error}
          label={label}
          // onAccept={(value) => {
          //   console.log(value);
          // }}
          slotProps={{
            actionBar: { actions: ["clear", "nextOrAccept"] }, // only show "OK"
          }}
          helperText={error?.message}
        />
      )}
    />
  );
};
export default RHFDateTimePicker;
