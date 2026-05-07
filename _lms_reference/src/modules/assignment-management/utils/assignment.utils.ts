import type { AssignmentDto } from "@/types/dto/assignments";

export const calculateAssignmentTotals = (assignment: AssignmentDto | null | undefined) => {
  const questions = assignment?.questions ?? [];
  const totalScore = questions.reduce((sum, question) => sum + question.score, 0);

  return {
    totalQuestions: questions.length,
    totalScore,
  };
};
