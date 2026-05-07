export type LearningPathStepId = 1 | 2 | 3;

export interface LearningPathStepConfig {
  id: LearningPathStepId;
  label: string;
  description: string;
}

export const LEARNING_PATH_STEPS: LearningPathStepConfig[] = [
  {
    id: 1,
    label: "Thông tin chung",
    description: "Tên, mô tả và thông tin cơ bản",
  },
  {
    id: 2,
    label: "Giai đoạn",
    description: "Các giai đoạn trong lộ trình học tập",
  },
  {
    id: 3,
    label: "Thiết lập",
    description: "Cài đặt và hoàn tất lộ trình",
  },
];

const LEARNING_PATH_STEP_ORDER: LearningPathStepId[] = LEARNING_PATH_STEPS.map((step) => step.id);

export const getPrevLearningPathStepId = (stepId: LearningPathStepId): LearningPathStepId | undefined => {
  const currentIndex = LEARNING_PATH_STEP_ORDER.indexOf(stepId);
  if (currentIndex <= 0) return undefined;

  return LEARNING_PATH_STEP_ORDER[currentIndex - 1];
};

export const getNextLearningPathStepId = (stepId: LearningPathStepId): LearningPathStepId | undefined => {
  const currentIndex = LEARNING_PATH_STEP_ORDER.indexOf(stepId);
  if (currentIndex === -1 || currentIndex === LEARNING_PATH_STEP_ORDER.length - 1) return undefined;

  return LEARNING_PATH_STEP_ORDER[currentIndex + 1];
};

export const canAccessLearningPathStep = (
  stepId: LearningPathStepId,
  completedSteps: LearningPathStepId[]
): boolean => {
  if (stepId === LEARNING_PATH_STEP_ORDER[0]) return true;

  const previousStep = getPrevLearningPathStepId(stepId);
  if (!previousStep) return true;

  return completedSteps.includes(previousStep);
};

export const getLearningPathInitialCompletedSteps = (
  mode: "create" | "edit"
): LearningPathStepId[] => {
  if (mode === "create") return [];
  
  // For edit mode, we'll implement this later when we have actual data
  return [];
};

