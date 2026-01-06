"use client";
import React, { memo, useId } from "react";
import { FormControl, FormHelperText, FormLabel, OutlinedInput, SxProps, Theme } from "@mui/material";
import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { Controller } from "react-hook-form";

export interface RHFNumberFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  disabled?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helpText?: React.ReactNode;
  sx?: SxProps<Theme>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: "small" | "medium";
}
const RHFNumberField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  placeholder,
  required,
  disabled,
  endAdornment,
  startAdornment,
  helpText,
  sx,
  inputProps,
  size,
}: RHFNumberFieldProps<T>) => {
  const fieldId = useId();
  const parseNumber = (formattedValue: string): number => {
    const numberValue = formattedValue.replace(/[^\d]/g, "");
    return parseInt(numberValue);
  };
  const formatNumber = (num: string) => Number(num).toLocaleString("vi-VN");
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl className={className} error={!!error} sx={sx}>
          {label ? (
            <FormLabel htmlFor={fieldId}>
              {label}
              {required ? <span className="ml-1 text-red-600">*</span> : null}
            </FormLabel>
          ) : null}
          <OutlinedInput
            {...field}
            value={field.value ? formatNumber(field.value) : 0}
            onChange={(evt) => {
              const rawValue = evt.target.value;
              const parsedValueToNumber = rawValue === "" ? 0 : parseNumber(rawValue);
              field.onChange(parsedValueToNumber);
            }}
            placeholder={placeholder}
            disabled={disabled}
            size={size}
            id={fieldId}
            sx={{
              background: "white",
            }}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            inputProps={inputProps}
          />
          {error?.message ? <FormHelperText>{error.message}</FormHelperText> : null}
          {helpText && !error?.message ? <div className="mt-2">{helpText}</div> : null}
        </FormControl>
      )}
    />
  );
};
export default memo(RHFNumberField) as typeof RHFNumberField;
