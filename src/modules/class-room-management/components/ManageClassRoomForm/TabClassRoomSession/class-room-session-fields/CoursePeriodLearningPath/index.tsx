import React, { useMemo, useRef } from "react";
import { Box, Button, FormHelperText, FormLabel, IconButton, styled, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import SimpleDialogCourseSelector, {
  SimpleDialogCourseSelectorProps,
  SimpleDialogCourseSelectorRef,
} from "@/modules/courses/container/SimpleDialogCourseSelector";
import SimpleDialogTeacherSelector, {
  SimpleDialogTeacherSelectorRef,
} from "@/modules/teacher/container/SimpleDialogTeacherSelector";
import { CloseIcon, Edit05Icon, Trash01Icon } from "@/shared/assets/icons";
import Avatar from "@/shared/ui/Avatar";
import EmptyData from "@/shared/ui/EmptyData";
import RHFDateTimePicker, { RHFDateTimePickerProps } from "@/shared/ui/form/RHFDateTimePicker";
import { ClassRoom } from "../../../classroom-form.schema";

import DurationTime from "./DurationTime";
import FromToDayTime from "./FromToDayTime";
const CoursePeriodsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  ".course-period-item + .course-period-item": {
    borderTop: "1px solid",
    borderColor: theme.palette.grey[300],
    paddingTop: "12px",
    marginTop: "12px",
  },
}));

interface ButtonSelectTeacherProps {
  onClick: () => void;
  teacherName?: string;
}

const ButtonSelectTeacher: React.FC<ButtonSelectTeacherProps> = ({ onClick }) => {
  return (
    <Button disableRipple variant="fill" size="small" color="primary" onClick={onClick}>
      Chọn
    </Button>
  );
};

interface CoursePeriodLearningPathProps {
  sessionIndex: number;
  methods: UseFormReturn<ClassRoom>;
}
type CoursePeriodItem = ClassRoom["classRoomSessions"][number]["coursesPeriod"][number];
type TeacherSelectItem = CoursePeriodItem["teachers"][number];

