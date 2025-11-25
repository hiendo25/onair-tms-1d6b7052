"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { planSchema, PlanFormSchema } from "@/modules/plans/plan-form.schema";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import StepNavigation, { Step } from "./StepNavigation";
import StepPlanInfo from "./StepPlanInfo";
import StepTrainingProgram from "./StepTrainingProgram";
import StepTrainingTopics from "./StepTrainingTopics";
import StepApproval from "./StepApproval";
import StepAssignCourses from "./StepAssignCourses";

interface PlanFormProps {
  onSubmit: (data: PlanFormSchema) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: PlanFormSchema;
}

const STEPS: Step[] = [
  {
    id: 1,
    label: "Thông tin kế hoạch",
    description: "Mục tiêu, thời gian và ngân sách",
  },
  {
    id: 2,
    label: "Chương trình đào tạo",
    description: "Chương trình đào tạo của bạn",
  },
  {
    id: 3,
    label: "Chủ đề",
    description: "Chương trình đào tạo của bạn",
  },
  {
    id: 4,
    label: "Gửi duyệt đề xuất",
    description: "Gửi duyệt lên cấp phê duyệt",
  },
  {
    id: 5,
    label: "Gán môn học",
    description: "Gán môn học vào kế hoạch được duyệt",
  },
];

export default function PlanForm({
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: PlanFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Helper function to determine which steps should be marked as completed based on initialData
  const getInitialCompletedSteps = (): number[] => {
    if (!initialData || mode === "create") return [];

    const completed: number[] = [];

    // Step 1: Check if plan info is filled
    if (initialData.info?.name && initialData.info?.objective) {
      completed.push(1);
    }

    // Step 2: Check if programs exist
    if (initialData.programs && initialData.programs.length > 0) {
      completed.push(2);
    }

    // Step 3: Check if all programs have topics
    if (initialData.programs && initialData.programs.length > 0) {
      const allProgramsHaveTopics = initialData.programs.every(
        program => program.topics && program.topics.length > 0
      );
      if (allProgramsHaveTopics) {
        completed.push(3);
      }
    }

    // Step 4: In edit mode, if we have data for steps 1-3, mark step 4 as completed too
    if (completed.includes(1) && completed.includes(2) && completed.includes(3)) {
      completed.push(4);
    }

    return completed;
  };

  const [completedSteps, setCompletedSteps] = useState<number[]>(getInitialCompletedSteps());

  const defaultValues: PlanFormSchema = initialData || {
    info: {
      name: "",
      objective: "",
      startDate: undefined,
      endDate: undefined,
      budget: undefined,
    },
    programs: [],
  };

  const { control, handleSubmit, formState: { errors }, trigger, getValues, setError, clearErrors } = useForm<PlanFormSchema>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const getStepFieldName = (stepId: number): "info" | "programs" | undefined => {
    switch (stepId) {
      case 1:
        return "info";
      case 2:
      case 3:
        return "programs";
      default:
        return undefined;
    }
  };

  const handleContinue = async () => {
    // Step 3: Custom validation to ensure all programs have at least 1 topic
    if (currentStep === 3) {
      const programs = getValues("programs");
      let hasError = false;

      // Clear previous errors
      programs.forEach((_, index) => {
        clearErrors(`programs.${index}.topics`);
      });

      // Check each program for topics
      programs.forEach((program, index) => {
        if (!program.topics || program.topics.length === 0) {
          setError(`programs.${index}.topics`, {
            type: "manual",
            message: "Mỗi chương trình cần có ít nhất 1 chủ đề.",
          });
          hasError = true;
        }
      });

      if (hasError) {
        return; // Don't proceed if validation fails
      }
    }

    // Standard validation for other steps
    const fieldName = getStepFieldName(currentStep);
    const isValid = fieldName ? await trigger(fieldName) : true;
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = async (stepId: number) => {
    const accessible = isStepAccessible(stepId);
    if (!accessible) return;

    if (stepId !== currentStep) {
      const currentFieldName = getStepFieldName(currentStep);
      const isValid = currentFieldName ? await trigger(currentFieldName) : true;
      if (!isValid && completedSteps.includes(currentStep)) {
        setCompletedSteps(completedSteps.filter(s => s !== currentStep));
      } else if (isValid && !completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }

    setCurrentStep(stepId);

    if (completedSteps.includes(stepId)) {
      const stepFieldName = getStepFieldName(stepId);
      const isStepValid = stepFieldName ? await trigger(stepFieldName) : true;
      if (!isStepValid) {
        setCompletedSteps(completedSteps.filter(s => s !== stepId));
      }
    }
  };

  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true;
    // Step 5 (Gán môn học) is now accessible in both create and edit mode
    return completedSteps.includes(stepId - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPlanInfo
            control={control}
            errors={errors}
            onContinue={handleContinue}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <StepTrainingProgram
            control={control}
            errors={errors}
            onContinue={handleContinue}
          />
        );
      case 3:
        return (
          <StepTrainingTopics
            control={control}
            errors={errors}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepApproval
            control={control}
            errors={errors}
            onBack={handleBack}
            onSubmit={handleSubmit(onSubmit)}
            onContinue={() => {
              // Mark Step 4 as completed before navigating to Step 5
              if (!completedSteps.includes(4)) {
                setCompletedSteps([...completedSteps, 4]);
              }
              setCurrentStep(5);
            }}
            isLoading={isLoading}
            mode={mode}
          />
        );
      case 5:
        return (
          <StepAssignCourses
            control={control}
            errors={errors}
            onBack={handleBack}
            onSave={handleSubmit(onSubmit)}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ display: "flex", gap: 3 }}>
        <StepNavigation
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          isStepAccessible={isStepAccessible}
        />

        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}
          </form>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

