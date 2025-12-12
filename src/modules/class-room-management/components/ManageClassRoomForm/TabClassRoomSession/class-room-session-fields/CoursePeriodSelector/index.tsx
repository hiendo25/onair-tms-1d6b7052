import { useMemo, useRef } from "react";
import dayjs from "dayjs";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { Box, Button, FormHelperText, FormLabel, IconButton, Typography, styled } from "@mui/material";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { CloseIcon, Edit05Icon } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";

import SimpleDialogCourseSelector, {
  SimpleDialogCourseSelectorProps,
  SimpleDialogCourseSelectorRef,
} from "@/modules/courses/container/SimpleDialogCourseSelector";
import { DateTimePickerProps } from "@mui/x-date-pickers";
import SimpleDialogTeacherSelector, {
  SimpleDialogTeacherSelectorRef,
} from "@/modules/teacher/container/SimpleDialogTeacherSelector";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { ClassRoom } from "../../../classroom-form.schema";

const CoursePeriodsWraper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
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

const ButtonSelectTeacher: React.FC<ButtonSelectTeacherProps> = ({ onClick, teacherName }) => {
  return (
    <Button
      disableRipple
      variant="text"
      size="small"
      color={teacherName ? "inherit" : "primary"}
      className="px-0 py-1 bg-transparent outline-0"
      startIcon={teacherName ? <Edit05Icon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
      onClick={onClick}
    >
      {teacherName ? teacherName : "Thêm"}
    </Button>
  );
};
interface CoursePeriodSelectorProps {
  sessionIndex: number;
  methods: UseFormReturn<ClassRoom>;
}
const CoursePeriodSelector: React.FC<CoursePeriodSelectorProps> = ({ sessionIndex, methods }) => {
  const dialogCourseRef = useRef<SimpleDialogCourseSelectorRef>(null);
  const {
    control,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = methods;

  const classSessionStartDate = watch(`classRoomSessions.${sessionIndex}.startDate`);
  const classSessionEndDate = watch(`classRoomSessions.${sessionIndex}.endDate`);
  const dialogTeacherRef = useRef<SimpleDialogTeacherSelectorRef>(null);
  const {
    fields: coursesFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod`,
    keyName: "_coursePeriod",
  });

  const errorMessage = errors.classRoomSessions?.[sessionIndex]?.coursesPeriod?.message;

  const dateTimePickerSx: DateTimePickerProps["sx"] = useMemo(
    () => ({
      ".MuiPickersInputBase-root": {
        paddingLeft: 1.5,
        paddingRight: 1.5,
        borderRadius: "6px",
      },
      ".MuiPickersSectionList-root": {
        paddingTop: "4px",
        paddingBottom: "4px",
        fontSize: "0.75rem",
      },
      svg: {
        fontSize: "1rem",
      },
    }),
    [],
  );

  /**
   * Check valid field before add course
   */
  const checkValidCourseBeforeOpenDialog = (open?: () => void) => async () => {
    if (coursesFields.length) {
      const isValid = await trigger(`classRoomSessions.${sessionIndex}.coursesPeriod`);
      if (!isValid) return;
    }
    open?.();
  };

  const handleConfirmSelectCourse: SimpleDialogCourseSelectorProps["onOk"] = (data) => {
    const courseItem = data[0];
    if (!courseItem) return;
    append({
      startAt: "",
      endAt: "",
      course: { id: courseItem.id, title: courseItem.title || "" },
      teacher: undefined,
    });
  };

  /**
   * Get all Course ids selected from all class session
   */
  const courseList = useMemo(() => {
    const sessions = getValues("classRoomSessions");
    const courseSelectedIds = sessions.reduce<string[]>((acc, session) => {
      return [...acc, ...session.coursesPeriod.map((course) => course.course.id)];
    }, []);
    return courseSelectedIds;
  }, [watch(`classRoomSessions`)]);

  return (
    <div className="course-period-container">
      <div className="flex items-center justify-between">
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
          <Button variant="fill" onClick={checkValidCourseBeforeOpenDialog(dialogCourseRef.current?.openDialog)}>
            Thêm
          </Button>
        </div>
      </div>

      {coursesFields.length ? (
        <div className="course-period-list">
          <div className="h-6"></div>
          <div className="flex mb-4 gap-4">
            <div className="w-6"></div>
            <div className="w-80">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Tên môn học</Typography>
            </div>
            <div className="w-1/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Giảng viên</Typography>
            </div>
            <div className="w-2/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Thời gian học</Typography>
            </div>
          </div>
          <CoursePeriodsWraper>
            {coursesFields.map((cField, _indexField) => (
              <div key={cField._coursePeriod} className="course-period-item flex gap-4">
                <IconButton size="small" onClick={() => remove(_indexField)} className="w-6 h-6">
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
                <div className="w-80">
                  <Typography sx={{ fontSize: "0.875rem" }}>{cField.course.title}</Typography>
                </div>
                <div className="w-1/5">
                  <Controller
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.teacher`}
                    control={control}
                    render={({ field: { onChange, value: teacherInfo }, fieldState: { error } }) => (
                      <>
                        <ButtonSelectTeacher
                          teacherName={teacherInfo?.name}
                          onClick={() =>
                            dialogTeacherRef.current?.openDialog(undefined, {
                              onOk: (teachers) => {
                                const teacher = teachers[0];
                                onChange({
                                  id: teacher?.id,
                                  name: teacher?.profiles.full_name,
                                  departmentName: teacher?.employments[0]?.organization_units.name || "",
                                });
                              },
                            })
                          }
                        />
                        <SimpleDialogTeacherSelector
                          ref={dialogTeacherRef}
                          disableMultipleSelect
                          values={teacherInfo ? [teacherInfo.id] : []}
                        />
                        {error?.message ? (
                          <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText>
                        ) : null}
                      </>
                    )}
                  />
                </div>
                <div className="w-2/5 flex gap-x-2 max-w-[360px]">
                  <RHFDateTimePicker
                    control={control}
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.startAt`}
                    minDateTime={classSessionStartDate ? dayjs(classSessionStartDate) : dayjs()}
                    maxDateTime={classSessionEndDate ? dayjs(classSessionEndDate) : undefined}
                    sx={dateTimePickerSx}
                  />
                  <RHFDateTimePicker
                    control={control}
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.endAt`}
                    minDateTime={classSessionStartDate ? dayjs(classSessionStartDate) : dayjs()}
                    maxDateTime={classSessionEndDate ? dayjs(classSessionEndDate) : undefined}
                    sx={dateTimePickerSx}
                  />
                </div>
              </div>
            ))}
          </CoursePeriodsWraper>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <EmptyData description="Môn học đang trống." iconSize="small" className="mx-auto" />
        </div>
      )}
      <SimpleDialogCourseSelector
        value={courseList}
        ref={dialogCourseRef}
        onOk={handleConfirmSelectCourse}
        disableMultipleSelect
      />
    </div>
  );
};
export default CoursePeriodSelector;
