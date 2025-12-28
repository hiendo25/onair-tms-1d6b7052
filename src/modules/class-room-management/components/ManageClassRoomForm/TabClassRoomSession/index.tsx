"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { ClassType } from "@/model/enum-type.model";
import { ClassRoom } from "../classroom-form.schema";
import { useClassRoomFormContext } from "../ClassRoomFormContainer";

import MultipleSession, { MultipleSessionRef } from "./MultipleSession";
import SingleSession, { SingleSessionRef } from "./SingleSession";

export const initClassSessionFormData = (init?: {
  sessionType?: "online" | "offline" | "live";
  classType: ClassType;
}): ClassRoom["classRoomSessions"][number] => {
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
  const singleSessionRef = useRef<SingleSessionRef>(null);
  const multipleSessionRef = useRef<MultipleSessionRef>(null);
  const { getValues } = methods;
  const classRoomType = getValues("roomType");

  useImperativeHandle(ref, () => ({
    checkAllFields: async () => {
      if (multipleSessionRef.current && singleSessionRef.current) {
        return classRoomType === "multiple"
          ? await multipleSessionRef.current.checkAllSessionFields()
          : await singleSessionRef.current.checkAllSessionField();
      }
      return false;
    },
  }));
  return (
    <div>
      {classRoomType === "single" ? <SingleSession methods={methods} ref={singleSessionRef} /> : null}
      {classRoomType === "multiple" ? <MultipleSession methods={methods} ref={multipleSessionRef} /> : null}
    </div>
  );
});
export default TabClassRoomSession;
