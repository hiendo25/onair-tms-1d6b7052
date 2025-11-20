import { Controller, useFieldArray } from "react-hook-form";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { Button, FormHelperText, FormLabel, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { CloseIcon, TrashIcon1 } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";
import ButtonSelectTeacher from "./ButtonSelectTeacher";

import { useMemo, useRef } from "react";
import SimpleDialogCourseSelector, {
  SimpleDialogCourseSelectorRef,
  SimpleDialogCourseSelectorProps,
} from "@/modules/courses/container/SimpleDialogCourseSelector";
import { DateTimePickerProps } from "@mui/x-date-pickers";
interface CoursePeriodSelectorProps {
  sessionIndex: number;
}
const CoursePeriodSelector: React.FC<CoursePeriodSelectorProps> = ({ sessionIndex }) => {
  const dialogCourseRef = useRef<SimpleDialogCourseSelectorRef>(null);
  const { control, getValues, watch, trigger, setError, clearErrors } = useClassRoomFormContext();

  const classSessionStartDate = watch(`classRoomSessions.${sessionIndex}.startDate`);
  const classSessionEndDate = watch(`classRoomSessions.${sessionIndex}.endDate`);

  console.log(classSessionStartDate, classSessionEndDate);
  const {
    fields: coursesFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod`,
    keyName: "_coursePeriod",
  });

  const dateTimePickerSx: DateTimePickerProps["sx"] = useMemo(
    () => ({
      ".MuiPickersInputBase-root": {
        paddingLeft: 1.5,
        paddingRight: 1.5,
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
  const handleOpenCourseSelector = () => {
    const coursePeriods = getValues(`classRoomSessions.${sessionIndex}.coursesPeriod`);

    let isvalid = true;
    coursePeriods.forEach((course, indexCourse) => {
      if (!course?.startAt) {
        isvalid = false;
        setError(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.startAt`, {
          message: "Không bỏ trống.",
        });
      } else {
        clearErrors(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.startAt`);
      }

      if (!course?.endAt) {
        isvalid = false;
        setError(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.endAt`, {
          message: "Không bỏ trống.",
        });
      } else {
        clearErrors(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.endAt`);
      }

      if (!course.teacher.id) {
        isvalid = false;
        setError(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.teacher`, {
          message: "Chưa chọn giảng viên",
        });
      } else {
        clearErrors(`classRoomSessions.${sessionIndex}.coursesPeriod.${indexCourse}.teacher`);
      }
    });
    if (!isvalid) return;

    dialogCourseRef.current?.openDialog();
  };

  const handleConfirmSelectCourse: SimpleDialogCourseSelectorProps["onOk"] = (data) => {
    const courseItem = data[0];
    if (!courseItem) return;
    append({
      startAt: "",
      endAt: "",
      course: { id: courseItem.id, title: courseItem.title || "" },
      teacher: { id: "", name: "", departmentName: "" },
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
  }, [watch(`classRoomSessions.${sessionIndex}.coursesPeriod`)]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <FormLabel component="div">
            Môn học <span className="text-red-600">*</span>
          </FormLabel>
          <Typography className="text-xs text-gray-600">
            Chọn môn học và chỉ định giảng viên kèm thời gian giảng dạy.
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="fill" onClick={handleOpenCourseSelector}>
            Thêm
          </Button>
        </div>
      </div>

      {coursesFields.length ? (
        <div className="course-period-list">
          <div className="h-6"></div>
          <div className="flex mb-4 gap-1">
            <div className="w-6"></div>
            <div className="w-8"></div>
            <div className="w-60">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Tên môn học</Typography>
            </div>
            <div className="w-1/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Giảng viên</Typography>
            </div>
            <div className="w-2/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Thời gian học</Typography>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {coursesFields.map((cField, _indexField) => (
              <div key={cField._coursePeriod} className="flex gap-1">
                <IconButton size="small" onClick={() => remove(_indexField)} className="w-6 h-6">
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
                <div className="w-8">
                  <Typography sx={{ fontSize: "0.875rem" }} className="text-center">
                    {_indexField + 1}
                  </Typography>
                </div>
                <div className="w-60">
                  <Typography sx={{ fontSize: "0.875rem" }}>{cField.course.title}</Typography>
                </div>
                <div className="w-1/5">
                  <Controller
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.teacher`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <ButtonSelectTeacher sessionIndex={sessionIndex} coursePeriodIndex={_indexField} />
                        {error?.message ? (
                          <FormHelperText error={!!error?.message}>{error?.message}</FormHelperText>
                        ) : null}
                      </>
                    )}
                  />
                </div>
                <div className="w-2/5 flex gap-x-2 max-w-[480px]">
                  <RHFDateTimePicker
                    control={control}
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.startAt`}
                    minDateTime={classSessionStartDate ? dayjs(classSessionStartDate) : dayjs()}
                    sx={dateTimePickerSx}
                  />
                  <RHFDateTimePicker
                    control={control}
                    name={`classRoomSessions.${sessionIndex}.coursesPeriod.${_indexField}.endAt`}
                    minDateTime={classSessionStartDate ? dayjs(classSessionStartDate) : dayjs()}
                    sx={dateTimePickerSx}
                  />
                </div>
              </div>
            ))}
          </div>
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
