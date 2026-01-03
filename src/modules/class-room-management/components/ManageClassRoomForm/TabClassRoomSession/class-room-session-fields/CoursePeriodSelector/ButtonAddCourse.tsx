import React, { memo, useMemo, useRef } from "react";
import { Button } from "@mui/material";
import { Control, useWatch } from "react-hook-form";

import SimpleDialogCourseSelector, {
  SimpleDialogCourseSelectorProps,
  SimpleDialogCourseSelectorRef,
} from "@/modules/courses/container/SimpleDialogCourseSelector";
import { ClassRoom } from "../../../classroom-form.schema";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";

interface ButtonAddCourseProps {
  control: Control<ClassRoom>;
  sessionIndex: number;
}
const ButtonAddCourse: React.FC<ButtonAddCourseProps> = ({ control, sessionIndex }) => {
  const { trigger, setValue } = useClassRoomFormContext();

  const dialogCourseRef = useRef<SimpleDialogCourseSelectorRef>(null);

  const sessions = useWatch({ control, name: "classRoomSessions" });
  const currentCoursesPeriod = useWatch({ control, name: `classRoomSessions.${sessionIndex}.coursesPeriod` });

  const courseList = useMemo(() => {
    const courseSelectedIds = sessions.reduce<string[]>((acc, session) => {
      return [...acc, ...session.coursesPeriod.map((course) => course.course.id)];
    }, []);
    return courseSelectedIds;
  }, [sessions]);

  const handleOpenDialogCourses = async () => {
    if (currentCoursesPeriod.length) {
      const isValid = await trigger(`classRoomSessions.${sessionIndex}.coursesPeriod`);
      if (!isValid) return;
    }
    dialogCourseRef.current?.openDialog?.();
  };

  console.log("render button select course");
  const handleConfirmSelectCourse: SimpleDialogCourseSelectorProps["onOk"] = (courseList) => {
    const courseListAppend = courseList.map<ClassRoom["classRoomSessions"][number]["coursesPeriod"][number]>(
      (item) => ({
        startAt: "",
        endAt: "",
        course: { id: item.id, title: item.title || "" },
        teachers: [],
      }),
    );

    setValue(`classRoomSessions.${sessionIndex}.coursesPeriod`, [...currentCoursesPeriod, ...courseListAppend]);
  };

  return (
    <>
      <Button variant="fill" onClick={handleOpenDialogCourses}>
        Thêm
      </Button>
      <SimpleDialogCourseSelector value={courseList} ref={dialogCourseRef} onOk={handleConfirmSelectCourse} />
    </>
  );
};
export default memo(ButtonAddCourse);
