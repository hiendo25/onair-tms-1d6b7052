"use client";
import { useClassRoomFormContext } from "../ClassRoomFormContainer";
import SingleSession, { SingleSessionRef } from "./SingleSession";
import MultipleSession, { MultipleSessionRef } from "./MultipleSession";
import { ClassRoom } from "../../classroom-form.schema";
import { forwardRef, useImperativeHandle, useRef } from "react";

export const initClassSessionFormData = (init?: { isOnline?: boolean }): ClassRoom["classRoomSessions"][number] => {
  return {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    channelInfo: { url: "", password: "", providerId: "" },
    channelProvider: "zoom",
    thumbnailUrl: "",
    location: "",
    isOnline: init?.isOnline || false,
    agendas: [],
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
