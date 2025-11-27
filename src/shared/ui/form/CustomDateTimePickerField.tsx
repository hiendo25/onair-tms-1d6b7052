import { DateTimePickerProps, DateTimePicker } from "@mui/x-date-pickers";
import { FormControl, FormLabel, FormHelperText, alpha, styled } from "@mui/material";
import { useId } from "react";
import { cn } from "@/utils";
import dayjs from "dayjs";
export interface CustomDateTimePickerFieldProps extends DateTimePickerProps {
  helperText?: string;
  error?: boolean;
  required?: boolean;
}
const CustomDateTimePickerField: React.FC<CustomDateTimePickerFieldProps> = ({
  label,
  className = "",
  helperText,
  error,
  required,
  ...restProps
}) => {
  const fieldId = useId();
  return (
    <StyledFormControl
      className={cn("custom-time-picker-field", className, {
        "is-error": !!error,
      })}
      error={error}
    >
      {label ? (
        <FormLabel htmlFor={fieldId}>
          {label} {required ? <span className="text-red-600">*</span> : null}
        </FormLabel>
      ) : null}
      <DateTimePicker
        sx={{
          ".MuiPickersInputBase-root": {
            background: "white",
          },
        }}
        {...restProps}
        dayOfWeekFormatter={(day) => {
          const map: Record<string, string> = {
            0: "CN",
            1: "T2",
            2: "T3",
            3: "T4",
            4: "T5",
            5: "T6",
            6: "T7",
          };
          return map[dayjs(day).get("days")] || "unknown";
        }}
      />
      {helperText ? <FormHelperText error={!!error}>{helperText}</FormHelperText> : null}
    </StyledFormControl>
  );
};
export default CustomDateTimePickerField;

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  ".MuiPickersSectionList-root": {
    padding: "0.625rem 0",
    fontSize: "0.875rem",
  },
  "&.is-error": {
    ".MuiPickersOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.error.main} !important`,
      background: alpha(theme.palette.error.main, 0.05),
    },
  },
  ".MuiButtonBase-root": {
    width: "2rem",
    height: "2rem",
    ".MuiSvgIcon-root": {
      fontSize: "1.2rem",
    },
  },
}));
