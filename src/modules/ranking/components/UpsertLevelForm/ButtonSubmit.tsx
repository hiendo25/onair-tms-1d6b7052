import React, { memo, useMemo } from "react";
import { Button, ButtonProps } from "@mui/material";
import { useWatch } from "react-hook-form";

import { UpsertLevelFormData } from "./upsert-level.schema";
interface ButtonSubmitProps extends ButtonProps {
  isLoading?: boolean;
  className?: string;
}
const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ isLoading, children, className, ...restProps }) => {
  const values = useWatch<UpsertLevelFormData>({
    name: ["title", "icon", "scoreRequired"],
  });
  const isDisabledButton = useMemo(() => {
    return values.some((v) => {
      if (Array.isArray(v)) return v.length === 0;
      return !v;
    });
  }, [values]);
  return (
    <Button disabled={isLoading || isDisabledButton} loading={isLoading} className={className} {...restProps}>
      {children}
    </Button>
  );
};
export default memo(ButtonSubmit);
