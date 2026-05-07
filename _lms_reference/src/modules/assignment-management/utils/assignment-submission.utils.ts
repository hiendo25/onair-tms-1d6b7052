import type { AssignmentQuestionDto } from "@/types/dto/assignments";

import type {
  AnswerValidationResult,
  QuestionAnswer,
} from "@/modules/assignment-management/types/assignment-submission.types";
import { isMatchingOptions, isOrderOptions } from "@/modules/assignment-management/utils/question-bank.utils";

const SEED_BASE = 31;
const LCG_MULTIPLIER = 1664525;
const LCG_INCREMENT = 1013904223;
const MAX_UINT32 = 2 ** 32;

const createSeedFromString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * SEED_BASE + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, LCG_MULTIPLIER) + LCG_INCREMENT) >>> 0;
    return state / MAX_UINT32;
  };
};

const shuffleArray = <T,>(items: T[], seed: number) => {
  if (items.length <= 1) {
    return items;
  }

  const result = [...items];
  const random = createRng(seed);

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const buildShuffleSeedBase = (assignmentId?: string, employeeId?: string, attemptKey?: number | string) => {
  if (!assignmentId) {
    return "";
  }
  if (!employeeId) {
    return attemptKey !== undefined ? `${assignmentId}:attempt:${attemptKey}` : assignmentId;
  }
  const base = `${assignmentId}:${employeeId}`;
  return attemptKey !== undefined ? `${base}:attempt:${attemptKey}` : base;
};

const buildDisplayQuestions = (
  questions: AssignmentQuestionDto[],
  options: { seedBase: string; shuffleQuestions: boolean; shuffleAnswers: boolean },
) => {
  if (!questions || questions.length === 0) {
    return [];
  }

  const { seedBase, shuffleQuestions, shuffleAnswers } = options;
  if (!seedBase) {
    return questions;
  }

  let nextQuestions = questions;
  if (shuffleQuestions) {
    const seed = createSeedFromString(`${seedBase}:questions`);
    nextQuestions = shuffleArray(nextQuestions, seed);
  }

  if (!shuffleAnswers) {
    return nextQuestions;
  }

  return nextQuestions.map((question) => {
    if (question.type === "radio" || question.type === "checkbox") {
      if (!Array.isArray(question.options) || question.options.length <= 1) {
        return question;
      }

      const seed = createSeedFromString(`${seedBase}:options:${question.id}`);
      return {
        ...question,
        options: shuffleArray(question.options, seed),
      };
    }

    if (question.type === "matching") {
      if (!isMatchingOptions(question.options)) {
        return question;
      }

      const seed = createSeedFromString(`${seedBase}:matching:${question.id}`);
      return {
        ...question,
        options: {
          ...question.options,
          columnBItems: shuffleArray(question.options.columnBItems, seed),
        },
      };
    }

    if (question.type === "order") {
      if (!isOrderOptions(question.options) || question.options.orderItems.length <= 1) {
        return question;
      }

      const seed = createSeedFromString(`${seedBase}:order:${question.id}`);
      const shuffledItems = shuffleArray(question.options.orderItems, seed).map((item, index) => ({
        ...item,
        displayOrder: index + 1,
      }));

      return {
        ...question,
        options: {
          ...question.options,
          orderItems: shuffledItems,
        },
      };
    }

    return question;
  });
};

const buildInitialAnswers = (questions: AssignmentQuestionDto[]): QuestionAnswer[] => {
  return questions.map((question) => {
    const baseAnswer: QuestionAnswer = {
      questionId: question.id,
      questionType: question.type,
    };

    const attachments = question.type !== "file" ? [] : undefined;

    switch (question.type) {
      case "file":
        return {
          ...baseAnswer,
          files: [],
          attachments,
        };
      case "text":
        return {
          ...baseAnswer,
          textAnswer: "",
          attachments,
        };
      case "radio":
        return {
          ...baseAnswer,
          radioAnswer: "",
          attachments,
        };
      case "checkbox":
        return {
          ...baseAnswer,
          checkboxAnswers: [],
          attachments,
        };
      case "matching":
        return {
          ...baseAnswer,
          matchingMappings: [],
          attachments,
        };
      case "order": {
        const orderItems = isOrderOptions(question.options) ? question.options.orderItems || [] : [];
        const sortedByDisplayOrder = [...orderItems].sort((a, b) => a.displayOrder - b.displayOrder);
        const orderedItems = sortedByDisplayOrder.map((item, index) => ({
          id: item.id,
          position: index + 1,
        }));

        return {
          ...baseAnswer,
          orderedItems,
          attachments,
        };
      }
      case "true_false":
        return {
          ...baseAnswer,
          trueFalseAnswer: undefined,
          attachments,
        };
      default:
        return {
          ...baseAnswer,
          attachments,
        };
    }
  });
};

const getAnswerErrorMessage = (questionType: QuestionAnswer["questionType"], label?: string) => {
  const questionLabel = label || "câu hỏi";
  switch (questionType) {
    case "file":
      return `Vui lòng tải lên file cho câu hỏi: ${questionLabel}`;
    case "text":
      return `Vui lòng nhập câu trả lời cho câu hỏi: ${questionLabel}`;
    case "radio":
      return `Vui lòng chọn đáp án cho câu hỏi: ${questionLabel}`;
    case "checkbox":
      return `Vui lòng chọn ít nhất một đáp án cho câu hỏi: ${questionLabel}`;
    case "matching":
      return `Vui lòng hoàn thành ghép đôi cho câu hỏi: ${questionLabel}`;
    case "order":
      return `Vui lòng sắp xếp các mục cho câu hỏi: ${questionLabel}`;
    case "true_false":
      return `Vui lòng chọn Đúng hoặc Sai cho câu hỏi: ${questionLabel}`;
    default:
      return `Loại câu hỏi không hợp lệ: ${questionType}`;
  }
};

const getMatchingExpectedCount = (question?: AssignmentQuestionDto) => {
  if (!question || !isMatchingOptions(question.options)) {
    return null;
  }

  return question.options.columnAItems?.length ?? null;
};

const getOrderExpectedCount = (question?: AssignmentQuestionDto) => {
  if (!question || !isOrderOptions(question.options)) {
    return null;
  }

  return question.options.orderItems?.length ?? null;
};

const getAnswerValidation = (question: AssignmentQuestionDto | undefined, answer: QuestionAnswer): AnswerValidationResult => {
  const label = question?.label;

  switch (answer.questionType) {
    case "file": {
      const hasFiles = Boolean(answer.files && answer.files.length > 0);
      return {
        isEmpty: !hasFiles,
        isComplete: hasFiles,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "text": {
      const hasText = Boolean(answer.textAnswer && answer.textAnswer.trim() !== "");
      return {
        isEmpty: !hasText,
        isComplete: hasText,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "radio": {
      const hasValue = Boolean(answer.radioAnswer && answer.radioAnswer.trim() !== "");
      return {
        isEmpty: !hasValue,
        isComplete: hasValue,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "checkbox": {
      const hasValues = Boolean(answer.checkboxAnswers && answer.checkboxAnswers.length > 0);
      return {
        isEmpty: !hasValues,
        isComplete: hasValues,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "matching": {
      const mappingCount = answer.matchingMappings?.length ?? 0;
      const expectedCount = getMatchingExpectedCount(question);
      const isComplete = expectedCount !== null ? mappingCount === expectedCount : mappingCount > 0;
      return {
        isEmpty: mappingCount === 0,
        isComplete,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "order": {
      const orderedCount = answer.orderedItems?.length ?? 0;
      const expectedCount = getOrderExpectedCount(question);
      const isComplete = expectedCount !== null ? orderedCount === expectedCount : orderedCount > 0;
      return {
        isEmpty: orderedCount === 0,
        isComplete,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    case "true_false": {
      const hasValue = answer.trueFalseAnswer !== undefined;
      return {
        isEmpty: !hasValue,
        isComplete: hasValue,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
    }
    default:
      return {
        isEmpty: true,
        isComplete: false,
        errorMessage: getAnswerErrorMessage(answer.questionType, label),
      };
  }
};

export {
  buildDisplayQuestions,
  buildInitialAnswers,
  buildShuffleSeedBase,
  createRng,
  createSeedFromString,
  getAnswerValidation,
  shuffleArray,
};
