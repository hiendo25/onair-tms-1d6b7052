import React, { useState } from "react";
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
const AssessmentField: React.FC<AssessmentFieldProps> = ({ sessionIndex, control }) => {
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string }[]>([]);
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.assignments`,
  });
  const assignmentDialogRef = useRef<DialogAssignmentSelectorRef>(null);
  const handleSelect = () => {
    assignmentDialogRef.current?.openDialog(
      { value: undefined },
      {
        onOk: (assignments) => {
          const assignmentValues = assignments.map((item) => ({
            id: item.id,
            name: item.name,
          }));
          setSelectedItem(assignmentValues);
          onChange(assignmentValues);
        },
      },
    );
  };

  const handleRemove = (assignmentId: string) => () => {
    setSelectedItem((prevItems) => prevItems.filter((item) => item.id !== assignmentId));
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <FormLabel component="div">Bài kiểm tra lớp học</FormLabel>
          <Typography className="text-xs text-gray-600">Chọn một hoặc nhiều bài kiểm tra.</Typography>
          {error?.message && <FormHelperText error>{error?.message}</FormHelperText>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="fill" onClick={handleSelect}>
            Thêm
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {selectedItem.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div>
              <IconButton size="small" className="p-1!" sx={{ width: 24, height: 24 }} onClick={handleRemove(item.id)}>
                <CloseIcon className="w-4 h-4" />
              </IconButton>
            </div>
            <div>{item.name}</div>
          </div>
        ))}
      </div>
      <DialogAssignmentSelector ref={assignmentDialogRef} />
    </div>
  );
};
export default AssessmentField;
