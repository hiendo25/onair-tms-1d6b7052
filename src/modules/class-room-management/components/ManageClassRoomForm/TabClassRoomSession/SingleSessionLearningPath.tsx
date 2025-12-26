"use client";
import { forwardRef, useImperativeHandle } from "react";
import { FormControl, InputAdornment, MenuItem, Select, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { DayCalendar } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { MarkerPin01Icon } from "@/shared/assets/icons";
import RHFSelectField from "@/shared/ui/form/RHFSelectField";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { type ClassRoom } from "../classroom-form.schema";

import AgendaFieldsControl from "./class-room-session-fields/AgendaFieldsControl";
import AssessmentField from "./class-room-session-fields/AssessmentField";
import ClassRoomSessionFromToDate from "./class-room-session-fields/ClassRoomSessionFromToDate";
import CoursePeriodSelector from "./class-room-session-fields/CoursePeriodSelector";
import QRCodeSettingFields from "./class-room-session-fields/QRCodeSettingFields";
import RoomChannel from "./class-room-session-fields/RoomChannel";

export type SingleSessionLearningPathRef = {
  checkAllSessionField: () => Promise<boolean>;
};
interface SingleSessionLearningPathProps {
  methods: UseFormReturn<ClassRoom>;
}

const dayOfWeekOptions = [
  { label: "Thứ Hai", value: "mon" },
  { label: "Thứ Ba", value: "tue" },
  { label: "Thứ Tư", value: "wed" },
  { label: "Thứ Năm", value: "thu" },
  { label: "Thứ Sáu", value: "fri" },
  { label: "Thứ Bảy", value: "sat" },
  { label: "Chủ Nhật", value: "sun" },
];
const SingleSessionLearningPath = forwardRef<SingleSessionLearningPathRef, SingleSessionLearningPathProps>(
  ({ methods }, ref) => {
    const { control, getValues, trigger } = methods;

    const { fields: classSessionsFields } = useFieldArray({
      control,
      name: "classRoomSessions",
      keyName: "_sessionId",
    });

    useImperativeHandle(ref, () => ({
      checkAllSessionField: async () => {
        return await trigger("classRoomSessions");
      },
    }));

    return (
      <div className="class-single-session">
        {classSessionsFields.map(({ _sessionId, sessionType }, _index) => (
          <div key={_sessionId}>
            <div className="flex flex-col gap-6 rounded-xl p-3 md:p-6 mb-6 border border-gray-200">
              <ClassRoomSessionFromToDate index={_index} control={control} />
              <div className="flex items-center gap-2 max-w-[320px]">
                <FormControl>
                  <Select value="" onChange={() => {}}>
                    {dayOfWeekOptions.map((day) => (
                      <MenuItem key={day.value}>
                        <div key={day.value}>
                          <Typography className="text-sm font-medium">{day.label}</Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TimePicker ampm={false} closeOnSelect />
              </div>
              <div className="flex items-center gap-2 max-w-[320px]">
                <FormControl>
                  <Select value="" onChange={() => {}}>
                    {dayOfWeekOptions.map((day) => (
                      <MenuItem key={day.value}>
                        <div key={day.value}>
                          <Typography className="text-sm font-medium">{day.label}</Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TimePicker ampm={false} closeOnSelect />
              </div>
              <CoursePeriodSelector sessionIndex={_index} methods={methods} />
              <AssessmentField sessionIndex={_index} control={control} />

              {sessionType === "live" && <RoomChannel control={control} index={_index} />}
              {sessionType === "offline" && (
                <>
                  <RHFTextField
                    name={`classRoomSessions.${_index}.location`}
                    control={control}
                    label="Địa điểm tổ chức"
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <MarkerPin01Icon className="w-5 h-5" />
                      </InputAdornment>
                    }
                    placeholder="Nhập địa điểm tổ chức lớp học"
                  />
                  <QRCodeSettingFields sessionIndex={_index} control={control} />
                </>
              )}
              <AgendaFieldsControl sessionIndex={_index} />
            </div>
          </div>
        ))}
      </div>
    );
  },
);
export default SingleSessionLearningPath;
