import { LearningPathFormSchema } from "./learning-path-form.schema";

export const buildLearningPathFormDefaultValues = (
  initialData?: Partial<LearningPathFormSchema>
): LearningPathFormSchema => {
  return {
    info: {
      name: initialData?.info?.name || "",
      description: initialData?.info?.description || "",
      thumbnail: initialData?.info?.thumbnail || null,
      assignmentMode: initialData?.info?.assignmentMode || "auto",
      assignedEmployees: initialData?.info?.assignedEmployees || [],
    },
    phases: initialData?.phases || [],
    settings: initialData?.settings || {
      sequentialLearning: false,
      completionCriteria: 80,
      deadlineType: "none",
      allowRetake: false,
    },
  };
};

