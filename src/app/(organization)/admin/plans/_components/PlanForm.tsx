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
import StepTopics from "./StepTopics";
import StepApproval from "./StepApproval";
import StepAssignCourses from "./StepAssignCourses";

interface PlanFormProps {
  onSubmit: (data: PlanFormSchema) => void;
  isLoading?: boolean;
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

export default function PlanForm({ onSubmit, isLoading = false }: PlanFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const defaultValues: PlanFormSchema = {
    name: "",
    objective: "",
    startDate: "",
    endDate: "",
    budget: undefined,
  };

  const { control, handleSubmit, formState: { errors }, trigger } = useForm<PlanFormSchema>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const handleContinue = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = async (stepId: number) => {
    const accessible = isStepAccessible(stepId);
    if (!accessible) return;

    if (stepId !== currentStep) {
      const isValid = await trigger();
      if (!isValid && completedSteps.includes(currentStep)) {
        setCompletedSteps(completedSteps.filter(s => s !== currentStep));
      } else if (isValid && !completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }

    setCurrentStep(stepId);

    if (completedSteps.includes(stepId)) {
      const isStepValid = await trigger();
      if (!isStepValid) {
        setCompletedSteps(completedSteps.filter(s => s !== stepId));
      }
    }
  };

  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true;
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
        return <StepTrainingProgram control={control} errors={errors} />;
      case 3:
        return <StepTopics control={control} errors={errors} />;
      case 4:
        return <StepApproval control={control} errors={errors} />;
      case 5:
        return <StepAssignCourses control={control} errors={errors} />;
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

