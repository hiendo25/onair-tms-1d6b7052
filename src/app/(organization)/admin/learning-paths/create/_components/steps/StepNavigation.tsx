"use client";

import { LearningPathStepId } from "@/modules/learning-paths/learning-path-step.utils";
import SharedStepNavigation, { StepConfig } from "@/shared/ui/StepNavigation";

export interface Step {
  id: LearningPathStepId;
  label: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: LearningPathStepId;
  completedSteps: LearningPathStepId[];
  onStepClick: (stepId: LearningPathStepId) => void;
  isStepAccessible: (stepId: LearningPathStepId) => boolean;
}

export default function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  isStepAccessible,
}: StepNavigationProps) {
  return (
    <SharedStepNavigation<LearningPathStepId>
      steps={steps as StepConfig<LearningPathStepId>[]}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={onStepClick}
      isStepAccessible={isStepAccessible}
      title="Hành trình lộ trình"
    />
  );
}

