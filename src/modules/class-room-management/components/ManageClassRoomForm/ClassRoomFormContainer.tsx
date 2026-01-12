"use client";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { ClassRoomType } from "@/model/class-room.model";
import { CalendarDateIcon, GlobeIcon, UsersPlusIcon } from "@/shared/assets/icons";
import { useClassRoomStore } from "../../store/class-room-context";
import { ClassRoomStore } from "../../store/class-room-store";

import ButtonCancel from "./ButtonCancel";
import ButtonSubmit from "./ButtonSubmit";
import { ClassRoomFormValues, classRoomSchema } from "./classroom-form.schema";
import ClassRoomTabContainer, { ClassRoomTabContainerRef } from "./ClassRoomTabContainer";
import TabClassRoomInformation from "./TabClassRoomInformation";
import TabClassRoomSession, { initClassSessionFormData } from "./TabClassRoomSession";
import TabClassRoomSetting from "./TabClassRoomSetting";
import { getKeyFieldByTab } from "./utils";
export const TAB_KEYS_CLASS_ROOM = {
  "clsTab-information": "clsTab-information",
  "clsTab-session": "clsTab-session",
  "clsTab-setting": "clsTab-setting",
} as const;

export const initClassRoomFormData = (option: {
  platform?: ClassRoomPlatformType;
  roomType?: ClassRoomType;
}): Partial<ClassRoomFormValues> => {
  return {
    title: "",
    description: "",
    thumbnailUrl: "",
    categories: [],
    classRoomId: "",
    slug: "",
    status: "draft",
    roomType: option?.roomType,
    forWhom: [],
    docs: [],
    platform: option?.platform,
    classRoomSessions: [],
    classType: "room",
  };
};

