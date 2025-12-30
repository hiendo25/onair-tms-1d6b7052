import React, { memo, useMemo, useRef } from "react";
import { Button } from "@mui/material";
import { useWatch } from "react-hook-form";

import SimpleDialogCourseSelector, {
  SimpleDialogCourseSelectorProps,
  SimpleDialogCourseSelectorRef,
} from "@/modules/courses/container/SimpleDialogCourseSelector";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";

export interface ButtonAddCoursePeriodProps {
  onOk: SimpleDialogCourseSelectorProps["onOk"];
  sessionIndex: number;
  buttonText?: string;
}
const ButtonAddCoursePeriod: React.FC<ButtonAddCoursePeriodProps> = ({ sessionIndex, onOk, buttonText }) => {
  const dialogCourseRef = useRef<SimpleDialogCourseSelectorRef>(null);
  const { trigger, control } = useClassRoomFormContext();

  const sessions = useWatch({ control, name: "classRoomSessions" });
  const coursesPeriod = useWatch({ control, name: `classRoomSessions.${sessionIndex}.coursesPeriod` });

  const handleOpenDialogCourses = async () => {
    const isValid = await trigger(`classRoomSessions.${sessionIndex}.weeklySchedule`);
    if (!isValid) return;

    if (coursesPeriod.length) {
      const isValid = await trigger(`classRoomSessions.${sessionIndex}.coursesPeriod`);
      if (!isValid) return;
    }
    dialogCourseRef.current?.openDialog?.();
  };

  const allCoursesIdsSelected = useMemo(() => {
    return sessions.reduce<string[]>((acc, session) => {
      return [...acc, ...session.coursesPeriod.map((item) => item.course.id)];
    }, []);
  }, [sessions]);

  return (
    <>
      <Button variant="fill" onClick={handleOpenDialogCourses}>
        Thêm
      </Button>
      <SimpleDialogCourseSelector value={allCoursesIdsSelected} ref={dialogCourseRef} onOk={onOk} />
    </>
  );
};
export default memo(ButtonAddCoursePeriod);
