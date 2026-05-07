import type { AssignmentBankQuestionInput } from "./create-assignment-bank.dto";

export class UpdateAssignmentBankDto {
  id!: string;
  assignment!: {
    name: string;
    description: string;
    durationMinutes: number | null;
    passScore: number;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    hideCorrectAnswers: boolean;
    questions: AssignmentBankQuestionInput[];
    categoryIds?: string[];
  };
}
