import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  QuestionDifficulty,
  QuestionType,
} from "@/modules/assignment-management/constants/question.constants";
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

const getCategoryNames = (question: QuestionBankDto) => {
  return (
    question.question_bank_categories
      ?.map((item) => item.categories?.name)
      .filter((name): name is string => Boolean(name)) || []
  );
};

export { getCategoryNames, getDifficultyLabel, getQuestionTypeBadgeLabel };
