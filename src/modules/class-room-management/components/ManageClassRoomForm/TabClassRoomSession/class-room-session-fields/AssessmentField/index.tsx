import React, { memo, useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { Button, FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";

import DialogAssignmentSelector, {
  DialogAssignmentSelectorRef,
} from "@/modules/assignment-management/container/DialogAssignmentSelector";
import { CloseIcon } from "@/shared/assets/icons";
import { ClassRoomFormValues } from "../../../classroom-form.schema";

export interface AssessmentFieldProps {
  sessionIndex: number;
  control: Control<ClassRoomFormValues>;
}
type AssignmentSelectItem = ClassRoomFormValues["classRoomSessions"][number]["assignments"][number];
const AssessmentField: React.FC<AssessmentFieldProps> = ({ sessionIndex, control }) => {
  const assignmentDialogRef = useRef<DialogAssignmentSelectorRef>(null);

  return (
    <Controller
      name={`classRoomSessions.${sessionIndex}.assignments`}
      control={control}
      render={({ field: { value: assignments, onChange }, fieldState: { error } }) => (
        <div>
          <div className="flex items-center justify-between mb-3">
            <AssignmentHead title="Bài kiểm tra lớp học" description="Chọn một hoặc nhiều bài kiểm tra." />
            {error?.message && <FormHelperText error>{error?.message}</FormHelperText>}
            <Button
              variant="fill"
              onClick={() =>
                assignmentDialogRef.current?.openDialog(
                  { value: assignments.map((item) => item.assignmentBankId) },
                  {
                    onOk: (assignments) => {
                      const assignmentValues = assignments.map<AssignmentSelectItem>((item) => ({
                        assignmentBankId: item.id,
                        name: item.name,
                      }));
                      onChange(assignmentValues);
                    },
                  },
                )
              }
            >
              Thêm
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {assignments.map(({ assignmentBankId, name }) => (
              <div key={assignmentBankId} className="flex items-center gap-3">
                <IconButton
                  size="small"
                  className="p-1!"
                  sx={{ width: 24, height: 24 }}
                  onClick={() => {
                    const updateAssignments = assignments.filter((item) => item.assignmentBankId !== assignmentBankId);
                    onChange(updateAssignments);
                  }}
                >
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
                <Typography className="text-sm font-medium text-blue-700">{name}</Typography>
              </div>
            ))}
          </div>
          <DialogAssignmentSelector ref={assignmentDialogRef} />
        </div>
      )}
    />
  );
};
export default AssessmentField;

interface AssignmentHeadProps {
  title: string;
  description: string;
}
const AssignmentHead: React.FC<AssignmentHeadProps> = memo(({ title, description }) => {
  return (
    <div className="flex-1">
      <FormLabel component="div">{title}</FormLabel>
      <Typography className="text-xs text-gray-600">{description}</Typography>
    </div>
  );
});
