"use client";
import { forwardRef } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";

import { MarkerPin01Icon } from "@/shared/assets/icons";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { type ClassRoom } from "../classroom-form.schema";

import AgendaFieldsControl from "./class-room-session-fields/AgendaFieldsControl";
import AssessmentField from "./class-room-session-fields/AssessmentField";
import CoursePeriodLearningPath from "./class-room-session-fields/CoursePeriodLearningPath";
import CoursePeriodSelector from "./class-room-session-fields/CoursePeriodSelector";
import QRCodeSettingFields from "./class-room-session-fields/QRCodeSettingFields";
import RoomChannel from "./class-room-session-fields/RoomChannel";
import ClassRoomSessionFromToDate from "./class-room-session-fields/SessionFromToDate";
import SessionFromToDateLearningPath from "./class-room-session-fields/SessionFromToDateLearningPath";

export type SingleSessionRef = {
  checkAllSessionField: () => Promise<boolean>;
};
interface SingleSessionProps {
  // methods: UseFormReturn<ClassRoom>;
  control: Control<ClassRoom>;
}

const SingleSession = forwardRef<SingleSessionRef, SingleSessionProps>(({ control }, ref) => {
  const { fields: classSessionsFields } = useFieldArray({
    control,
    name: "classRoomSessions",
    keyName: "_sessionId",
  });

  const isLearningPath = useWatch({ control, name: "classType" }) === "learning_path";

  console.log("render session");
  return (
    <div className="class-single-session">
      {classSessionsFields.map(({ _sessionId, sessionType }, _index) => (
        <div key={_sessionId} className="flex flex-col gap-6 rounded-xl p-3 md:p-6 mb-6 border border-gray-200">
          {isLearningPath ? (
            <>
              <SessionFromToDateLearningPath sessionIndex={_index} control={control} />
              <CoursePeriodLearningPath sessionIndex={_index} control={control} />
            </>
          ) : (
            <>
              <ClassRoomSessionFromToDate index={_index} control={control} />
              <CoursePeriodSelector sessionIndex={_index} />
            </>
          )}
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
          {isLearningPath ? null : <AgendaFieldsControl sessionIndex={_index} control={control} />}
        </div>
      ))}
    </div>
  );
});
export default SingleSession;