const CoursePeriodLearningPath: React.FC<CoursePeriodLearningPathProps> = ({ sessionIndex, methods }) => {
  const dialogCourseRef = useRef<SimpleDialogCourseSelectorRef>(null);

  const {
    control,
    trigger,
    formState: { errors },
  } = methods;

  const sessions = useWatch({ control, name: "classRoomSessions" });

  const dialogTeacherRef = useRef<SimpleDialogTeacherSelectorRef>(null);
  const {
    fields: coursesFields,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod`,
    keyName: "_coursePeriod",
  });

  const errorMessage = useMemo(() => {
    return errors.classRoomSessions?.[sessionIndex]?.coursesPeriod?.message;
  }, [errors, sessionIndex]);

  /**
   * Check valid field before add course
   */
  const handleOpenDialogCourses = async () => {
    if (coursesFields.length) {
      const isValid = await trigger(`classRoomSessions.${sessionIndex}.coursesPeriod`);
      if (!isValid) return;
    }
    dialogCourseRef.current?.openDialog?.();
  };

  const handleConfirmSelectCourse: SimpleDialogCourseSelectorProps["onOk"] = (courseList) => {
    const defaultItem = sessions[sessionIndex]?.weeklySchedule;
    const courseListAppend = courseList.map<CoursePeriodItem>((item) => ({
      startAt: "",
      endAt: "",
      course: { id: item.id, title: item.title || "" },
      teachers: [],
      weeklySchedule: {
        from: {
          time: defaultItem?.from?.time,
          day: defaultItem?.from?.day,
        },
        to: {
          time: defaultItem?.to?.time,
          day: defaultItem?.to?.day,
        },
        isDuration: false,
        duration: {
          hours: 0,
          minutes: 0,
        },
      },
    }));
    append(courseListAppend);
  };

  const handleOpenDialogTeacher = (index: number, teachers: TeacherSelectItem[]) => {
    const currentCourse = coursesFields[index];
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

          update(index, {
            ...currentCourse,
            teachers: teacherValues,
          });
        },
      },
    );
  };

  /**
   * Get all Course ids selected from all class session
   */
  const courseList = useMemo(() => {
    const courseSelectedIds = sessions.reduce<string[]>((acc, session) => {
      return [...acc, ...session.coursesPeriod.map((course) => course.course.id)];
    }, []);
    return courseSelectedIds;
  }, [sessions]);

  return (
    <div className="course-period-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <FormLabel component="div">
            Môn học <span className="text-red-600">*</span>
          </FormLabel>
          <Typography className="text-xs text-gray-600">
            Chọn môn học và chỉ định giảng viên kèm thời gian giảng dạy.
          </Typography>
          {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="fill" onClick={handleOpenDialogCourses}>
            Thêm
          </Button>
        </div>
      </div>

      {coursesFields.length ? (
        <div className="course-period-list">
          <CoursePeriodsWrapper>
            {coursesFields.map(({ _coursePeriod, course }, _indexField) => (
              <React.Fragment key={_coursePeriod}>
                <div className="p-6 rounded-xl bg-gray-100">
                  <div className="course-item-header flex items-center justify-between mb-3">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-600 rounded-lg inline-block"></span>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{course.title}</Typography>
                    </div>
                    <IconButton
                      size="small"
                      className="rounded-lg bg-white border border-gray-300 w-8 h-8"
                      onClick={() => remove(_indexField)}
                    >
                      <Trash01Icon className="w-4 h-4" />
                    </IconButton>
                  </div>
                  <div className="bg-white p-4 rounded-xl teacher">
                    <Controller
                      name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.teachers`}
                      control={control}
                      render={({ field: { onChange, value: teachers }, fieldState: { error } }) => (
                        <>
                          <div className="flex justify-between">
                            <div>
                              <FormLabel component="div">
                                Giảng viên phụ trách <span className="text-red-600">*</span>
                              </FormLabel>
                              <Typography className="text-sm text-gray-600">
                                Chỉ định giảng viên phụ trách nội dung, quản lý lớp học và hỗ trợ người học trong buổi
                                học.
                              </Typography>
                            </div>
                            <ButtonSelectTeacher onClick={() => handleOpenDialogTeacher(_indexField, teachers)} />
                          </div>
                          {teachers.length ? (
                            <div className="flex flex-col gap-2">
                              {teachers.map((teacher) => (
                                <div key={teacher.teacherId} className="flex items-center gap-2 group/teacher">
                                  <Avatar alt={teacher.teacherName} className="w-7 h-7" />
                                  <div className="text-sm">{teacher.teacherName}</div>{" "}
                                  <IconButton
                                    className="w-4 h-4 opacity-0 group-hover/teacher:opacity-100 bg-gray-100"
                                    onClick={() => {
                                      const updateTeachers = teachers.filter(
                                        (tc) => tc.teacherId !== teacher.teacherId,
                                      );
                                      onChange(updateTeachers);
                                    }}
                                  >
                                    <CloseIcon className="text-xs" />
                                  </IconButton>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {error?.message ? (
                            <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText>
                          ) : null}
                        </>
                      )}
                    />
                  </div>
                  <div className="h-4"></div>
                  <Controller
                    control={control}
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.weeklySchedule`}
                    render={({ field: { value, onChange }, fieldState: { error } }) => (
                      <div className="bg-white p-4 rounded-xl time">
                        <div>
                          <FormLabel component="div">
                            Thời gian diễn ra <span className="text-red-600">*</span>
                          </FormLabel>
                          <div>
                            <FromToDayTime value={value} onChange={onChange} />
                            <div className="h-6"></div>
                            <DurationTime
                              control={control}
                              sessionIndex={sessionIndex}
                              coursePeriodIndex={_indexField}
                            />
                          </div>
                          {/* {JSON.stringify(error)}
                          {error?.message?.from?.message} */}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </React.Fragment>
            ))}
          </CoursePeriodsWrapper>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <EmptyData description="Môn học đang trống." iconSize="small" className="mx-auto" />
        </div>
      )}
      <SimpleDialogCourseSelector value={courseList} ref={dialogCourseRef} onOk={handleConfirmSelectCourse} />
      <SimpleDialogTeacherSelector ref={dialogTeacherRef} excludeSelected={false} />
    </div>
  );
};
export default CoursePeriodLearningPath;
