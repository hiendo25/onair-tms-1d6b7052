"use client";
import React, { memo } from "react";
import { Typography } from "@mui/material";
import { Control, Controller } from "react-hook-form";

import { MarkerPin01Icon } from "@/shared/assets/icons";
import RHFRichEditor from "@/shared/ui/form/RHFRichEditor";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import RHFTinyEditor from "@/shared/ui/form/RHFTinyEditor";
import { type ClassRoom } from "../classroom-form.schema";

import AgendaFieldsControl from "./class-room-session-fields/AgendaFieldsControl";
import AssessmentField from "./class-room-session-fields/AssessmentField";
import CoursePeriodLearningPath from "./class-room-session-fields/CoursePeriodLearningPath";
import CoursePeriodSelector from "./class-room-session-fields/CoursePeriodSelector";
import QRCodeSettingFields from "./class-room-session-fields/QRCodeSettingFields";
import RoomChannel from "./class-room-session-fields/RoomChannel";
import ClassRoomSessionFromToDate from "./class-room-session-fields/SessionFromToDate";
import SessionFromToDateLearningPath from "./class-room-session-fields/SessionFromToDateLearningPath";

interface SessionFormItemProps {
  index: number;
  isLearningPath: boolean;
  control: Control<ClassRoom>;
}

const SessionFormItem: React.FC<SessionFormItemProps> = ({ index, isLearningPath, control }) => {
  console.log("render session", index);
  return (
    <div className="flex flex-col gap-6 pt-6">
      <RHFTextField
        control={control}
        label="Tên lớp học"
        placeholder="Tên lớp học"
        name={`classRoomSessions.${index}.title`}
        required
        helpText={<Typography className="text-xs text-gray-600 text-right">Tối đa 100 ký tự</Typography>}
      />
      {isLearningPath ? (
        <>
          <SessionFromToDateLearningPath sessionIndex={index} control={control} />
          <CoursePeriodLearningPath sessionIndex={index} control={control} />
        </>
      ) : (
        <>
          <ClassRoomSessionFromToDate index={index} control={control} />
          <CoursePeriodSelector sessionIndex={index} />
        </>
      )}

      <AssessmentField sessionIndex={index} control={control} />

      <RHFTinyEditor
        control={control}
        name={`classRoomSessions.${index}.description`}
        placeholder="Nội dung"
        label="Nội dung"
        required
      />

      <Controller
        control={control}
        name={`classRoomSessions.${index}.sessionType`}
        render={({ field: { value: sessionType } }) => (
          <>
            {sessionType === "live" && <RoomChannel control={control} index={index} />}
            {sessionType === "offline" && (
              <>
                <RHFTextField
                  name={`classRoomSessions.${index}.location`}
                  control={control}
                  label="Địa điểm tổ chức"
                  required
                  startAdornment={<MarkerPin01Icon />}
                  placeholder="Nhập địa điểm tổ chức lớp học"
                />
                <QRCodeSettingFields sessionIndex={index} control={control} />
              </>
            )}
          </>
        )}
      />

      <AgendaFieldsControl sessionIndex={index} control={control} />
    </div>
  );
};

export default memo(SessionFormItem);
