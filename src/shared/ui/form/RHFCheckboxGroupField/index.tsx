import React, { memo } from "react";
import { useId } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@mui/material";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

interface RHFCheckboxGroupFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  options: { value: string; label: string }[];
  direction?: "vertical" | "horizontal";
}
const RHFCheckboxGroupField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  options,
  required,
  direction,
}: RHFCheckboxGroupFieldProps<T>) => {
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
          <FormGroup
            row={direction === "horizontal"}
            aria-labelledby="Radio"
            {...field}
          >
            {options.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Checkbox />}
                label={opt.label}
              />
            ))}
          </FormGroup>
          {error?.message ? (
            <FormHelperText error={!!error}>{error.message}</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
};
export default RHFCheckboxGroupField;
