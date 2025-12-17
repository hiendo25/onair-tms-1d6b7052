import { LearningPathFormSchema } from "./learning-path-form.schema";

export const buildLearningPathFormDefaultValues = (
  initialData?: Partial<LearningPathFormSchema>
): LearningPathFormSchema => {
  return {
    info: {
      name: initialData?.info?.name || "",
      description: initialData?.info?.description || "",
      thumbnail: initialData?.info?.thumbnail || null,
    },
    phases: initialData?.phases || [],
    settings: initialData?.settings || {},
  };
};

