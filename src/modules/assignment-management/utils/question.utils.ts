import type { Question } from "@/modules/assignment-management/components/assignment-form.schema";

export const createDefaultQuestion = (): Question => {
  return {
    type: "file",
    label: "",
    score: 1,
  };
};
