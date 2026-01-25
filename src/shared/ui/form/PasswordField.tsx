import React, { memo, useState } from "react";
import { useId } from "react";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
} from "@mui/material";

import { EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
interface PasswordFieldProps extends OutlinedInputProps {
  className?: string;
  helperText?: string;
}
const PasswordField = ({
  className,
  required,
  error,
  helperText,
  label,
  ...restProps
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = useId();
  return (
    <FormControl className={className} error={!!error}>
      {label ? (
        <FormLabel htmlFor={fieldId}>
          {label}
          {required ? <span>*</span> : null}
        </FormLabel>
      ) : null}
      <OutlinedInput
        size="small"
        id={fieldId}
        type={showPassword ? "text" : "password"}
        sx={{ paddingRight: 0 }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((prev) => !prev)}
              sx={{
                backgroundColor: "transparent",
                borderRadius: "100%",
                "&:hover": { backgroundColor: "transparent" },
              }}
              className="p-0"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 stroke-gray-500 hover:stroke-gray-800" />
              ) : (
                <EyeOffIcon className="w-5 h-5 stroke-gray-500 hover:stroke-gray-800" />
              )}
            </IconButton>
          </InputAdornment>
        }
        {...restProps}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
export default PasswordField;
