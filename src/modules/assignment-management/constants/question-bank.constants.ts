import type { QuestionBankSummaryDto } from "@/types/dto/question-bank";

export const DEFAULT_QUESTION_BANK_SUMMARY: QuestionBankSummaryDto = {
  total: 0,
  multipleChoice: 0,
  trueFalse: 0,
  essay: 0,
  file: 0,
  order: 0,
  matching: 0,
};
