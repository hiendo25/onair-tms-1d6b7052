"use client";
import React, { memo, useId } from "react";
import { FormControl, FormHelperText, FormLabel, OutlinedInput, SxProps, Theme } from "@mui/material";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { cn } from "@/utils";

export interface RHFTextFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  subLabel?: React.ReactNode;
  note?: React.ReactNode;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  disabled?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helpText?: React.ReactNode;
  type?: "text" | "password";
  sx?: SxProps<Theme>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: "small" | "medium";
}
const RHFTextField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  subLabel,
  note,
  placeholder,
  required,
  disabled,
  endAdornment,
  startAdornment,
  helpText,
  sx,
  inputProps,
  size,
  type = "text",
}: RHFTextFieldProps<T>) => {
  const fieldId = useId();

  const renderSubContent = (content: React.ReactNode, type: "note" | "subLabel") => {
    if (typeof content === "string") {
      return (
        <FormHelperText
          error={false}
          className={cn("mx-0", {
            "mb-3": type === "subLabel",
            "mt-3": type === "note",
          })}
        >
          {content}
        </FormHelperText>
      );
    }
    return (
      <div
        className={cn("text-xs", {
          "mb-3": type === "subLabel",
          "mt-3": type === "note",
        })}
      >
        {content}
      </div>
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <FormControl className={className} error={!!error} sx={sx}>
            {label ? (
              <FormLabel htmlFor={fieldId}>
                {label}
                {required ? <span className="ml-1 text-red-600">*</span> : null}
              </FormLabel>
            ) : null}
            {subLabel && renderSubContent(subLabel, "subLabel")}
            <OutlinedInput
              {...field}
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              size={size}
              id={fieldId}
              type={type}
              sx={{
                background: "white",
              }}
              startAdornment={startAdornment}
              endAdornment={endAdornment}
              inputProps={inputProps}
            />
            {error?.message ? (
              <FormHelperText error className="mx-0">
                {error.message}
              </FormHelperText>
            ) : null}
            {helpText && !error?.message ? <div className="mt-2">{helpText}</div> : null}
            {note && renderSubContent(note, "note")}
          </FormControl>
        </>
      )}
    />
  );
};
export default memo(RHFTextField) as typeof RHFTextField;
