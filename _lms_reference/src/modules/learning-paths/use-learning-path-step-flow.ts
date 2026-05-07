"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  canAccessLearningPathStep,
  getLearningPathInitialCompletedSteps,
  getNextLearningPathStepId,
  getPrevLearningPathStepId,
  LEARNING_PATH_STEPS,
  LearningPathStepId,
} from "./learning-path-step.utils";

interface UseLearningPathStepFlowProps {
  mode: "create" | "edit";
  initialStep?: LearningPathStepId;
}

export const useLearningPathStepFlow = ({
  mode,
  initialStep,
}: UseLearningPathStepFlowProps) => {
  const initialCompletedSteps = useMemo(
    () => getLearningPathInitialCompletedSteps(mode),
    [mode]
  );

  const initialStepId = useMemo(() => {
    const defaultStep = LEARNING_PATH_STEPS?.[0]?.id as LearningPathStepId;
    if (!initialStep) return defaultStep;

    return canAccessLearningPathStep(initialStep, initialCompletedSteps)
      ? initialStep
      : defaultStep;
  }, [initialCompletedSteps, initialStep]);

  const [currentStep, setCurrentStep] = useState<LearningPathStepId>(initialStepId);
  const [completedSteps, setCompletedSteps] = useState<LearningPathStepId[]>(initialCompletedSteps);

  // Keep state in sync if initial derived values change
  useEffect(() => {
    setCompletedSteps(initialCompletedSteps);
  }, [initialCompletedSteps]);

  useEffect(() => {
    setCurrentStep((prev) => (prev === initialStepId ? prev : initialStepId));
  }, [initialStepId]);

  const markStepComplete = useCallback(
    (stepId: LearningPathStepId) => {
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId]);
      }
    },
    [completedSteps]
  );

  const goNext = useCallback(() => {
    // Mark current step as complete
    markStepComplete(currentStep);

    const next = getNextLearningPathStepId(currentStep);
    if (!next) return false;

    setCurrentStep(next);
    return true;
  }, [currentStep, markStepComplete]);

  const goBack = useCallback(() => {
    const previousStep = getPrevLearningPathStepId(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (stepId: LearningPathStepId) => {
      if (!canAccessLearningPathStep(stepId, completedSteps)) return false;

      setCurrentStep(stepId);
      return true;
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (stepId: LearningPathStepId) => {
      return canAccessLearningPathStep(stepId, completedSteps);
    },
    [completedSteps]
  );

  return {
    currentStep,
    completedSteps,
    goNext,
    goBack,
    goToStep,
    isStepAccessible,
    markStepComplete,
  };
};

