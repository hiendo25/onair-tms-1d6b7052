import { isMatchingOptions, isOrderOptions } from "@/modules/assignment-management/utils/question-bank.utils";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";

const sanitizeQuestionOptions = (question: AssignmentQuestionDto): AssignmentQuestionDto["options"] => {
  const options = question.options;
  if (!options) {
    return options;
  }

  if (Array.isArray(options)) {
    return options.map(({ correct, ...rest }) => rest);
  }

  if (isMatchingOptions(options)) {
    return {
      ...options,
      correctMappings: [],
    };
  }

  if (isOrderOptions(options)) {
    const sanitizedItems = (options.orderItems || []).map(({ correctOrder, ...rest }) => rest);
    return {
      ...options,
      orderItems: sanitizedItems,
    };
  }

  return options;
};

const sanitizeAssignmentQuestionsForSubmit = (questions: AssignmentQuestionDto[]) => {
  return questions.map((question) => ({
    ...question,
    options: sanitizeQuestionOptions(question),
  }));
};

export { sanitizeAssignmentQuestionsForSubmit };
