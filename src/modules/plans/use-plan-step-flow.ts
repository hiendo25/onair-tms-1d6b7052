"use client";

import { useCallback, useState } from "react";
import { UseFormTrigger } from "react-hook-form";
import {
  canAccessPlanStep,
  getNextPlanStepId,
  getPlanInitialCompletedSteps,
  getPrevPlanStepId,
  PlanStepId,
  validatePlanStep,
  PLAN_STEPS,
} from "./plan-step.utils";
import { PlanFormSchema } from "./plan-form.schema";

interface UsePlanStepFlowProps {
  mode: "create" | "edit";
  initialData?: PlanFormSchema;
  trigger: UseFormTrigger<PlanFormSchema>;
}

export const usePlanStepFlow = ({
  mode,
  initialData,
  trigger,
}: UsePlanStepFlowProps) => {
  const [currentStep, setCurrentStep] = useState<PlanStepId>(PLAN_STEPS?.[0]?.id as PlanStepId);
  const [completedSteps, setCompletedSteps] = useState<PlanStepId[]>(() =>
    getPlanInitialCompletedSteps(mode, initialData),
  );

  const updateCompletion = useCallback(
    async (stepId: PlanStepId) => {
      const isValid = await validatePlanStep(stepId, trigger);
      setCompletedSteps((prev) => {
        const hasStep = prev.includes(stepId);
        if (isValid && !hasStep) return [...prev, stepId];
        if (!isValid && hasStep) return prev.filter((id) => id !== stepId);
        return prev;
      });
      return isValid;
    },
    [trigger],
  );

  const goNext = useCallback(async () => {
    const isCurrentValid = await updateCompletion(currentStep);
    if (!isCurrentValid) return false;

    const next = getNextPlanStepId(currentStep);
    if (next) setCurrentStep(next);
    return true;
  }, [currentStep, updateCompletion]);

  const goBack = useCallback(() => {
    const previousStep = getPrevPlanStepId(currentStep);
    if (previousStep) setCurrentStep(previousStep);
  }, [currentStep]);

  const goToStep = useCallback(
    async (stepId: PlanStepId) => {
      if (!canAccessPlanStep(stepId, completedSteps)) return false;

      if (stepId !== currentStep) {
        await updateCompletion(currentStep);
      }

      setCurrentStep(stepId);

      if (completedSteps.includes(stepId)) {
        await updateCompletion(stepId);
      }

      return true;
    },
    [completedSteps, currentStep, updateCompletion],
  );

  const isStepAccessible = useCallback(
    (stepId: PlanStepId) => canAccessPlanStep(stepId, completedSteps),
    [completedSteps],
  );

  return {
    currentStep,
    completedSteps,
    goNext,
    goBack,
    goToStep,
    isStepAccessible,
  };
};

