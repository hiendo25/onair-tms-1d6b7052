"use client";
import { type ClassRoom } from "../classroom-form.schema";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import ClassRoomSessionFromToDate from "./class-room-session-fields/ClassRoomSessionFromToDate";
import TeacherSelector from "./class-room-session-fields/TeacherSelector";
import RoomChannel from "./class-room-session-fields/RoomChannel";
import AgendarFields from "./class-room-session-fields/AgendarFields";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { MarkerPin01Icon } from "@/shared/assets/icons";
import { forwardRef, useImperativeHandle } from "react";
import QRCodeSettingFields from "./class-room-session-fields/QRCodeSettingFields";
import CoursePeriodSelector from "./class-room-session-fields/CoursePeriodSelector";
import AssessmentField from "./class-room-session-fields/AssessmentField";

export type SingleSessionRef = {
  checkAllSessionField: () => Promise<boolean>;
};
interface SingleSessionProps {
  methods: UseFormReturn<ClassRoom>;
}
const SingleSession = forwardRef<SingleSessionRef, SingleSessionProps>(({ methods }, ref) => {
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
          <div className="flex flex-col gap-6 bg-white rounded-xl p-6 mb-6">
            <ClassRoomSessionFromToDate index={_index} control={control} />
            {/* 
             * Update BA no need teacher for class session 20/11/2025
             /*
            <TeacherSelector sessionIndex={_index} /> */}
            <CoursePeriodSelector sessionIndex={_index} />
            <AssessmentField sessionIndex={_index} control={control} />
            {sessionType === "live" && <RoomChannel control={control} index={_index} />}
            {sessionType === "offline" && (
              <>
                <RHFTextField
                  name={`classRoomSessions.${_index}.location`}
                  control={control}
                  label="Địa điểm tổ chức"
                  required
                  startAdornment={<MarkerPin01Icon />}
                  placeholder="Nhập địa điểm tổ chức lớp học"
                />
                <QRCodeSettingFields sessionIndex={_index} control={control} />
              </>
            )}
            <AgendarFields sessionIndex={_index} />
          </div>
        </div>
      ))}
    </div>
  );
});
export default SingleSession;
