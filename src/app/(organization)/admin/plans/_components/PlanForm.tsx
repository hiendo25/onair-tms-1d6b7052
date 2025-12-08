"use client";

import * as React from "react";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { planSchema, PlanFormSchema } from "@/modules/plans/plan-form.schema";
import StepPlanInfo from "./steps/StepPlanInfo";
import StepTrainingProgram from "./steps/StepTrainingProgram";
import StepApproval from "./steps/StepApproval";
import StepAssignCourses from "./steps/StepAssignCourses";
import StepNavigation from "./steps/StepNavigation";
import {
  PLAN_STEPS,
  PlanStepId,
} from "@/modules/plans/plan-step.utils";
import StepTrainingTopics from "./steps/StepTrainingTopics";
import { usePlanStepFlow } from "@/modules/plans/use-plan-step-flow";
import { buildPlanFormDefaultValues } from "@/modules/plans/plan-form.utils";
import { PlanStatus } from "@/model/plan.model";

interface PlanFormProps {
  onSubmit: (data: PlanFormSchema) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: PlanFormSchema;
  planStatus?: PlanStatus;
  initialStep?: PlanStepId;
}

export default function PlanForm({
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
  planStatus = "pending",
  initialStep,
}: PlanFormProps) {
  const defaultValues = useMemo(
    () => buildPlanFormDefaultValues(initialData),
    [initialData],
  );

  const methods = useForm<PlanFormSchema>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const {
    currentStep,
    completedSteps,
    goBack,
    goNext,
    goToStep,
    isStepAccessible,
  } = usePlanStepFlow({
    mode,
    initialData: defaultValues,
    trigger: methods.trigger,
    planStatus,
    initialStep,
  });

  const handleFormSubmit = methods.handleSubmit(onSubmit);
  const canAssignCourses = planStatus === "approved";

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPlanInfo
            onContinue={goNext}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <StepTrainingProgram
            onContinue={goNext}
          />
        );
      case 3:
        return (
          <StepTrainingTopics
            onContinue={goNext}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <StepApproval
            onBack={goBack}
            onContinue={canAssignCourses ? goNext : undefined}
            onSubmit={!canAssignCourses ? handleFormSubmit : undefined}
            isLoading={isLoading}
            status={planStatus}
          />
        );
      case 5:
        return (
          <StepAssignCourses
            onBack={goBack}
            onSave={handleFormSubmit}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        <StepNavigation
          steps={PLAN_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
          isStepAccessible={isStepAccessible}
        />

        <Box sx={{ flex: 1 }}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {renderStepContent()}
          </form>
        </Box>
      </Box>
    </FormProvider>
  );
}
