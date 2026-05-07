"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useWatch } from "react-hook-form";

import { ClassType } from "@/model/enum-type.model";
import { ClassRoomFormValues } from "../classroom-form.schema";
import { useClassRoomFormContext } from "../ClassRoomFormContainer";

import MultipleSession, { MultipleSessionRef } from "./MultipleSession";
import SingleSession, { SingleSessionRef } from "./SingleSession";

export const initClassSessionFormData = (init?: {
  sessionType?: "online" | "offline" | "live";
  classType: ClassType;
}): ClassRoomFormValues["classRoomSessions"][number] => {
  return {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    channelInfo: { url: "", password: "", providerId: "" },
    channelProvider: "zoom",
    thumbnailUrl: "",
    location: "",
    sessionType: init?.sessionType ?? "live",
    agendas: [],
    coursesPeriod: [],
    assignments: [],
    qrCode: { startDate: "", endDate: "", isLimitTimeScanQrCode: false },
    weeklySchedule: undefined,
    classType: init?.classType,
  };
};

type TabClassRoomSessionRef = {
  checkAllFields: () => Promise<boolean>;
};
interface TabClassRoomSessionProps {}
const TabClassRoomSession = forwardRef<TabClassRoomSessionRef, TabClassRoomSessionProps>((props, ref) => {
  const methods = useClassRoomFormContext();
  const { control, trigger } = methods;

  const singleSessionRef = useRef<SingleSessionRef>(null);
  const multipleSessionRef = useRef<MultipleSessionRef>(null);

  const classRoomType = useWatch({ control, name: "roomType" });

  return (
    <div>
      {classRoomType === "single" ? <SingleSession ref={singleSessionRef} control={control} /> : null}
      {classRoomType === "multiple" ? <MultipleSession ref={multipleSessionRef} control={control} /> : null}
    </div>
  );
});
export default TabClassRoomSession;
