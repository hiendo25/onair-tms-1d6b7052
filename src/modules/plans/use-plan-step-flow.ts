"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormTrigger } from "react-hook-form";
import {
  ASSIGN_COURSE_STEP_ID,
  canAccessPlanStep,
  getNextPlanStepId,
  getPlanInitialCompletedSteps,
  getPrevPlanStepId,
  PlanStepId,
  validatePlanStep,
  PLAN_STEPS,
} from "./plan-step.utils";
import { PlanFormSchema } from "./plan-form.schema";
import { PlanStatus } from "@/model/plan.model";

interface UsePlanStepFlowProps {
  mode: "create" | "edit";
  initialData?: PlanFormSchema;
  trigger: UseFormTrigger<PlanFormSchema>;
  planStatus?: PlanStatus;
  initialStep?: PlanStepId;
}

export const usePlanStepFlow = ({
  mode,
  initialData,
  trigger,
  planStatus,
  initialStep,
}: UsePlanStepFlowProps) => {
  const initialCompletedSteps = useMemo(
    () => getPlanInitialCompletedSteps(mode, initialData, planStatus),
    [initialData, mode, planStatus],
  );

  const initialStepId = useMemo(() => {
    const defaultStep = PLAN_STEPS?.[0]?.id as PlanStepId;
    if (!initialStep) return defaultStep;

    return canAccessPlanStep(initialStep, initialCompletedSteps, { planStatus })
      ? initialStep
      : defaultStep;
  }, [initialCompletedSteps, initialStep, planStatus]);

  const [currentStep, setCurrentStep] = useState<PlanStepId>(initialStepId);
  const [completedSteps, setCompletedSteps] = useState<PlanStepId[]>(initialCompletedSteps);

  // Keep state in sync if initial derived values change (e.g., query param or status update).
  useEffect(() => {
    setCompletedSteps(initialCompletedSteps);
  }, [initialCompletedSteps]);

  useEffect(() => {
    setCurrentStep((prev) => (prev === initialStepId ? prev : initialStepId));
  }, [initialStepId]);

  const updateCompletion = useCallback(
    async (stepId: PlanStepId) => {
      const isValid = await validatePlanStep(stepId, trigger);
      const hasStep = completedSteps.includes(stepId);
      let nextCompletedSteps = completedSteps;

      if (isValid && !hasStep) {
        nextCompletedSteps = [...completedSteps, stepId];
      } else if (!isValid && hasStep) {
        nextCompletedSteps = completedSteps.filter((id) => id !== stepId);
      }

      if (nextCompletedSteps !== completedSteps) {
        setCompletedSteps(nextCompletedSteps);
      }

      return { isValid, nextCompletedSteps };
    },
    [completedSteps, trigger],
  );

  const goNext = useCallback(async () => {
    const { isValid } = await updateCompletion(currentStep);
    if (!isValid) return false;

    const next = getNextPlanStepId(currentStep);
    if (!next) return true;

    // Only gate step 5 by approval status; prior steps are validated above.
    if (next === ASSIGN_COURSE_STEP_ID && planStatus !== "approved") return false;

    setCurrentStep(next);
    return true;
  }, [currentStep, planStatus, updateCompletion]);

  const goBack = useCallback(() => {
    const previousStep = getPrevPlanStepId(currentStep);
    if (previousStep) setCurrentStep(previousStep);
  }, [currentStep]);

  const goToStep = useCallback(
    async (stepId: PlanStepId) => {
      if (!canAccessPlanStep(stepId, completedSteps, { planStatus })) return false;

      if (stepId !== currentStep) {
        await updateCompletion(currentStep);
      }

      setCurrentStep(stepId);

      if (completedSteps.includes(stepId)) {
        await updateCompletion(stepId);
      }

      return true;
    },
    [completedSteps, currentStep, planStatus, updateCompletion],
  );

  const isStepAccessible = useCallback(
    (stepId: PlanStepId) => canAccessPlanStep(stepId, completedSteps, { planStatus }),
    [completedSteps, planStatus],
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
