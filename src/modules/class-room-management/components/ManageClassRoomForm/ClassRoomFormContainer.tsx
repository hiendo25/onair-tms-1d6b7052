"use client";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton } from "@mui/material";
import { FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";

import { ClassRoomPlatformType } from "@/constants/class-room.constant";
import { ClassRoomType } from "@/model/class-room.model";
import { CalendarDateIcon, CloseIcon, EyeIcon, GlobeIcon, UsersPlusIcon } from "@/shared/assets/icons";
import { useClassRoomStore } from "../../store/class-room-context";
import { ClassRoomStore } from "../../store/class-room-store";

import { ClassRoom, classRoomSchema } from "./classroom-form.schema";
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

export const TAB_NODES_CLASS_ROOM = new Map([
  [
    TAB_KEYS_CLASS_ROOM["clsTab-information"],
    {
      prev: null,
      next: TAB_KEYS_CLASS_ROOM["clsTab-session"],
    },
  ],
  [
    TAB_KEYS_CLASS_ROOM["clsTab-session"],
    {
      prev: TAB_KEYS_CLASS_ROOM["clsTab-information"],
      next: TAB_KEYS_CLASS_ROOM["clsTab-setting"],
    },
  ],
  [
    TAB_KEYS_CLASS_ROOM["clsTab-setting"],
    {
      prev: TAB_KEYS_CLASS_ROOM["clsTab-session"],
      next: null,
    },
  ],
]);

export const initClassRoomFormData = (oprions: {
  platform?: ClassRoomPlatformType;
  roomType?: ClassRoomType;
}): Partial<ClassRoom> => {
  return {
    title: "",
    description: "",
    thumbnailUrl: "",
    categories: [],
    classRoomId: "",
    slug: "",
    status: "draft",
    roomType: oprions?.roomType,
    forWhom: [],
    docs: [],
    platform: oprions?.platform,
    classRoomSessions: [],
    isLearningPath: false,
  };
};

export interface ClassRoomFormContainerRef {
  resetForm: () => void;
}
export interface ClassRoomFormContainerProps {
  onSubmit?: (formData: ClassRoom, selectedStudents: ClassRoomStore["state"]["selectedStudents"]) => void;
  onCancel?: () => void;
  platform: ClassRoomPlatformType;
  roomType?: ClassRoomType;
  isLearningPath?: boolean;
  value?: ClassRoom;
  isLoading?: boolean;
  action?: "create" | "edit";
}
const ClassRoomFormContainer = forwardRef<ClassRoomFormContainerRef, ClassRoomFormContainerProps>(
  (
    { onSubmit, isLoading, action, value: initFormValue, platform, roomType, onCancel, isLearningPath = false },
    ref,
  ) => {
    const classRoomTabContainerRef = useRef<ClassRoomTabContainerRef>(null);
    const resetStore = useClassRoomStore(({ actions }) => actions.reset);
    const selectedStudents = useClassRoomStore(({ state }) => state.selectedStudents);

    const methods = useForm<ClassRoom>({
      resolver: zodResolver(classRoomSchema),
      defaultValues: initClassRoomFormData({
        platform: platform,
        roomType: roomType,
      }),
      mode: "onChange",
    });

    const {
      getValues,
      setValue,
      handleSubmit,
      formState: { errors },
      trigger,
      reset,
      watch,
    } = methods;

    console.log({ errors, value: getValues(), selectedStudents, isLearningPath });

    const checkAllFieldsValueTabBeforeSubmit = (submitAction: () => void, status: "draft" | "publish") => async () => {
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

        setValue("status", status);

        submitAction();
      } catch (error) {
        console.log(error);
      }
    };

    const submitForm: SubmitHandler<ClassRoom> = (data) => {
      console.log({ errors, data, selectedStudents });

      onSubmit?.(data, selectedStudents);
    };

    const cancelCreateClassRoom = () => {
      resetStore(); // Reset all selected value in classRoom store
      reset(); //Reset Form
      onCancel?.();
    };

    const TAB_ITEMS = useMemo(() => {
      const BASE_ITEMS = [
        {
          tabName: "Thông tin chung",
          tabKey: TAB_KEYS_CLASS_ROOM["clsTab-information"],
          icon: <GlobeIcon className="w-5 h-5" />,
          content: <TabClassRoomInformation />,
        },
        {
          tabName: "Thời gian",
          tabKey: TAB_KEYS_CLASS_ROOM["clsTab-session"],
          icon: <CalendarDateIcon className="w-5 h-5" />,
          content: <TabClassRoomSession />,
        },
        // {
        //   tabName: "Tài nguyên",
        //   tabKey: TAB_KEYS_CLASS_ROOM["clsTab-resource"],
        //   icon: <ClipboardIcon className="w-5 h-5" />,
        //   content: <TabClassRoomResource />,
        // },
      ];
      return isLearningPath
        ? BASE_ITEMS
        : [
            ...BASE_ITEMS,
            {
              tabName: "Thiết lập",
              tabKey: TAB_KEYS_CLASS_ROOM["clsTab-setting"],
              icon: <UsersPlusIcon className="w-5 h-5" />,
              content: <TabClassRoomSetting />,
            },
          ];
    }, [isLearningPath]);
    /**
     * Init form value
     */
    useLayoutEffect(() => {
      if (!initFormValue) return;
      reset({ ...initFormValue });
    }, [initFormValue, reset]);

    useLayoutEffect(() => {
      if (!roomType) return;

      const initSessionsFormData = initClassSessionFormData(
        platform !== "hybrid" ? { sessionType: platform } : undefined,
      );
      setValue(
        "classRoomSessions",
        roomType === "multiple" ? [initSessionsFormData, initSessionsFormData] : [initSessionsFormData],
      );
    }, [roomType, platform]);

    useLayoutEffect(() => {
      if (!isLearningPath) return;

      setValue("isLearningPath", isLearningPath);
    }, [isLearningPath]);

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
              <IconButton
                className="border rounded-lg border-gray-300 bg-white"
                onClick={cancelCreateClassRoom}
                disabled={isLoading}
              >
                <CloseIcon />
              </IconButton>
              {/* <IconButton className="border rounded-lg border-gray-300 bg-white" disabled={isLoading}>
                <EyeIcon />
              </IconButton> */}
              {/* <Button
                size="large"
                color="inherit"
                variant="outlined"
                className="border-gray-300"
                disabled={isLoading}
                onClick={triggerBeforeSubmitForm(handleSubmit(submitForm), "draft")}
              >
                Lưu nháp
              </Button> */}
              <Button
                onClick={checkAllFieldsValueTabBeforeSubmit(handleSubmit(submitForm), "publish")}
                disabled={isLoading}
                loading={isLoading}
              >
                {action === "create" ? "Đăng tải" : "Cập nhật"}
              </Button>
            </div>
          }
        />
      </FormProvider>
    );
  },
);
export default ClassRoomFormContainer;

export const useClassRoomFormContext = useFormContext<ClassRoom>;
