import type { AssignmentBankDto } from "@/types/dto/assignment-bank";
import type { QuestionBankDto } from "@/types/dto/question-bank";

const getAssignmentBankQuestionScore = (
  question: NonNullable<AssignmentBankDto["assignment_questions"]>[number],
) => {
  if (typeof question.score_override === "number") {
    return question.score_override;
  }

  return question.question_bank?.score ?? 0;
};

const calculateAssignmentBankTotals = (assignment: AssignmentBankDto) => {
  const questions = assignment.assignment_questions ?? [];
  const totalScore = questions.reduce((sum, question) => sum + getAssignmentBankQuestionScore(question), 0);

  return {
    totalQuestions: questions.length,
    totalScore,
  };
};

const calculateQuestionBankTotals = (questions: QuestionBankDto[]) => {
  const totalScore = questions.reduce((sum, question) => sum + (question.score ?? 0), 0);

  return {
    totalQuestions: questions.length,
    totalScore,
  };
};

const getCategoryIdsFromQuestions = (questions: QuestionBankDto[]) => {
  const categoryIds = new Set<string>();

  questions.forEach((question) => {
    question.question_bank_categories?.forEach((category) => {
      if (category.category_id) {
        categoryIds.add(category.category_id);
      }
    });
  });

  return Array.from(categoryIds);
};

export {
  calculateAssignmentBankTotals,
  calculateQuestionBankTotals,
  getAssignmentBankQuestionScore,
  getCategoryIdsFromQuestions,
};
