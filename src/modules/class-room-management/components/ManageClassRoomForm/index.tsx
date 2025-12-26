"use client";

import { forwardRef, memo } from "react";

import { ClassRoomProvider } from "../../store/class-room-context";
import { ClassRoomStore } from "../../store/class-room-store";

import ClassRoomFormContainer, {
  ClassRoomFormContainerProps,
  ClassRoomFormContainerRef,
} from "./ClassRoomFormContainer";

export type ManageClassRoomFormRef = ClassRoomFormContainerRef;
export interface ManageClassRoomFormProps {
  onSubmit?: ClassRoomFormContainerProps["onSubmit"];
  onCancel?: ClassRoomFormContainerProps["onCancel"];
  platform: ClassRoomFormContainerProps["platform"];
  roomType?: ClassRoomFormContainerProps["roomType"];
  isLoading?: boolean;
  action?: "create" | "edit";
  initFormValue?: ClassRoomFormContainerProps["value"];
  students?: ClassRoomStore["state"]["selectedStudents"]; // init students
  teachers?: ClassRoomStore["state"]["selectedTeachers"]; // init teachers
  isLearningPath?: boolean;
}
const ManageClassRoomForm = forwardRef<ManageClassRoomFormRef, ManageClassRoomFormProps>(
  (
    {
      onSubmit,
      initFormValue,
      action = "create",
      isLoading = false,
      teachers,
      students,
      platform,
      roomType,
      onCancel,
      isLearningPath = false,
    },
    ref,
  ) => {
    return (
      <ClassRoomProvider selectedStudents={students} selectedTeachers={teachers}>
        <ClassRoomFormContainer
          ref={ref}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          action={action}
          value={initFormValue}
          platform={platform}
          roomType={roomType}
          isLearningPath={isLearningPath}
        />
      </ClassRoomProvider>
    );
  },
);
export default memo(ManageClassRoomForm);
