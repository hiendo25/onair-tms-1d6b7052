"use client";
import * as React from "react";
import TabAssignmentInformation from "./TabAssignmentInformation";
import TabAssignmentContent from "./TabAssignmentContent";
import TabAssignmentSettings from "./TabAssignmentSettings";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { assignmentSchema, Assignment } from "../assignment-form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, IconButton } from "@mui/material";
import AssignmentTabContainer from "./AssignmentTabContainer";
import { getKeyFieldByTab, getStatusTabAssignment } from "./utils";
import { ClipboardIcon, CloseIcon, InforCircleIcon, UsersIcon2 } from "@/shared/assets/icons";
import { useRouter } from "next/navigation";
import { PATHS } from "@/constants/path.contstants";

export const TAB_KEYS_ASSIGNMENT = {
  "assignTab-information": "assignTab-information",
  "assignTab-content": "assignTab-content",
  "assignTab-settings": "assignTab-settings",
} as const;

export interface AssignmentFormContainerRef {
  resetForm: () => void;
}

export interface AssignmentFormContainerProps {
  onSubmit?: (data: Assignment) => void;
  isLoading?: boolean;
  action?: "create" | "edit";
  value?: Partial<Assignment>;
}

export const initAssignmentFormData = (): Partial<Assignment> => {
  return {
    name: "",
    description: "",
    assignmentCategories: [],
    questions: [{ type: "file", label: "", score: 1 }],
    assignedEmployees: [],
  };
};

const AssignmentFormContainer = React.forwardRef<AssignmentFormContainerRef, AssignmentFormContainerProps>(
  ({ onSubmit, isLoading, action, value }, ref) => {
    const router = useRouter();
    const formSubmitStateRef = React.useRef<boolean>(false);

    const methods = useForm<Assignment>({
      resolver: zodResolver(assignmentSchema),
      defaultValues: value ?? initAssignmentFormData(),
    });

    const {
      handleSubmit,
      formState: { errors },
      trigger,
      reset,
    } = methods;

    React.useImperativeHandle(ref, () => ({
      resetForm: () => {
        reset();
      },
    }));

    const handleTriggerFieldsByTab = async (tabKey: keyof typeof TAB_KEYS_ASSIGNMENT) => {
      const keyListByTab = getKeyFieldByTab(tabKey);
      const isValid = await trigger(keyListByTab);
      return isValid;
    };

    const submitForm: SubmitHandler<Assignment> = (data) => {
      console.log({ errors, data });
      onSubmit?.(data);
    };

    const cancelCreateAssignment = () => {
      formSubmitStateRef.current = false;
      reset();
      router.push(PATHS.ASSIGNMENTS.ROOT);
    };

    const handleClickSubmit = () => {
      formSubmitStateRef.current = true;
      handleSubmit(submitForm)();
    };

    return (
      <FormProvider {...methods}>
        <AssignmentTabContainer
          checkStatusTab={handleTriggerFieldsByTab}
          items={[
            {
              tabName: "Thông tin chung",
              tabKey: TAB_KEYS_ASSIGNMENT["assignTab-information"],
              icon: <InforCircleIcon />,
              content: <TabAssignmentInformation />,
              status: formSubmitStateRef.current
                ? getStatusTabAssignment(errors, TAB_KEYS_ASSIGNMENT["assignTab-information"])
                : "idle",
            },
            {
              tabName: "Nội dung",
              tabKey: TAB_KEYS_ASSIGNMENT["assignTab-content"],
              icon: <ClipboardIcon />,
              content: <TabAssignmentContent />,
              status: formSubmitStateRef.current
                ? getStatusTabAssignment(errors, TAB_KEYS_ASSIGNMENT["assignTab-content"])
                : "idle",
            },
            {
              tabName: "Thiết lập",
              tabKey: TAB_KEYS_ASSIGNMENT["assignTab-settings"],
              icon: <UsersIcon2 />,
              content: <TabAssignmentSettings />,
              status: formSubmitStateRef.current
                ? getStatusTabAssignment(errors, TAB_KEYS_ASSIGNMENT["assignTab-settings"])
                : "idle",
            },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <IconButton
                className="border rounded-lg border-gray-400 bg-white"
                onClick={cancelCreateAssignment}
                disabled={isLoading}
              >
                <CloseIcon />
              </IconButton>
              <Button
                size="large"
                onClick={handleClickSubmit}
                disabled={isLoading}
                loading={isLoading}
              >
                {action === "edit" ? "Cập nhật" : "Tạo bài kiểm tra"}
              </Button>
            </div>
          }
        />
      </FormProvider>
    );
  },
);

AssignmentFormContainer.displayName = "AssignmentFormContainer";

export default AssignmentFormContainer;

