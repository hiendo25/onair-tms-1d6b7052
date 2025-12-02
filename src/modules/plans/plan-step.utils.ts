import { FieldPath, UseFormTrigger } from "react-hook-form";

import { PlanFormSchema } from "./plan-form.schema";

export type PlanStepId = 1 | 2 | 3 | 4 | 5;

export interface PlanStepConfig {
  id: PlanStepId;
  label: string;
  description: string;
  validateKeys: FieldPath<PlanFormSchema>[];
}

export const PLAN_STEPS: PlanStepConfig[] = [
  {
    id: 1,
    label: "Thông tin kế hoạch",
    description: "Mục tiêu, thời gian và ngân sách",
    validateKeys: ["info"],
  },
  {
    id: 2,
    label: "Chương trình đào tạo",
    description: "Chương trình đào tạo của bạn",
    validateKeys: ["programs"],
  },
  {
    id: 3,
    label: "Chủ đề",
    description: "Chương trình đào tạo của bạn",
    validateKeys: [],
  },
  {
    id: 4,
    label: "Gửi duyệt đề xuất",
    description: "Gửi duyệt lên cấp phê duyệt",
    validateKeys: [],
  },
  {
    id: 5,
    label: "Gán môn học",
    description: "Gán môn học vào kế hoạch được duyệt",
    validateKeys: [],
  },
];

const PLAN_STEP_ORDER: PlanStepId[] = PLAN_STEPS.map((step) => step.id);
const PLAN_STEP_MAP = PLAN_STEPS.reduce<Record<PlanStepId, PlanStepConfig>>((result, step) => {
  result[step.id] = step;
  return result;
}, {} as Record<PlanStepId, PlanStepConfig>);

export const getPlanStepValidationKeys = (stepId: PlanStepId) => PLAN_STEP_MAP[stepId]?.validateKeys ?? [];

export const validatePlanStep = async (
  stepId: PlanStepId,
  trigger: UseFormTrigger<PlanFormSchema>,
) => {
  const fields = getPlanStepValidationKeys(stepId);
  if (!fields.length) return true;

  return trigger(fields);
};

export const getPlanInitialCompletedSteps = (
  mode: "create" | "edit",
  data?: PlanFormSchema,
): PlanStepId[] => {
  if (!data || mode === "create") return [];

  const completedSteps: PlanStepId[] = [];

  if (data.info?.name) {
    completedSteps.push(1);
  }

  if (data.programs && data.programs.length > 0) {
    completedSteps.push(2);
  }

  if (completedSteps.includes(2)) {
    completedSteps.push(3);
  }

  if (completedSteps.includes(3)) {
    completedSteps.push(4, 5);
  }

  return completedSteps;
};

export const getPrevPlanStepId = (stepId: PlanStepId) => {
  const currentIndex = PLAN_STEP_ORDER.indexOf(stepId);
  if (currentIndex <= 0) return undefined;

  return PLAN_STEP_ORDER[currentIndex - 1];
};

export const getNextPlanStepId = (stepId: PlanStepId) => {
  const currentIndex = PLAN_STEP_ORDER.indexOf(stepId);
  if (currentIndex === -1 || currentIndex === PLAN_STEP_ORDER.length - 1) return undefined;

  return PLAN_STEP_ORDER[currentIndex + 1];
};

export const canAccessPlanStep = (stepId: PlanStepId, completedSteps: PlanStepId[]) => {
  if (stepId === PLAN_STEP_ORDER[0]) return true;

  const previousStep = getPrevPlanStepId(stepId);
  if (!previousStep) return true;

  return completedSteps.includes(previousStep);
};
