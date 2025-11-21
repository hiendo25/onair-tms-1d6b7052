"use client";
import { useState, useRef, useTransition, useCallback, forwardRef, useImperativeHandle } from "react";
import { type ClassRoom } from "../../classroom-form.schema";
import { Button, Divider, Typography } from "@mui/material";
import RHFTextField from "@/shared/ui/form/RHFTextField";
// import QuantityPersonField from "../class-room-session-fields/QuantityPersonField";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import ClassRoomSessionFromToDate from "../class-room-session-fields/ClassRoomSessionFromToDate";
import AccordionSessionItem, { AccordionSessionItemProps } from "./AccordionSessionItem";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import RHFRichEditor from "@/shared/ui/form/RHFRichEditor";
import RoomChannel from "../class-room-session-fields/RoomChannel";
import TeacherSelector, { TeacherSelectorRef } from "../class-room-session-fields/TeacherSelector";
import AgendarFields from "../class-room-session-fields/AgendarFields";
import { initClassSessionFormData } from "..";
import { MarkerPin01Icon } from "@/shared/assets/icons";
import { useClassRoomStore } from "@/modules/class-room-management/store/class-room-context";
import CoursePeriodSelector from "../class-room-session-fields/CoursePeriodSelector";
import AssessmentField from "../class-room-session-fields/AssessmentField";
import QRCodeSettingFields from "../class-room-session-fields/QRCodeSettingFields";

export type MultipleSessionRef = {
  checkAllSessionFields: () => Promise<boolean>;
};
interface MultipleSessionProps {
  methods: UseFormReturn<ClassRoom>;
}
const MultipleSession = forwardRef<MultipleSessionRef, MultipleSessionProps>(({ methods }, ref) => {
  const {
    control,
    getValues,
    trigger,
    formState: { errors },
  } = methods;

  const {
    fields: classSessionsFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "classRoomSessions",
    keyName: "_sessionId",
  });
  const getTeachersByIndexSession = useClassRoomStore(({ actions }) => actions.getTeachersByIndexSession);
  const teacherSelectorRefs = useRef(new Map<number, TeacherSelectorRef>());
  const [isTransition, startTransition] = useTransition();
  /**
   * Session init items to validate when click add more button.
   */

  const [sessionsState, setSessionsState] = useState<{
    [key: number]: {
      isInit: boolean;
    };
  }>(() => Object.fromEntries(classSessionsFields.map((fields, _index) => [_index, { isInit: true }])));

  const hasErrorSession = (index: number): AccordionSessionItemProps["status"] => {
    if (sessionsState[index]?.isInit) {
      return "idle";
    }
    const sessionError = errors.classRoomSessions?.[index];
    const selectedTeacher = getTeachersByIndexSession(index);
    /**
     * qrcode check in tab setting
     */
    const { qrCode, ...restSessionError } = sessionError || {};

    if (!selectedTeacher || !selectedTeacher.length || Object.keys(restSessionError).length) return "invalid";

    return "valid";
  };

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
  const handleAddClassSession = () =>
    checkAllSessionFields(() => {
      startTransition(() => {
        const nextSessionIndex = classSessionsFields.length;
        const platform = getValues("platform");
        append(initClassSessionFormData(platform !== "hybrid" ? { sessionType: platform } : undefined));
        setSessionsState((prev) => ({ ...prev, [nextSessionIndex]: { isInit: true } }));
      });
    });

  const handleRemoveSession = useCallback((sessionIndex: number) => {
    const teacherRef = teacherSelectorRefs.current.get(sessionIndex);
    teacherRef?.removeTeachersBySessionIndex(sessionIndex);
    setTimeout(() => {
      remove(sessionIndex);
    }, 0);
  }, []);

  useImperativeHandle(ref, () => ({
    checkAllSessionFields: async () => {
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
      return isAllSessionValid;
    },
  }));
  return (
    <div className="class-multiple-session">
      <div className="inner">
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
              onRemove={classSessionsFields.length > 2 ? handleRemoveSession : undefined}
              status={hasErrorSession(_index)}
            >
              <div className="pt-6">
                <div className="flex flex-col gap-6">
                  <RHFTextField
                    control={control}
                    label="Tên lớp học"
                    placeholder="Tên lớp học"
                    name={`classRoomSessions.${_index}.title`}
                    required
                    helpText={<Typography className="text-xs text-gray-600 text-right">Tối đa 100 ký tự</Typography>}
                  />
                  <ClassRoomSessionFromToDate index={_index} control={control} />
                  <CoursePeriodSelector sessionIndex={_index} />
                  <AssessmentField sessionIndex={_index} control={control} />
                  {/* <QuantityPersonField control={control} fieldIndex={_index} /> */}
                  <RHFRichEditor
                    control={control}
                    name={`classRoomSessions.${_index}.description`}
                    placeholder="Nội dung"
                    label="Nội dung"
                    required
                  />
                  {/* <TeacherSelector
                    ref={(tRef) => {
                      tRef && teacherSelectorRefs.current.set(_index, tRef);
                    }}
                    sessionIndex={_index}
                    error={sessionsState[_index]?.isInit ? undefined : !getTeachersByIndexSession(_index)?.length}
                    helperText="Hiện chưa có giáo viên nào được chọn"
                  /> */}

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
export default MultipleSession;
