import React, { memo, useId } from "react";
import { FormControl, FormHelperText, FormLabel, Radio, RadioGroup, Rating } from "@mui/material";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

export interface RHFRatingFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  options: { value: string; label: React.ReactNode; [key: string]: any }[];
  direction?: "vertical" | "horizontal";
  max?: number;
}
const RHFRatingField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  required,
  max = 5,
}: RHFRatingFieldProps<T>) => {
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
              {required ? <span className="ml-1 text-red-600">*</span> : null}
            </FormLabel>
          ) : null}
          <Rating max={max} {...field} className="w-fit" size="large" />
          {error?.message ? <FormHelperText error={!!error}>{error.message}</FormHelperText> : null}
        </FormControl>
      )}
    />
  );
};
export default RHFRatingField;
