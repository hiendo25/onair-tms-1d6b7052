"use client";
import React, { memo, useId } from "react";
import { FormControl, FormLabel } from "@mui/material";
import { Control, Controller, FieldValues, Path, PathValue } from "react-hook-form";

import TinyEditor from "../TinyEditor";

interface RHFTinyEditorProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: React.ReactNode | string;
  control: Control<T>;
  name: Path<T>;
  type?: "text";
  defaultValue?: PathValue<T, Path<T>>;
  minHeight?: number;
  maxHeight?: number;
  required?: boolean;
}
const RHFTinyEditor = <T extends FieldValues>({
  label,
  control,
  defaultValue,
  name,
  className,
  required,
  minHeight,
  maxHeight,
}: RHFTinyEditorProps<T>) => {
  const fieldId = useId();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => (
        <FormControl className={className} error={!!error}>
          {label ? (
            <FormLabel htmlFor={fieldId}>
              {label}
              {required ? <span className="ml-1 text-red-600">*</span> : null}
            </FormLabel>
          ) : null}
          <TinyEditor
            {...field}
            error={!!error}
            minHeight={minHeight}
            maxHeight={maxHeight}
            helperText={error?.message}
          />
        </FormControl>
      )}
    />
  );
};

export default RHFTinyEditor;
