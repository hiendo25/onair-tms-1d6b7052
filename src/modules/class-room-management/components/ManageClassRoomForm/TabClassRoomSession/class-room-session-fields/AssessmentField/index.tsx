import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { Button, FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import { Control, useController } from "react-hook-form";

import DialogAssignmentSelector, {
  DialogAssignmentSelectorRef,
} from "@/modules/assignment-management/container/DialogAssignmentSelector";
import { CloseIcon } from "@/shared/assets/icons";
import { ClassRoom } from "../../../classroom-form.schema";

export interface AssessmentFieldProps {
  sessionIndex: number;
  control: Control<ClassRoom>;
}
type AssignmentSelectItem = ClassRoom["classRoomSessions"][number]["assignments"][number];
const AssessmentField: React.FC<AssessmentFieldProps> = ({ sessionIndex, control }) => {
  const {
    field: { value: assignments, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.assignments`,
  });
  const assignmentDialogRef = useRef<DialogAssignmentSelectorRef>(null);
  const handleSelectAssignment = () => {
    assignmentDialogRef.current?.openDialog(
      { value: undefined },
      {
        onOk: (assignments) => {
          const assignmentValues = assignments.map<AssignmentSelectItem>((item) => ({
            assignmentId: item.id,
            name: item.name,
          }));
          onChange(assignmentValues);
        },
      },
    );
  };

  const handleRemove = (assignmentId: string) => () => {
    const updateAssignments = assignments.filter((item) => item.assignmentId !== assignmentId);
    onChange(updateAssignments);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <FormLabel component="div">Bài kiểm tra lớp học</FormLabel>
          <Typography className="text-xs text-gray-600">Chọn một hoặc nhiều bài kiểm tra.</Typography>
          {error?.message && <FormHelperText error>{error?.message}</FormHelperText>}
        </div>
        <Button variant="fill" onClick={handleSelectAssignment}>
          Thêm
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {assignments.map((item) => (
          <div key={item.assignmentId} className="flex items-center gap-3">
            <IconButton
              size="small"
              className="p-1!"
              sx={{ width: 24, height: 24 }}
              onClick={handleRemove(item.assignmentId)}
            >
              <CloseIcon className="w-4 h-4" />
            </IconButton>
            <Typography className="text-sm font-medium text-blue-700">{item.name}</Typography>
          </div>
        ))}
      </div>
      <DialogAssignmentSelector ref={assignmentDialogRef} />
    </div>
  );
};
export default AssessmentField;