export interface ClassRoomFormContainerRef {
  resetForm: () => void;
}
export interface ClassRoomFormContainerProps {
  onSubmit?: (formData: ClassRoomFormValues, selectedStudents: ClassRoomStore["state"]["selectedStudents"]) => void;
  onCancel?: () => void;
  platform: ClassRoomPlatformType;
  roomType?: ClassRoomType;
  isLearningPath?: boolean;
  value?: ClassRoomFormValues;
  isLoading?: boolean;
  action?: "create" | "edit";
}
const ClassRoomFormContainer = forwardRef<ClassRoomFormContainerRef, ClassRoomFormContainerProps>(
  (
    { onSubmit, isLoading, action, value: initFormValue, platform, roomType, onCancel, isLearningPath = false },
    ref,
  ) => {
    const buttonActionRef = useRef<"submit" | "cancel">(null);
    const classRoomTabContainerRef = useRef<ClassRoomTabContainerRef>(null);
    const resetStore = useClassRoomStore(({ actions }) => actions.reset);
    const selectedStudents = useClassRoomStore(({ state }) => state.selectedStudents);

    const methods = useForm<ClassRoomFormValues>({
      resolver: zodResolver(classRoomSchema),
      defaultValues: initClassRoomFormData({
        platform: platform,
        roomType: roomType,
      }),
      reValidateMode: "onChange",
      mode: "onChange",
    });

    const {
      control,
      handleSubmit,
      formState: { errors },
      trigger,
      reset,
    } = methods;

    console.log({ errors, selectedStudents, isLearningPath });

    const checkAllFieldsValueTabBeforeSubmit = (submitAction: () => void) => async () => {
      try {
        const TAB_LIST = isLearningPath
          ? [TAB_KEYS_CLASS_ROOM["clsTab-information"], TAB_KEYS_CLASS_ROOM["clsTab-session"]]
          : [
              TAB_KEYS_CLASS_ROOM["clsTab-information"],
              TAB_KEYS_CLASS_ROOM["clsTab-session"],
              TAB_KEYS_CLASS_ROOM["clsTab-setting"],
            ];
        const allTabsTriggers = await Promise.allSettled(
          TAB_LIST.map(async (key) => {
            const isValid = await trigger(getKeyFieldByTab(key));
            classRoomTabContainerRef.current?.setTabStatus(key, isValid ? "valid" : "invalid");
            return isValid;
          }),
        );
        const isSomeTabFailed = allTabsTriggers.some((tab) => tab.status === "rejected" || !tab.value);

        if (isSomeTabFailed) return;

        submitAction();
      } catch (error) {
        console.log(error);
      }
    };

    const handleSubmitForm = () => {
      buttonActionRef.current = "submit";
      handleSubmit((data) => onSubmit?.({ ...data, status: "publish" }, selectedStudents))();
    };

    const handleCancel = () => {
      buttonActionRef.current = "cancel";
      resetStore();
      reset();
      onCancel?.();
    };

    const TAB_ITEMS = useMemo(() => {
      const BASE_ITEMS = [
        {
          tabName: "Thông tin chung",
          tabKey: TAB_KEYS_CLASS_ROOM["clsTab-information"],
          prev: null,
          next: TAB_KEYS_CLASS_ROOM["clsTab-session"],
          icon: <GlobeIcon className="w-5 h-5" />,
          content: <TabClassRoomInformation action={action} />,
        },
        {
          tabName: "Thời gian",
          tabKey: TAB_KEYS_CLASS_ROOM["clsTab-session"],
          prev: TAB_KEYS_CLASS_ROOM["clsTab-information"],
          next: isLearningPath ? null : TAB_KEYS_CLASS_ROOM["clsTab-setting"],
          icon: <CalendarDateIcon className="w-5 h-5" />,
          content: <TabClassRoomSession />,
        },
      ];
      return isLearningPath
        ? BASE_ITEMS
        : [
            ...BASE_ITEMS,
            {
              tabName: "Thiết lập",
              tabKey: TAB_KEYS_CLASS_ROOM["clsTab-setting"],
              prev: TAB_KEYS_CLASS_ROOM["clsTab-session"],
              next: null,
              icon: <UsersPlusIcon className="w-5 h-5" />,
              content: <TabClassRoomSetting />,
            },
          ];
    }, [action, isLearningPath]);
    /**
     * Init form value
     */

    useEffect(() => {
      const base = initClassRoomFormData({ platform, roomType });

      if (initFormValue) {
        reset(initFormValue);
        return;
      }

      const initSessions = initClassSessionFormData(
        platform !== "hybrid"
          ? { sessionType: platform, classType: isLearningPath ? "learning_path" : "room" }
          : undefined,
      );

      reset({
        ...base,
        classRoomSessions: roomType === "multiple" ? [initSessions, initSessions] : [initSessions],
        classType: isLearningPath ? "learning_path" : "room",
      });
      return () => {
        buttonActionRef.current = null;
      };
    }, [initFormValue, platform, roomType, isLearningPath, reset]);

    useImperativeHandle(ref, () => ({
      resetForm: () => {
        resetStore(); // Reset all selected value in classRoom store
        reset(); //Reset Form
      },
    }));

    return (
      <FormProvider {...methods}>
        <ClassRoomTabContainer
          ref={classRoomTabContainerRef}
          trigger={trigger}
          errors={errors}
          items={TAB_ITEMS}
          actions={
            <div className="flex items-center gap-2">
              <ButtonCancel
                onOk={handleCancel}
                loading={isLoading && buttonActionRef.current === "cancel"}
                initialData={initFormValue}
              />
              <ButtonSubmit
                onClick={checkAllFieldsValueTabBeforeSubmit(handleSubmitForm)}
                disabled={isLoading}
                loading={isLoading && buttonActionRef.current === "submit"}
              >
                {action === "create" ? "Đăng tải" : "Cập nhật"}
              </ButtonSubmit>
            </div>
          }
        />
      </FormProvider>
    );
  },
);
export default ClassRoomFormContainer;

export const useClassRoomFormContext = useFormContext<ClassRoomFormValues>;
