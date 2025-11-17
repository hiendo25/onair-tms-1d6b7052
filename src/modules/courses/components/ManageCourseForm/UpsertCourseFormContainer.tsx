"use client";
import React, { useEffect, useRef, useImperativeHandle, useCallback, forwardRef, useLayoutEffect } from "react";
import { FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { upsertCourseSchema, UpsertCourseFormData } from "./upsert-course.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton } from "@mui/material";
import { BookOpenIcon, CloseIcon, EyeIcon, GlobeIcon, UsersPlusIcon } from "@/shared/assets/icons";
import { useUpsertCourseStore } from "../../store/upsert-course-context";
import UpsertCourseTabContainer, { UpsertCourseTabContainerRef } from "./UpsertCourseTabContainer";
import TabCourseInformation from "./TabCourseInformation";
import TabCourseSections, { initSectionFormData } from "./TabCourseSections";
import TabCourseSetting from "./TabCourseSetting";
import { useSnackbar } from "notistack";
import { getKeyFieldByTab } from "./utils";
import { UpsertCourseStore } from "../../store/upsert-course-store";

export const TAB_KEYS_MANAGE_COURSE = {
  "clsTab-information": "clsTab-information",
  "clsTab-section": "clsTab-section",
  "clsTab-setting": "clsTab-setting",
} as const;

export const TAB_NODES_MANAGE_COURSE = new Map([
  [
    TAB_KEYS_MANAGE_COURSE["clsTab-information"],
    {
      prev: null,
      next: TAB_KEYS_MANAGE_COURSE["clsTab-section"],
    },
  ],
  [
    TAB_KEYS_MANAGE_COURSE["clsTab-section"],
    {
      prev: TAB_KEYS_MANAGE_COURSE["clsTab-information"],
      next: TAB_KEYS_MANAGE_COURSE["clsTab-setting"],
    },
  ],
  [
    TAB_KEYS_MANAGE_COURSE["clsTab-setting"],
    {
      prev: TAB_KEYS_MANAGE_COURSE["clsTab-section"],
      next: null,
    },
  ],
]);

export interface UpsertCourseFormContainerRef {
  resetForm: () => void;
}
export interface UpsertCourseFormContainerProps {
  onSubmit?: (
    formData: UpsertCourseFormData,
    selectedStudents: UpsertCourseStore["state"]["selectedStudents"],
    selectedTeachers: UpsertCourseStore["state"]["selectedTeachers"],
  ) => void;
  onCancel?: () => void;
  value?: UpsertCourseFormData;
  isLoading?: boolean;
  action?: "create" | "edit";
}

export const initClassRoomFormData = (): Partial<UpsertCourseFormData> => {
  return {
    title: "",
    description: "",
    thumbnailUrl: "",
    categories: [],
    slug: "",
    status: "draft",
    benefits: [],
    docs: [],
    sections: [],
  };
};

const UpsertCourseFormContainer = forwardRef<UpsertCourseFormContainerRef, UpsertCourseFormContainerProps>(
  ({ onSubmit, isLoading, action, value: initFormValue, onCancel }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const classRoomTabContainerRef = useRef<UpsertCourseTabContainerRef>(null);
    const resetStore = useUpsertCourseStore(({ actions }) => actions.reset);
    const selectedStudents = useUpsertCourseStore(({ state }) => state.selectedStudents);
    const selectedTeachers = useUpsertCourseStore(({ state }) => state.selectedTeachers);

    const methods = useForm<UpsertCourseFormData>({
      resolver: zodResolver(upsertCourseSchema),
      defaultValues: initClassRoomFormData(),
      reValidateMode: "onChange",
      mode: "onChange",
    });

    const {
      getValues,
      setValue,
      handleSubmit,
      formState: { errors },
      trigger,
      reset,
    } = methods;

    console.log({ errors, value: getValues(), selectedStudents, selectedTeachers });

    const triggerBeforeSubmitForm = (submitAction: () => void, status: "draft" | "publish") => async () => {
      try {
        const TAB_LIST = [
          TAB_KEYS_MANAGE_COURSE["clsTab-information"],
          TAB_KEYS_MANAGE_COURSE["clsTab-section"],
          TAB_KEYS_MANAGE_COURSE["clsTab-setting"],
        ];
        const allTabsTriggers = await Promise.allSettled(
          TAB_LIST.map(async (tabKey) => {
            const isValid = await trigger(getKeyFieldByTab(tabKey));
            classRoomTabContainerRef.current?.setTabStatus(tabKey, isValid ? "valid" : "invalid");
            return isValid;
          }),
        );

        const isSomeTabFailed = allTabsTriggers.some((tab) => tab.status === "rejected" || !tab.value);

        if (isSomeTabFailed) return;

        if (!selectedTeachers.length) {
          classRoomTabContainerRef.current?.setTabStatus("clsTab-information", "invalid");
          enqueueSnackbar(`Chưa chọn giáo viên.`, { variant: "error" });
          return;
        }

        setValue("status", status);

        submitAction();
      } catch (error) {
        console.log(error);
      }
    };

    const submitForm: SubmitHandler<UpsertCourseFormData> = (data) => {
      console.log({ errors, data, selectedTeachers, selectedStudents });

      onSubmit?.(data, selectedStudents, selectedTeachers);
    };

    const cancelCreateClassRoom = () => {
      resetStore(); // Reset all selected value in classRoom store
      reset(); //Reset Form
      onCancel?.();
    };

    useImperativeHandle(ref, () => ({
      resetForm: () => {
        resetStore(); // Reset all selected value in classRoom store
        reset(); //Reset Form
      },
    }));

    /**
     * Init form value
     */
    useLayoutEffect(() => {
      if (!initFormValue) return;
      reset(initFormValue);
    }, [initFormValue]);

    return (
      <FormProvider {...methods}>
        <UpsertCourseTabContainer
          ref={classRoomTabContainerRef}
          trigger={trigger}
          items={[
            {
              tabName: "Thông môn học",
              tabKey: TAB_KEYS_MANAGE_COURSE["clsTab-information"],
              icon: <GlobeIcon className="w-5 h-5" />,
              content: <TabCourseInformation />,
            },
            {
              tabName: "Nội dung môn học",
              tabKey: TAB_KEYS_MANAGE_COURSE["clsTab-section"],
              icon: <BookOpenIcon className="w-5 h-5" />,
              content: <TabCourseSections />,
            },
            {
              tabName: "Thiết lập",
              tabKey: TAB_KEYS_MANAGE_COURSE["clsTab-setting"],
              icon: <UsersPlusIcon className="w-5 h-5" />,
              content: <TabCourseSetting />,
            },
          ]}
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
                size="large"
                onClick={triggerBeforeSubmitForm(handleSubmit(submitForm), "publish")}
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
export default UpsertCourseFormContainer;

export const useUpsertCourseFormContext = useFormContext<UpsertCourseFormData>;
