import React, { memo } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormHelperText,
} from "@mui/material";

interface CheckboxFieldProps extends Omit<FormControlLabelProps, "control"> {
  error?: boolean;
  helperText?: string;
}
const CheckboxField: React.FC<CheckboxFieldProps> = ({
  className,
  label,
  value,
  error,
  helperText,
  onChange,
}) => {
  return (
    <FormControl className={className} error={!!error}>
      <FormControlLabel
        control={<Checkbox />}
        label={label}
        value={value}
        onChange={onChange}
        sx={{
          ".MuiTypography-root": {
            fontSize: "0.875rem",
          },
        }}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
export default CheckboxField;
