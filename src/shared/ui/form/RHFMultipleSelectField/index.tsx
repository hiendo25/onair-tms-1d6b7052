"use client";
import React from "react";
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
  onRemove?: MultipleSelectFieldProps<O>["onRemoveOptionItem"];
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
  onRemove,
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
          onRemoveOptionItem={onRemove}
          isLoading={isLoading}
        />
      )}
    />
  );
};
export default RHFMultipleSelectField;
