"use client";
import React, { useId } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import SelectField, { SelectFieldProps } from "../SelectField";

type OptionType = { id: string | number; label?: string };

interface RHFSelectFieldProps<T extends FieldValues, K extends OptionType> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  options?: K[];
  multiple?: boolean;
  optionField?: SelectFieldProps["optionField"];
  required?: boolean;
}
const RHFSelectField = <T extends FieldValues, K extends OptionType>({
  className,
  control,
  name,
  label,
  placeholder,
  options = [],
  multiple = true,
  required,
  optionField,
}: RHFSelectFieldProps<T, K>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <SelectField
          value={field.value}
          onChange={field.onChange}
          error={!!error}
          helperText={error?.message}
          placeholder={placeholder}
          optionField={optionField}
          options={options}
          label={label}
          multiple={multiple}
          required={required}
        />
      )}
    />
  );
};
export default RHFSelectField;
