"use client";

import { PlanStepId } from "@/modules/plans/plan-step.utils";
import SharedStepNavigation, { StepConfig } from "@/shared/ui/StepNavigation";

export interface Step {
  id: PlanStepId;
  label: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: PlanStepId;
  completedSteps: PlanStepId[];
  onStepClick: (stepId: PlanStepId) => void;
  isStepAccessible: (stepId: PlanStepId) => boolean;
}

export default function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  isStepAccessible,
}: StepNavigationProps) {
  return (
    <SharedStepNavigation<PlanStepId>
      steps={steps as StepConfig<PlanStepId>[]}
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={onStepClick}
      isStepAccessible={isStepAccessible}
      title="Hành trình kế hoạch"
    />
  );
}
