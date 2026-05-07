"use client";
import { forwardRef, memo } from "react";

import { UpsertCourseProvider } from "../../store/upsert-course-context";

import UpsertCourseFormContainer, {
  UpsertCourseFormContainerProps,
  UpsertCourseFormContainerRef,
} from "./UpsertCourseFormContainer";

export type ManageCourseFormRef = UpsertCourseFormContainerRef;
export interface ManageCourseFormProps {
  action?: "create" | "edit";
  isLoading?: boolean;
  onSubmit?: UpsertCourseFormContainerProps["onSubmit"];
  onCancel?: UpsertCourseFormContainerProps["onCancel"];
  initFormValue?: UpsertCourseFormContainerProps["value"];
}
const ManageCourseForm = forwardRef<ManageCourseFormRef, ManageCourseFormProps>(
  ({ onSubmit, initFormValue, action = "create", isLoading = false, onCancel }, ref) => {
    return (
      <UpsertCourseProvider selectedStudents={[]} selectedTeachers={[]}>
        <UpsertCourseFormContainer
          ref={ref}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          action={action}
          value={initFormValue}
        />
      </UpsertCourseProvider>
    );
  },
);
export default memo(ManageCourseForm);
