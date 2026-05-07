import React, { memo, useMemo } from "react";
import { Box, FormHelperText, FormLabel, IconButton, styled, Typography } from "@mui/material";
import { useFieldArray } from "react-hook-form";

import { CloseIcon } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";
import { useClassRoomFormContext } from "../../../ClassRoomFormContainer";

import ButtonAddCourse from "./ButtonAddCourse";
import ButtonSelectTeacher from "./ButtonSelectTeacher";
import FromToDateCourse from "./FromToDateCourse";

const CoursePeriodsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  ".course-period-item + .course-period-item": {
    borderTop: "1px solid",
    borderColor: theme.palette.grey[300],
    paddingTop: "12px",
    marginTop: "12px",
  },
}));

interface CoursePeriodSelectorProps {
  sessionIndex: number;
}
const CoursePeriodSelector: React.FC<CoursePeriodSelectorProps> = ({ sessionIndex }) => {
  const {
    control,
    formState: { errors },
  } = useClassRoomFormContext();

  const { fields: coursesFields, remove } = useFieldArray({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod`,
    keyName: "_coursePeriod",
  });

  const errorMessage = useMemo(() => {
    return errors.classRoomSessions?.[sessionIndex]?.coursesPeriod?.message;
  }, [errors, sessionIndex]);

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
          <ButtonAddCourse control={control} sessionIndex={sessionIndex} />
        </div>
      </div>

      {coursesFields.length ? (
        <div className="course-period-list">
          <div className="h-6"></div>
          <div className="flex mb-4 gap-4">
            <div className="w-6"></div>
            <div className="w-1/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>Tên môn học</Typography>
            </div>
            <div className="w-2/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                Thời gian học <span className="text-red-600">*</span>
              </Typography>
            </div>
            <div className="w-1/5">
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                Giảng viên <span className="text-red-600">*</span>
              </Typography>
            </div>
          </div>
          <CoursePeriodsWrapper>
            {coursesFields.map(({ _coursePeriod, course }, _indexField) => (
              <div key={_coursePeriod} className="course-period-item flex gap-4">
                <IconButton size="small" onClick={() => remove(_indexField)} className="w-6 h-6 bg-gray-100">
                  <CloseIcon className="w-4 h-4" />
                </IconButton>
                <div className="w-1/5">
                  <Typography sx={{ fontSize: "0.875rem" }}>{course.title}</Typography>
                </div>
                <div className="w-2/5">
                  <FromToDateCourse sessionIndex={sessionIndex} control={control} courseIndex={_indexField} />
                </div>
                <div className="w-1/5">
                  <ButtonSelectTeacher sessionIndex={sessionIndex} control={control} coursePeriodIndex={_indexField} />
                </div>
              </div>
            ))}
          </CoursePeriodsWrapper>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <EmptyData description="Môn học đang trống." iconSize="small" className="mx-auto" />
        </div>
      )}
    </div>
  );
};
export default memo(CoursePeriodSelector);
