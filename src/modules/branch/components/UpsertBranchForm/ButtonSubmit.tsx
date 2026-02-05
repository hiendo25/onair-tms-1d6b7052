import React, { memo, useMemo } from "react";
import { Button, ButtonProps } from "@mui/material";
import { useWatch } from "react-hook-form";

import { UpsertBranchFormData } from "./upsert-branch.schema";
interface ButtonSubmitProps extends ButtonProps {
  isLoading?: boolean;
  className?: string;
}
const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ isLoading, children, className, ...restProps }) => {
  const values = useWatch<UpsertBranchFormData>({
    name: ["name", "code"],
  });
  const isDisabledButton = useMemo(() => {
    return values.some((v) => {
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
