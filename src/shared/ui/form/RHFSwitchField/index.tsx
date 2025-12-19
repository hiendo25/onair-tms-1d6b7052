"use client";
import React, { memo, useId } from "react";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Typography,
} from "@mui/material";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Android12Switch } from "../CustomSwithcher";
interface RHFSwitcherFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  offValue?: string;
  onValue?: string;
  className?: string;
  label?: React.ReactNode;
}
const RHFSwitcherField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  offValue = "",
  onValue = "",
  required,
}: RHFSwitcherFieldProps<T>) => {
  const fieldId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl className={className} error={!!error}>
          {label ? (
            <FormLabel htmlFor={fieldId}>
              {label}
              {required ? <span className="ml-1">*</span> : null}
            </FormLabel>
          ) : null}
          <div className="flex gap-x-1 items-center -ml-2">
            <Android12Switch value={field.value} onChange={field.onChange} />
            {onValue || offValue ? (
              <Typography sx={{ fontSize: "0.875rem" }}>
                {field.value ? onValue : offValue}
              </Typography>
            ) : null}
          </div>
          {error?.message ? (
            <FormHelperText error={!!error}>{error.message}</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
};
export default RHFSwitcherField;
