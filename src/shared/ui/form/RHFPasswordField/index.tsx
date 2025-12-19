import React, { memo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import PasswordField from "../PasswordField";
interface RHFPasswordFieldProps<T extends FieldValues> {
  className?: string;
  label?: React.ReactNode;
  placeholder?: string;
  control: Control<T>;
  name: Path<T>;
  required?: boolean;
  disabled?: boolean;
}
const RHFPasswordField = <T extends FieldValues>({
  className,
  control,
  name,
  ...restProps
}: RHFPasswordFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <PasswordField
          {...restProps}
          {...field}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
};
export default RHFPasswordField;
