"use client";
import { forwardRef, useImperativeHandle } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { MarkerPin01Icon } from "@/shared/assets/icons";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { type ClassRoom } from "../classroom-form.schema";

import AgendaFieldsControl from "./class-room-session-fields/AgendaFieldsControl";
import AssessmentField from "./class-room-session-fields/AssessmentField";
import ClassRoomSessionFromToDate from "./class-room-session-fields/ClassRoomSessionFromToDate";
import CoursePeriodSelector from "./class-room-session-fields/CoursePeriodSelector";
import QRCodeSettingFields from "./class-room-session-fields/QRCodeSettingFields";
import RoomChannel from "./class-room-session-fields/RoomChannel";

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
          <div className="flex flex-col gap-6 rounded-xl p-3 md:p-6 mb-6 border border-gray-200">
            <ClassRoomSessionFromToDate index={_index} control={control} />

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
                  startAdornment={<MarkerPin01Icon />}
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
});
export default SingleSession;
