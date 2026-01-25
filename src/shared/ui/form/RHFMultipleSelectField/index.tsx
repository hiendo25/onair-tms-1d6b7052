"use client";
import React, { memo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import MultipleSelectField, { MultipleSelectFieldProps } from "../MultipleSelectField";

export interface RHFMultipleSelectFieldProps<T extends FieldValues, O> {
  className?: string;
  label?: string;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  options?: MultipleSelectFieldProps<O>["options"];
  optionField?: MultipleSelectFieldProps<O>["optionField"];
  required?: boolean;
  onInputEnter?: MultipleSelectFieldProps<O>["onInputEnter"];
  isLoading?: boolean;
}
const RHFMultipleSelectField = <T extends FieldValues, O>({
  className,
  control,
  name,
  label,
  placeholder,
  options = [],
  required,
  optionField,
  onInputEnter,
  isLoading,
}: RHFMultipleSelectFieldProps<T, O>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <MultipleSelectField
          value={field.value}
          onChange={field.onChange}
          error={!!error}
          helperText={error?.message}
          placeholder={placeholder}
          optionField={optionField}
          options={options}
          label={label}
          required={required}
          onInputEnter={onInputEnter}
          onRemoveOptionItem={(val) => {
            const values = field.value as string[];
            field.onChange(values.filter((it) => it !== val));
          }}
          isLoading={isLoading}
        />
      )}
    />
  );
};
export default memo(RHFMultipleSelectField) as typeof RHFMultipleSelectField;
