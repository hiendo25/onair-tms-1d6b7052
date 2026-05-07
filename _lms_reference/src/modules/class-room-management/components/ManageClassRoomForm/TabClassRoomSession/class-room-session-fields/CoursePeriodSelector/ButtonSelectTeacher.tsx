import React, { memo, useRef } from "react";
import { Button, FormHelperText, IconButton } from "@mui/material";
import { Control, Controller } from "react-hook-form";

import SimpleDialogTeacherSelector, {
  SimpleDialogTeacherSelectorRef,
} from "@/modules/teacher/container/SimpleDialogTeacherSelector";
import { CloseIcon } from "@/shared/assets/icons";
import Avatar from "@/shared/ui/Avatar";
import { ClassRoomFormValues } from "../../../classroom-form.schema";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";

type TeacherSelectItem = ClassRoomFormValues["classRoomSessions"][number]["coursesPeriod"][number]["teachers"][number];
interface ButtonSelectTeacherProps {
  sessionIndex: number;
  coursePeriodIndex: number;
  control: Control<ClassRoomFormValues>;
}
const ButtonSelectTeacher: React.FC<ButtonSelectTeacherProps> = ({ coursePeriodIndex, control, sessionIndex }) => {
  const dialogTeacherRef = useRef<SimpleDialogTeacherSelectorRef>(null);

  const { getValues, setValue } = useClassRoomFormContext();

  const handleOpenDialogTeacher = (index: number, teachers: TeacherSelectItem[]) => {
    const currentCourse = getValues(`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}`);
    if (!currentCourse) return;
    const initTeacherValues = teachers.map((tc) => tc.teacherId);
    dialogTeacherRef.current?.openDialog(
      { value: initTeacherValues },
      {
        onOk: (data) => {
          const teacherValues = data.map<TeacherSelectItem>((tc) => ({
            teacherId: tc.id,
            teacherName: tc.profiles.full_name,
            teacherDepartment: tc.employee_departments[0]?.departments?.name || "",
          }));

          setValue(`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}`, {
            ...currentCourse,
            teachers: teacherValues,
          });
        },
      },
    );
  };
  return (
    <>
      <Controller
        name={`classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}.teachers`}
        control={control}
        render={({ field: { onChange, value: teachers }, fieldState: { error } }) => (
          <>
            {teachers.length ? (
              <div className="flex flex-col gap-2">
                {teachers.map((teacher) => (
                  <div key={teacher.teacherId} className="flex items-center gap-2 group/teacher">
                    <Avatar alt={teacher.teacherName} className="w-7 h-7" />
                    <div className="text-sm">{teacher.teacherName}</div>{" "}
                    <IconButton
                      className="w-4 h-4 opacity-0 group-hover/teacher:opacity-100 bg-gray-100"
                      onClick={() => {
                        const updateTeachers = teachers.filter((tc) => tc.teacherId !== teacher.teacherId);
                        onChange(updateTeachers);
                      }}
                    >
                      <CloseIcon className="text-xs" />
                    </IconButton>
                  </div>
                ))}
              </div>
            ) : null}
            <Button
              disableRipple
              variant="text"
              size="small"
              color="primary"
              className="px-0 py-1 bg-transparent outline-0"
              onClick={() => handleOpenDialogTeacher(coursePeriodIndex, teachers)}
            >
              Thêm
            </Button>
            {error?.message ? <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText> : null}
          </>
        )}
      />
      <SimpleDialogTeacherSelector ref={dialogTeacherRef} excludeSelected={false} />
    </>
  );
};
export default memo(ButtonSelectTeacher);
