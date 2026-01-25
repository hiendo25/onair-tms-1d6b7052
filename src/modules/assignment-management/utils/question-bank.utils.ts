import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QuestionDifficulty,
  QuestionType,
} from "@/modules/assignment-management/constants/question.constants";
import type { MatchingQuestionData, OrderItem } from "@/types/dto/assignments/create-assignment.dto";
import type { QuestionOption } from "@/types/dto/assignments/question-option.dto";
import type { QuestionBankDto } from "@/types/dto/question-bank";

const MULTIPLE_CHOICE_TYPES: QuestionType[] = ["checkbox", "radio"];

const getQuestionTypeBadgeLabel = (type: QuestionType) => {
  if (MULTIPLE_CHOICE_TYPES.includes(type)) {
    return "Trắc nghiệm";
  }

  return QUESTION_TYPE_LABELS[type] || type;
};

const getDifficultyLabel = (difficulty?: QuestionDifficulty | null) => {
  if (!difficulty) {
    return "";
  }

  return QUESTION_DIFFICULTY_LABELS[difficulty] || difficulty;
};

type QuestionCategorySource = Pick<QuestionBankDto, "question_bank_categories">;

type QuestionOptionListItem = {
  id: string;
  label: string;
  isCorrect?: boolean;
  prefix?: string;
};

const isOptionArray = (value: unknown): value is QuestionOption[] => Array.isArray(value);

const isMatchingOptions = (value: unknown): value is MatchingQuestionData => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "columnAItems" in value && "columnBItems" in value && "correctMappings" in value;
};

const isOrderOptions = (value: unknown): value is { orderItems: OrderItem[] } => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "orderItems" in value;
};

const buildQuestionOptionList = (options: QuestionBankDto["options"] | null | undefined): QuestionOptionListItem[] => {
  if (!options) {
    return [];
  }

  if (isOptionArray(options)) {
    return options.map((option, index) => ({
      id: option.id || `${index}`,
      label: option.label,
      isCorrect: option.correct,
      prefix: String.fromCharCode(65 + index),
    }));
  }

  if (isMatchingOptions(options)) {
    const columnA = new Map(options.columnAItems.map((item) => [item.id, item.content]));
    const columnB = new Map(options.columnBItems.map((item) => [item.id, item.content]));

    return options.correctMappings.map((mapping, index) => ({
      id: `${mapping.columnAId}-${mapping.columnBId}-${index}`,
      label: `${columnA.get(mapping.columnAId) || ""} - ${columnB.get(mapping.columnBId) || ""}`.trim(),
      prefix: `${index + 1}`,
    }));
  }

  if (isOrderOptions(options)) {
    const sortedItems = [...options.orderItems].sort((a, b) => a.correctOrder - b.correctOrder);
    return sortedItems.map((item, index) => ({
      id: item.id || `${index}`,
      label: item.content,
      prefix: `${index + 1}`,
    }));
  }

  return [];
};

const getCategoryNames = (question: QuestionCategorySource) => {
  return (
    question.question_bank_categories
      ?.map((item) => item.categories?.name)
      .filter((name): name is string => Boolean(name)) || []
  );
};

export { buildQuestionOptionList, getCategoryNames, getDifficultyLabel, getQuestionTypeBadgeLabel };
export type { QuestionOptionListItem };
