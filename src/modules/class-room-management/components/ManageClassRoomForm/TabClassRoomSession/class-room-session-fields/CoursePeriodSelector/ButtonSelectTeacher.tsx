import { useRef } from "react";
import { Button, IconButton, Typography } from "@mui/material";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import SimpleDialogTeacherSelector, {
  SimpleDialogTeacherSelectorProps,
  SimpleDialogTeacherSelectorRef,
} from "@/modules/teacher/container/SimpleDialogTeacherSelector";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";
import { Edit05Icon } from "@/shared/assets/icons";
import { cn } from "@/utils";

interface ButtonSelectTeacherProps {
  className?: string;
  sessionIndex: number;
  coursePeriodIndex: number;
}
const ButtonSelectTeacher: React.FC<ButtonSelectTeacherProps> = ({ className, sessionIndex, coursePeriodIndex }) => {
  const dialogTeacherRef = useRef<SimpleDialogTeacherSelectorRef>(null);
  const { getValues, setValue } = useClassRoomFormContext();
  const currentTeacherValue = getValues(`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}.teacher`);

  const handleConfirmSelectTeacher: SimpleDialogTeacherSelectorProps["onOk"] = (data) => {
    const teacher = data[0];
    if (!teacher || teacher.employee_type !== "teacher") return;

    const currentValue = getValues(`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}`);
    setValue(`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}`, {
      ...currentValue,
      teacher: {
        departmentName: teacher.employments[0]?.organization_units.name || "",
        id: teacher.id,
        name: teacher.profiles.full_name,
      },
    });
  };
  const isSelected = Boolean(currentTeacherValue.id);
  return (
    <div className={cn(className)}>
      {isSelected ? (
        <div className="flex gap-x-2">
          <IconButton
            size="small"
            onClick={dialogTeacherRef.current?.openDialog}
            className="px-0 py-1 bg-transparent outline-0 w-6 h-6"
          >
            <Edit05Icon className="w-4 h-4" />
          </IconButton>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{currentTeacherValue.name}</Typography>
        </div>
      ) : (
        <Button
          variant="text"
          size="small"
          onClick={dialogTeacherRef.current?.openDialog}
          startIcon={<PlusIcon className="w-4 h-4" />}
          className="px-0 py-1 bg-transparent outline-0"
        >
          Thêm
        </Button>
      )}
      <SimpleDialogTeacherSelector
        ref={dialogTeacherRef}
        onOk={handleConfirmSelectTeacher}
        disableMultipleSelect
        values={currentTeacherValue.id ? [currentTeacherValue.id] : []}
      />
    </div>
  );
};
export default ButtonSelectTeacher;
