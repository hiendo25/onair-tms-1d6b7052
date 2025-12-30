"use client";
import { forwardRef, memo, useCallback, useState, useTransition } from "react";
import { Button, Divider, Typography } from "@mui/material";
import { Control, useFieldArray, useWatch } from "react-hook-form";

import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { ClassRoom } from "../../classroom-form.schema";
import { useClassRoomFormContext } from "../../ClassRoomFormContainer";
import { initClassSessionFormData } from "..";
import SessionFormItem from "../SessionFormItem";

import AccordionSessionItem, { AccordionSessionItemProps } from "./AccordionSessionItem";

export type MultipleSessionRef = {
  checkAllSessionFields: () => Promise<boolean>;
};

interface MultipleSessionProps {
  className?: string;
  control: Control<ClassRoom>;
}
const MultipleSession = forwardRef<MultipleSessionRef, MultipleSessionProps>(({ className, control }, ref) => {
  const {
    getValues,
    trigger,
    formState: { errors },
  } = useClassRoomFormContext();

  const {
    fields: classSessionsFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "classRoomSessions",
    keyName: "_sessionId",
  });
  const [isTransition, startTransition] = useTransition();
  /**
   * Session init items to validate when click add more button.
   */

  const classType = useWatch({ control, name: "classType" });

  const [sessionsState, setSessionsState] = useState<{
    [key: number]: {
      isInit: boolean;
    };
  }>(() => Object.fromEntries(classSessionsFields.map((fields, _index) => [_index, { isInit: true }])));

  const hasErrorSession = useCallback(
    (index: number): AccordionSessionItemProps["status"] => {
      if (sessionsState[index]?.isInit) {
        return "idle";
      }

      const sessionError = errors.classRoomSessions?.[index];
      /**
       * qrcode check in tab setting
       */
      const { qrCode, ...restSessionError } = sessionError || {};

      if (Object.keys(restSessionError).length) return "invalid";

      return "valid";
    },
    [errors, sessionsState],
  );

  const checkAllSessionFields = async (callback?: () => void) => {
    const isAllSessionValid = await trigger("classRoomSessions");

    setSessionsState((oldState) => {
      const newState = { ...oldState };
      for (const key in newState) {
        if (newState[key]) {
          newState[key].isInit = false;
        }
      }
      return newState;
    });

    if (!isAllSessionValid) return;

    callback?.();
  };
  const handleAddClassSession = useCallback(
    () =>
      checkAllSessionFields(() => {
        startTransition(() => {
          const nextSessionIndex = classSessionsFields.length;
          const platform = getValues("platform");
          append(
            initClassSessionFormData(
              platform !== "hybrid" ? { sessionType: platform, classType: getValues("classType") } : undefined,
            ),
          );
          setSessionsState((prev) => ({ ...prev, [nextSessionIndex]: { isInit: true } }));
        });
      }),
    [],
  );

  return (
    <div className="class-multiple-session">
      <div className="inner rounded-xl">
        <div className="mb-6">
          <Typography component="h3" className="text-base font-semibold">
            Chi tiết chuỗi lớp học
          </Typography>
        </div>
        <div className="session-list flex flex-col gap-3">
          {classSessionsFields.map(({ _sessionId, title, sessionType }, _index) => (
            <AccordionSessionItem
              index={_index}
              key={_sessionId}
              title={title}
              {...(classSessionsFields.length > 2 ? { onRemove: remove } : {})}
              status={hasErrorSession(_index)}
            >
              <SessionFormItem index={_index} control={control} isLearningPath={classType === "learning_path"} />
            </AccordionSessionItem>
          ))}
        </div>
        <div className="h-6"></div>
        <Divider>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<PlusIcon />}
            onClick={handleAddClassSession}
            size="small"
            loading={isTransition}
          >
            Thêm mới
          </Button>
        </Divider>
      </div>
    </div>
  );
});
export default memo(MultipleSession);
