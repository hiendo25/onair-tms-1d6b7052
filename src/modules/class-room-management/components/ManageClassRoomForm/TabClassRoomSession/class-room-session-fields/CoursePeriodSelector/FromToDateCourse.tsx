import React, { useMemo } from "react";
import { styled } from "@mui/material";
import dayjs from "dayjs";
import { Control, useWatch } from "react-hook-form";

import RHFDateTimePicker, { RHFDateTimePickerProps } from "@/shared/ui/form/RHFDateTimePicker";
import { ClassRoomFormValues } from "../../../classroom-form.schema";

const StyledDateTimePicker = styled((props: RHFDateTimePickerProps<ClassRoomFormValues>) => (
  <RHFDateTimePicker
    {...props}
    sx={{
      ".MuiPickersInputBase-root": {
        paddingLeft: 1.5,
        paddingRight: 1.5,
        borderRadius: "6px",
        height: 30,
      },
      ".MuiPickersSectionList-root": {
        paddingTop: "3px !important",
        paddingBottom: "3px !important",
        fontSize: "0.75rem",
      },
      ".MuiButtonBase-root": {
        width: 24,
        height: 24,
        svg: {
          fontSize: "1rem",
        },
      },
    }}
  />
))(({ theme }) => ({}));

interface FromToDateCourseProps {
  sessionIndex: number;
  courseIndex: number;
  control: Control<ClassRoomFormValues>;
}

const FromToDateCourse: React.FC<FromToDateCourseProps> = ({ sessionIndex, control, courseIndex }) => {
  const sessionStartDate = useWatch({ control, name: `classRoomSessions.${sessionIndex}.startDate` });
  const sessionEndDate = useWatch({ control, name: `classRoomSessions.${sessionIndex}.endDate` });

  const coursesPeriods = useWatch({ control, name: `classRoomSessions.${sessionIndex}.coursesPeriod` });

  const currentPeriod = coursesPeriods[courseIndex];

  const limitationCoursePeriodDate = useMemo(() => {
    const limitDateMap = new Map(
      coursesPeriods.map((item, index) => [
        index,
        {
          startAt: item.startAt,
          endAt: item.endAt,
        },
      ]),
    );
    const prevLimitDate = courseIndex > 0 ? limitDateMap.get(courseIndex - 1) : undefined;
    const nextLimitDate = courseIndex < coursesPeriods.length - 1 ? limitDateMap.get(courseIndex + 1) : undefined;

    const minDate = prevLimitDate?.endAt
      ? prevLimitDate?.endAt
      : prevLimitDate?.startAt
      ? prevLimitDate?.startAt
      : undefined;

    const maxDate = nextLimitDate?.startAt
      ? nextLimitDate?.startAt
      : nextLimitDate?.endAt
      ? nextLimitDate?.endAt
      : undefined;

    return {
      minDate,
      maxDate,
    };
  }, [coursesPeriods, courseIndex]);
  return (
    <div className="flex gap-x-2 max-w-[380px]">
      <StyledDateTimePicker
        control={control}
        name={`classRoomSessions.${sessionIndex}.coursesPeriod.${courseIndex}.startAt`}
        minDateTime={
          limitationCoursePeriodDate?.minDate
            ? dayjs(limitationCoursePeriodDate.minDate)
            : sessionStartDate
            ? dayjs(sessionStartDate)
            : dayjs()
        }
        maxDateTime={
          currentPeriod?.endAt
            ? dayjs(currentPeriod.endAt)
            : limitationCoursePeriodDate?.maxDate
            ? dayjs(limitationCoursePeriodDate?.maxDate)
            : sessionEndDate
            ? dayjs(sessionEndDate)
            : undefined
        }
      />
      <StyledDateTimePicker
        control={control}
        name={`classRoomSessions.${sessionIndex}.coursesPeriod.${courseIndex}.endAt`}
        minDateTime={
          currentPeriod?.startAt
            ? dayjs(currentPeriod.startAt)
            : limitationCoursePeriodDate?.maxDate
            ? dayjs(limitationCoursePeriodDate.maxDate)
            : sessionStartDate
            ? dayjs(sessionStartDate)
            : dayjs()
        }
        maxDateTime={
          limitationCoursePeriodDate?.maxDate
            ? dayjs(limitationCoursePeriodDate.maxDate)
            : sessionEndDate
            ? dayjs(sessionEndDate)
            : undefined
        }
      />
    </div>
  );
};
export default FromToDateCourse;
