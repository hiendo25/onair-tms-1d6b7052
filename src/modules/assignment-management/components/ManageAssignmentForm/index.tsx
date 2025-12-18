"use client";
import { forwardRef, memo } from "react";

import AssignmentFormContainer, {
  AssignmentFormContainerProps,
  AssignmentFormContainerRef,
} from "./AssignmentFormContainer";

export interface ManageAssignmentFormRef extends AssignmentFormContainerRef {}
export interface ManageAssignmentFormProps {
  onSubmit?: AssignmentFormContainerProps["onSubmit"];
  isLoading?: boolean;
  action?: "create" | "edit";
  value?: AssignmentFormContainerProps["value"];
}

const ManageAssignmentForm = forwardRef<ManageAssignmentFormRef, ManageAssignmentFormProps>(
  ({ onSubmit, value, action = "create", isLoading = false }, ref) => {
    return (
      <AssignmentFormContainer onSubmit={onSubmit} ref={ref} isLoading={isLoading} action={action} value={value} />
    );
  },
);

ManageAssignmentForm.displayName = "ManageAssignmentForm";

export default memo(ManageAssignmentForm);
