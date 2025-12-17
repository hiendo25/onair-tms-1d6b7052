"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Stack } from "@mui/material";
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
import { LEARNING_PATH_STEPS } from "@/modules/learning-paths/learning-path-step.utils";
import { useLearningPathStepFlow } from "@/modules/learning-paths/use-learning-path-step-flow";
import { uploadFileToS3 } from "@/utils/s3-upload";

import StepGeneralInfo from "./steps/StepGeneralInfo";
import StepNavigation from "./steps/StepNavigation";
import StepPhases from "./steps/StepPhases";
import StepSettings from "./steps/StepSettings";

interface LearningPathFormProps {
  mode: "create" | "edit";
  learningPathId?: string;
  initialData?: Partial<LearningPathFormSchema>;
  onSubmit?: (data: LearningPathFormSchema) => void | Promise<void>;
  isLoading?: boolean;
}

export default function LearningPathForm({
  mode,
  initialData,
  onSubmit,
  isLoading: externalLoading = false,
}: LearningPathFormProps) {
  const router = useRouter();
  const notifications = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => buildLearningPathFormDefaultValues(initialData),
    [initialData]
  );

  const methods = useForm<LearningPathFormValues, undefined, LearningPathFormSchema>({
    resolver: zodResolver(learningPathSchema),
    defaultValues,
  });

  const { currentStep, completedSteps, goNext, goBack, goToStep, isStepAccessible } =
    useLearningPathStepFlow({
      mode,
    });

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

  const isLoading = isSubmitting || externalLoading;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepGeneralInfo onContinue={goNext} />;
      case 2:
        return <StepPhases onContinue={goNext} onBack={goBack} />;
      case 3:
        return <StepSettings onSubmit={handleFormSubmit} onBack={goBack} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
        {/* Step Navigation */}
        <StepNavigation
          steps={LEARNING_PATH_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
          isStepAccessible={isStepAccessible}
        />

        {/* Step Content */}
        <Stack sx={{ flex: 1, minWidth: 0 }}>{renderStepContent()}</Stack>
      </Box>
    </FormProvider>
  );
}

