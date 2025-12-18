"use client";

import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import SettingsIcon from "@mui/icons-material/Settings";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import {
  LearningPathFormSchema,
  LearningPathFormValues,
  learningPathSchema,
} from "@/modules/learning-paths/learning-path-form.schema";
import { buildLearningPathFormDefaultValues } from "@/modules/learning-paths/learning-path-form.utils";
import { uploadFileToS3 } from "@/utils/s3-upload";

import LearningPathTabContainer from "./LearningPathTabContainer";
import StepGeneralInfo from "./steps/StepGeneralInfo";
import StepPhases from "./steps/StepPhases";
import StepSettings from "./steps/StepSettings";

interface LearningPathFormProps {
  mode: "create" | "edit";
  learningPathId?: string;
  initialData?: Partial<LearningPathFormSchema>;
  onSubmit?: (data: LearningPathFormSchema) => void | Promise<void>;
  isLoading?: boolean;
}

type TabKeyType = "tab-info" | "tab-phases" | "tab-settings";

const TAB_KEYS = {
  "tab-info": "tab-info" as const,
  "tab-phases": "tab-phases" as const,
  "tab-settings": "tab-settings" as const,
};

export default function LearningPathForm({
  mode,
  initialData,
  onSubmit,
  isLoading: externalLoading = false,
}: LearningPathFormProps) {
  const router = useRouter();
  const notifications = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formSubmitStateRef = useRef<boolean>(false);

  const defaultValues = useMemo(
    () => buildLearningPathFormDefaultValues(initialData),
    [initialData]
  );

  const methods = useForm<LearningPathFormValues, undefined, LearningPathFormSchema>({
    resolver: zodResolver(learningPathSchema),
    defaultValues,
  });

  const {
    trigger,
    formState: { errors },
  } = methods;

  const handleTriggerFieldsByTab = async (tabKey: TabKeyType) => {
    let fieldsToValidate: any[] = [];

    switch (tabKey) {
      case TAB_KEYS["tab-info"]:
        fieldsToValidate = ["info"];
        break;
      case TAB_KEYS["tab-phases"]:
        fieldsToValidate = ["phases"];
        break;
      case TAB_KEYS["tab-settings"]:
        fieldsToValidate = ["settings"];
        break;
    }

    const isValid = await trigger(fieldsToValidate as any);
    return isValid;
  };

  const getStatusTab = (tabKey: TabKeyType): "idle" | "valid" | "invalid" => {
    if (!formSubmitStateRef.current) return "idle";

    switch (tabKey) {
      case TAB_KEYS["tab-info"]:
        return errors.info ? "invalid" : "valid";
      case TAB_KEYS["tab-phases"]:
        return errors.phases ? "invalid" : "valid";
      case TAB_KEYS["tab-settings"]:
        return errors.settings ? "invalid" : "valid";
      default:
        return "idle";
    }
  };

  const handleFormSubmit = methods.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      // Upload thumbnail to S3 if it's a File object
      let thumbnailUrl: string | null = null;
      if (data.info.thumbnail) {
        if (data.info.thumbnail instanceof File) {
          notifications.show("Đang tải ảnh lên...", { severity: "info" });
          const uploadResult = await uploadFileToS3(data.info.thumbnail);
          thumbnailUrl = uploadResult.url;
        } else if (typeof data.info.thumbnail === "string") {
          thumbnailUrl = data.info.thumbnail;
        }
      }

      // Prepare final data with uploaded thumbnail URL
      const finalData: LearningPathFormSchema = {
        ...data,
        info: {
          ...data.info,
          thumbnail: thumbnailUrl,
        },
      };

      if (onSubmit) {
        await onSubmit(finalData);
      } else {
        // Default submission behavior
        console.log("Form data:", finalData);
        notifications.show("Lộ trình học tập đã được tạo thành công!", {
          severity: "success",
        });
        router.push(PATHS.LEARNING_PATHS.ROOT);
      }
    } catch (error) {
      notifications.show(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo lộ trình học tập",
        {
          severity: "error",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleClickSubmit = () => {
    formSubmitStateRef.current = true;
    handleFormSubmit();
  };

  const handleCancel = () => {
    router.push(PATHS.LEARNING_PATHS.ROOT);
  };

  const isLoading = isSubmitting || externalLoading;

  return (
    <FormProvider {...methods}>
      <LearningPathTabContainer
        checkStatusTab={handleTriggerFieldsByTab}
        items={[
          {
            tabName: "Thông tin chung",
            tabKey: TAB_KEYS["tab-info"],
            icon: <InfoOutlinedIcon />,
            content: <StepGeneralInfo />,
            status: getStatusTab(TAB_KEYS["tab-info"]),
          },
          {
            tabName: "Giai đoạn",
            tabKey: TAB_KEYS["tab-phases"],
            icon: <LayersIcon />,
            content: <StepPhases />,
            status: getStatusTab(TAB_KEYS["tab-phases"]),
          },
          {
            tabName: "Cài đặt",
            tabKey: TAB_KEYS["tab-settings"],
            icon: <SettingsIcon />,
            content: <StepSettings onSubmit={handleFormSubmit} isLoading={isLoading} />,
            status: getStatusTab(TAB_KEYS["tab-settings"]),
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <IconButton
              className="border rounded-lg border-gray-400 bg-white"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <CloseIcon />
            </IconButton>
            <Button size="large" onClick={handleClickSubmit} disabled={isLoading}>
              {mode === "edit" ? "Cập nhật" : "Đăng tải"}
            </Button>
          </div>
        }
      />
    </FormProvider>
  );
}

