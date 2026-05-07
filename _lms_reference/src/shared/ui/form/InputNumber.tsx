import React, { forwardRef } from "react";
import { styled } from "@mui/material";

import { cn } from "@/utils";

type BaseInputNumberType = React.ComponentProps<"input">;

const BaseInputNumber = forwardRef<HTMLInputElement, BaseInputNumberType>((props, ref) => {
  const StyledInput = styled("input")(() => ({
    "-webkit-tap-highlight-color": "transparent",
    width: "100%",
    border: "none",
    margin: 0,
    boxSizing: "content-box",
    outline: "none",
    height: "1.4375em",
    letterSpacing: "inherit",
    background: "none",
    font: "inherit",
    padding: "0.625rem 0.875rem;",
    "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
      //  WebkitAppearance: "none",
      margin: 0,
    },
  }));
  return <StyledInput {...props} ref={ref} type="number" />;
});

interface InputNumberProps extends BaseInputNumberType {
  className?: string;
}
const InputNumber: React.FC<InputNumberProps> = ({ className, ...restProps }) => {
  const StyledInputRoot = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    fontFamily: theme.typography.fontFamily,
    lineHeight: "1.4375em",
    display: "inline-flex",
    width: "100%",
    fontSize: "14px",
    "&:hover": {
      fieldset: {
        borderColor: theme.palette.grey[500],
      },
    },
    "input:focus ~": {
      fieldset: {
        borderColor: theme.palette.primary["main"],
        borderWidth: "2px",
      },
    },
    fieldset: {
      textAlign: "left",
      position: "absolute",
      bottom: 0,
      right: 0,
      top: 0,
      left: 0,
      margin: 0,
      padding: "0 8px",
      pointerEvents: "none",
      borderRadius: "inherit",
      border: "1px solid",
      borderColor: theme.palette.grey[300],
      overflow: "hidden",
    },
  }));
  return (
    <StyledInputRoot className={cn("", className)}>
      <BaseInputNumber {...restProps} />
      <fieldset>
        <legend>
          <span className="notranslate" aria-hidden="true"></span>
        </legend>
      </fieldset>
    </StyledInputRoot>
  );
};
export default InputNumber;
