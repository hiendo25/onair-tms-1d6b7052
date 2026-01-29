import type { QuestionOption } from "@/types/dto/assignments";

const TRUE_LABELS = new Set(["đúng", "true"]);
const FALSE_LABELS = new Set(["sai", "false"]);

const normalizeLabel = (label?: string) => label?.trim().toLowerCase() ?? "";

const resolveTrueFalseCorrectAnswer = (options?: QuestionOption[] | null): boolean => {
  if (!options || options.length === 0) {
    return false;
  }

  const correctOption = options.find((option) => option.correct);
  if (!correctOption) {
    return false;
  }

  const normalizedLabel = normalizeLabel(correctOption.label);
  if (TRUE_LABELS.has(normalizedLabel)) {
    return true;
  }
  if (FALSE_LABELS.has(normalizedLabel)) {
    return false;
  }

  if (options.length === 2) {
    return options?.[0]?.id === correctOption.id;
  }

  return false;
};

export { resolveTrueFalseCorrectAnswer };
