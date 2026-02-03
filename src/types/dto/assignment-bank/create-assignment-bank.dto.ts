export type AssignmentBankQuestionInput = {
  questionId: string;
  orderIndex: number;
  scoreOverride?: number | null;
};

export class CreateAssignmentBankDto {
  name!: string;
  description!: string;
  durationMinutes!: number | null;
  passScore!: number;
  shuffleQuestions!: boolean;
  shuffleAnswers!: boolean;
  hideCorrectAnswers!: boolean;
  questions!: AssignmentBankQuestionInput[];
  organizationId!: string;
  categoryIds?: string[];
}
