"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormTrigger } from "react-hook-form";

import { PlanStatus } from "@/model/plan.model";

import { PlanFormSchema, PlanFormValues, Survey } from "./plan-form.schema";
import {
  canAccessPlanStep,
  getNextPlanStepId,
  getPlanInitialCompletedSteps,
  getPrevPlanStepId,
  PLAN_STEPS,
  PlanStepId,
  validatePlanStep,
} from "./plan-step.utils";

interface UsePlanStepFlowProps {
  mode: "create" | "edit";
  initialData?: PlanFormSchema;
  trigger: UseFormTrigger<PlanFormValues>;
  planStatus?: PlanStatus;
  initialStep?: PlanStepId;
  survey?: Survey | undefined;
}

export const usePlanStepFlow = ({
  mode,
  initialData,
  trigger,
  planStatus,
  initialStep,
  survey,
}: UsePlanStepFlowProps) => {
  const surveyAccess = useMemo(() => getPlanSurveyAccess(planStatus, survey), [planStatus, survey]);
  const surveyLocked = surveyAccess.shouldLock;
  const initialCompletedSteps = useMemo(
    () => getPlanInitialCompletedSteps(mode, initialData, planStatus),
    [initialData, mode, planStatus],
  );

  const initialStepId = useMemo(() => {
    const defaultStep = PLAN_STEPS?.[0]?.id as PlanStepId;
    if (surveyLocked) return defaultStep;
    if (!initialStep) return defaultStep;

    return canAccessPlanStep(initialStep, initialCompletedSteps) ? initialStep : defaultStep;
  }, [initialCompletedSteps, initialStep, surveyLocked]);

  const [currentStep, setCurrentStep] = useState<PlanStepId>(initialStepId);
  const [completedSteps, setCompletedSteps] = useState<PlanStepId[]>(initialCompletedSteps);

  // Keep state in sync if initial derived values change
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
      const isLastStep = stepId === PLAN_STEPS[PLAN_STEPS.length - 1]?.id;
      const shouldMarkComplete = isValid && !isLastStep;

      let nextCompletedSteps = completedSteps;

      if (shouldMarkComplete && !hasStep) {
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
    if (surveyLocked) return false;

    const { isValid } = await updateCompletion(currentStep);
    if (!isValid) return false;

    const next = getNextPlanStepId(currentStep);
    if (!next) return true;

    setCurrentStep(next);
    return true;
  }, [currentStep, surveyLocked, updateCompletion]);

  const goBack = useCallback(() => {
    if (surveyLocked) return;
    const previousStep = getPrevPlanStepId(currentStep);
    if (previousStep) setCurrentStep(previousStep);
  }, [currentStep, surveyLocked]);

  const goToStep = useCallback(
    async (stepId: PlanStepId) => {
      if ((surveyLocked && stepId !== 1) || !canAccessPlanStep(stepId, completedSteps)) return false;

      if (stepId !== currentStep) {
        await updateCompletion(currentStep);
      }

      setCurrentStep(stepId);

      if (completedSteps.includes(stepId)) {
        await updateCompletion(stepId);
      }

      return true;
    },
    [completedSteps, currentStep, surveyLocked, updateCompletion],
  );

  const isStepAccessible = useCallback(
    (stepId: PlanStepId) => {
      if (surveyLocked && stepId !== 1) return false;
      return canAccessPlanStep(stepId, completedSteps);
    },
    [completedSteps, surveyLocked],
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
