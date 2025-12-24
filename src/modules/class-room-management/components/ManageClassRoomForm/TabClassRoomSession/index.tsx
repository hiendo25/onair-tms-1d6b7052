"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { ClassRoom } from "../classroom-form.schema";
import { useClassRoomFormContext } from "../ClassRoomFormContainer";

import MultipleSession, { MultipleSessionRef } from "./MultipleSession";
import SingleSession, { SingleSessionRef } from "./SingleSession";
import SingleSessionLearningPath from "./SingleSessionLearningPath";

export const initClassSessionFormData = (init?: {
  sessionType?: "online" | "offline" | "live";
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
    assessmentId: "",
    qrCode: { startDate: "", endDate: "", isLimitTimeScanQrCode: false },
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
  const isLearningPath = getValues("isLearningPath");

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

  if (isLearningPath) {
    return (
      <div>
        {classRoomType === "single" ? <SingleSessionLearningPath methods={methods} ref={singleSessionRef} /> : null}
        {/* {classRoomType === "multiple" ? <MultipleSession methods={methods} ref={multipleSessionRef} /> : null} */}
      </div>
    );
  }
  return (
    <div>
      {classRoomType === "single" ? <SingleSession methods={methods} ref={singleSessionRef} /> : null}
      {classRoomType === "multiple" ? <MultipleSession methods={methods} ref={multipleSessionRef} /> : null}
    </div>
  );
});
export default TabClassRoomSession;
