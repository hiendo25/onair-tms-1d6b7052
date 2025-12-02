"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { planSchema, PlanFormSchema } from "@/modules/plans/plan-form.schema";
import StepPlanInfo from "./steps/StepPlanInfo";
import StepTrainingProgram from "./steps/StepTrainingProgram";
import StepApproval from "./steps/StepApproval";
import StepAssignCourses from "./steps/StepAssignCourses";
import StepNavigation from "./steps/StepNavigation";
import {
  canAccessPlanStep,
  getNextPlanStepId,
  getPlanInitialCompletedSteps,
  getPrevPlanStepId,
  PLAN_STEPS,
  PlanStepId,
  validatePlanStep,
} from "@/modules/plans/plan-step.utils";
import StepTrainingTopics from "./steps/StepTrainingTopics";

interface PlanFormProps {
  onSubmit: (data: PlanFormSchema) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: PlanFormSchema;
}

export default function PlanForm({
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
}: PlanFormProps) {
  const [currentStep, setCurrentStep] = useState<PlanStepId>(PLAN_STEPS[0]?.id as PlanStepId);
  const [completedSteps, setCompletedSteps] = useState<PlanStepId[]>(
    getPlanInitialCompletedSteps(mode, initialData),
  );

  const defaultValues: PlanFormSchema = initialData || {
    info: {
      name: "",
      objective: "",
      startDate: null,
      endDate: null,
      budget: undefined,
    },
    programs: [],
  };

  const methods = useForm<PlanFormSchema>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = methods;

  const triggerStepValidation = React.useCallback(
    (stepId: PlanStepId) => validatePlanStep(stepId, trigger),
    [trigger],
  );

  const handleContinue = async () => {
    const isValid = await triggerStepValidation(currentStep);
    if (!isValid) return;

    setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));

    const nextStep = getNextPlanStepId(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const previousStep = getPrevPlanStepId(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  const handleStepClick = async (stepId: PlanStepId) => {
    const accessible = canAccessPlanStep(stepId, completedSteps);
    if (!accessible) return;

    if (stepId !== currentStep) {
      const isValid = await triggerStepValidation(currentStep);
      setCompletedSteps((prev) => {
        const hasStep = prev.includes(currentStep);
        if (isValid && !hasStep) {
          return [...prev, currentStep];
        }
        if (!isValid && hasStep) {
          return prev.filter((s) => s !== currentStep);
        }
        return prev;
      });
    }

    setCurrentStep(stepId);

    if (mode === "edit" && stepId === 5 && !completedSteps.includes(5)) {
      setCompletedSteps((prev) => [...prev, 5]);
    }

    if (completedSteps.includes(stepId)) {
      const isStepValid = await triggerStepValidation(stepId);
      if (!isStepValid) {
        setCompletedSteps((prev) => prev.filter((s) => s !== stepId));
      }
    }
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
              setCompletedSteps((prev) => (prev.includes(4) ? prev : [...prev, 4]));
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
    <Box sx={{ display: "flex", gap: 3 }}>
      <StepNavigation
        steps={PLAN_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        isStepAccessible={(stepId) => canAccessPlanStep(stepId as PlanStepId, completedSteps)}
      />

      <Box sx={{ flex: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent()}
        </form>
      </Box>
    </Box>
  );
}
