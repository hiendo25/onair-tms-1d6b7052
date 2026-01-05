import React, { memo, useMemo } from "react";
import { Button, ButtonProps } from "@mui/material";
import { useWatch } from "react-hook-form";

import { ClassRoom } from "./classroom-form.schema";
import { useClassRoomFormContext } from "./ClassRoomFormContainer";
interface ButtonSubmitProps extends ButtonProps {
  initialValue?: ClassRoom;
  isLoading?: boolean;
}
const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ isLoading, initialValue, children, ...buttonProps }) => {
  const values = useWatch<ClassRoom>({
    name: ["title", "description", "thumbnailUrl", "categories", "classRoomSessions"],
  });
  const isDisabledButton = useMemo(() => {
    return values.some((v) => {
      if (Array.isArray(v)) return v.length === 0;
      return !v;
    });
  }, [values]);
  return (
    <Button {...buttonProps} disabled={isLoading || isDisabledButton} loading={isLoading}>
      {children}
    </Button>
  );
};
export default memo(ButtonSubmit);
