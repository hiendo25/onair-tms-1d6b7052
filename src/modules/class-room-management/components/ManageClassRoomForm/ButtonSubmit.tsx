import React, { useMemo } from "react";
import { Button, ButtonProps } from "@mui/material";

import { ClassRoom } from "./classroom-form.schema";
import { useClassRoomFormContext } from "./ClassRoomFormContainer";
interface ButtonSubmitProps extends ButtonProps {
  initialValue?: ClassRoom;
  isLoading?: boolean;
}
const ButtonSubmit: React.FC<ButtonSubmitProps> = ({ isLoading, initialValue, children, ...buttonProps }) => {
  const { getValues, watch } = useClassRoomFormContext();
  const fieldsCheck: (keyof ClassRoom)[] = ["title", "description", "thumbnailUrl", "categories", "classRoomSessions"];
  const isDisabledButton = useMemo(() => {
    return fieldsCheck.some((field) => !getValues(field));
  }, [initialValue, watch(fieldsCheck)]);
  return (
    <Button {...buttonProps} disabled={isLoading || isDisabledButton} loading={isLoading}>
      {children}
    </Button>
  );
};
export default ButtonSubmit;
