import { Checkbox, CheckboxProps, FormControl, FormControlLabel, FormHelperText } from "@mui/material";
import React, { memo } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";

interface RHFCheckboxFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  control: Control<T>;
  name: Path<T>;
  slotProps?: {
    checkbox?: {
      size: CheckboxProps["size"];
    };
  };
}
const RHFCheckboxField = <T extends FieldValues>({
  className,
  control,
  name,
  label,
  slotProps: { checkbox } = {},
}: RHFCheckboxFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl className={className} error={!!error}>
          <FormControlLabel
            {...field}
            control={<Checkbox {...checkbox} />}
            name={name}
            label={label}
            sx={{
              ".MuiTypography-root": {
                fontSize: "0.875rem",
              },
            }}
          />
          {error?.message ? <FormHelperText error={!!error}>{error.message}</FormHelperText> : null}
        </FormControl>
      )}
    />
  );
};
export default RHFCheckboxField;
