import type { QuestionType } from "@/modules/assignment-management/constants/question.constants";
import type { MatchingMapping } from "@/types/dto/assignments/create-assignment.dto";
import type { FileMetadata } from "@/types/dto/assignments";

export interface QuestionAnswer {
  questionId: string;
  questionType: QuestionType;
  files?: File[];
  textAnswer?: string;
  radioAnswer?: string;
  checkboxAnswers?: string[];
  matchingMappings?: MatchingMapping[];
  orderedItems?: Array<{ id: string; position: number }>;
  trueFalseAnswer?: boolean;
  attachments?: File[];
}

export interface SubmissionFormData {
  answers: QuestionAnswer[];
}

export type AnswerValue =
  | string
  | string[]
  | FileMetadata[]
  | MatchingMapping[]
  | Array<{ id: string; position: number }>
  | boolean;

export interface ProcessedAnswer {
  questionId: string;
  answer: AnswerValue | null;
  attachments?: FileMetadata[];
}

export interface AnswerValidationResult {
  isEmpty: boolean;
  isComplete: boolean;
  errorMessage?: string;
}
