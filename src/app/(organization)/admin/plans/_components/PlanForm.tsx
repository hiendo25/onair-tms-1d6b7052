"use client";

import * as React from "react";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { planSchema, PlanFormSchema, PlanFormValues, Survey } from "@/modules/plans/plan-form.schema";
import {
  PLAN_STEPS,
  PlanStepId,
} from "@/modules/plans/plan-step.utils";
import { usePlanStepFlow } from "@/modules/plans/use-plan-step-flow";
import { buildPlanFormDefaultValues } from "@/modules/plans/plan-form.utils";
import { PlanStatus } from "@/model/plan.model";
import StepPlanInfo from "./Steps/StepPlanInfos";
import StepTrainingProgram from "./Steps/StepTrainingProgram";
import StepTrainingTopics from "./Steps/StepTrainingTopics";
import StepAssignCourses from "./Steps/StepAssignCourses";
import StepApproval from "./Steps/StepApproval";
import StepNavigation from "./Steps/StepNavigation";

interface PlanFormProps {
  onSubmit: (data: PlanFormSchema) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  initialData?: PlanFormSchema;
  planStatus?: PlanStatus;
  initialStep?: PlanStepId;
  onExecutePlan?: (data: PlanFormSchema) => void | Promise<void>;
  isExecuteLoading?: boolean;
}

export default function PlanForm({
  onSubmit,
  isLoading = false,
  mode = "create",
  initialData,
  planStatus = "pending",
  initialStep,
  onExecutePlan,
  isExecuteLoading = false,
}: PlanFormProps) {
  const defaultValues = useMemo(
    () => buildPlanFormDefaultValues(initialData),
    [initialData],
  );

  const methods = useForm<PlanFormValues, undefined, PlanFormSchema>({
    resolver: zodResolver(planSchema),
    defaultValues,
  });

  const survey = methods.watch("info.survey") as Survey | undefined;

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
    survey,
  });

  const handleFormSubmit = methods.handleSubmit(onSubmit);
  const handleExecutePlan = onExecutePlan ? methods.handleSubmit(onExecutePlan) : undefined;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPlanInfo
            onContinue={goNext}
            isLoading={isLoading}
            planStatus={planStatus}
            onExecutePlan={handleExecutePlan}
            isExecuting={isExecuteLoading}
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
          <StepAssignCourses
            onBack={goBack}
            onContinue={goNext}
            isLoading={isLoading}
          />
        );
      case 5:
        return (
          <StepApproval
            onBack={goBack}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            status={planStatus}
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
          <form onSubmit={handleFormSubmit}>
            {renderStepContent()}
          </form>
        </Box>
      </Box>
    </FormProvider>
  );
}
