import React, { useId } from "react";
import { FormControl, FormHelperText, FormLabel, SxProps, TextFieldProps, Theme } from "@mui/material";
import { Control, Controller, FieldValues, Path, useFormContext } from "react-hook-form";

import { InputDecimalField } from "./InputDecimalField";

interface RHFInputDecimalFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  disabled?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  type?: "number" | "text";
  helpText?: React.ReactNode;
  sx?: SxProps<Theme>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: "small" | "medium";
}

export const RHFInputDecimalField = <T extends FieldValues>({
  name,
  control,
  label,
  required,
  className,
  sx,
  helpText,
  ...restProps
}: RHFInputDecimalFieldProps<T>) => {
  const fieldId = useId();
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
          <InputDecimalField
            {...field}
            {...restProps}
            onChange={(value) => field.onChange(value ? Number(value) : "")}
            value={field.value ?? ""}
            error={!!error}
            helperText={error?.message}
          />
          {error?.message ? <FormHelperText>{error.message}</FormHelperText> : null}
          {helpText && !error?.message ? <div className="mt-2">{helpText}</div> : null}
        </FormControl>
      )}
    />
  );
};
