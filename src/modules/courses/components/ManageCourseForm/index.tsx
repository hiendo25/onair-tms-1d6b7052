"use client";
import { forwardRef, memo } from "react";
import { UpsertCourseProvider } from "../../store/upsert-course-context";
import { UpsertCourseStore } from "../../store/upsert-course-store";
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
  students?: UpsertCourseStore["state"]["selectedStudents"]; // init students
  teachers?: UpsertCourseStore["state"]["selectedTeachers"]; // init teachers
}
const ManageCourseForm = forwardRef<ManageCourseFormRef, ManageCourseFormProps>(
  ({ onSubmit, initFormValue, action = "create", isLoading = false, teachers, students, onCancel }, ref) => {
    return (
      <UpsertCourseProvider selectedStudents={students} selectedTeachers={teachers}>
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
