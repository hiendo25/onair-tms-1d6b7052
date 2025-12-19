import { Button, FormLabel, Typography } from "@mui/material";
import { Control, useController } from "react-hook-form";

import { ClassRoom } from "../../../classroom-form.schema";

import AssessmentSelector, { AssessmentSelectorProps } from "./AssessmentSelector";

export interface AssessmentFieldProps {
  sessionIndex: number;
  control: Control<ClassRoom>;
}
const AssessmentField: React.FC<AssessmentFieldProps> = ({ sessionIndex, control }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.assessmentId`,
  });
  const handleSelect: AssessmentSelectorProps["onSelect"] = (item) => {
    onChange(item.id);
  };
  return (
    <div>
      <FormLabel component="div">Bài kiểm tra lớp học</FormLabel>
      <AssessmentSelector value={value} onSelect={handleSelect} />
      {error?.message}
    </div>
  );
};
export default AssessmentField;
