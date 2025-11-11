import { Database } from "@/types/supabase.types";
import { QuestionOption } from "./question-option.dto";
import { FileMetadata } from "./file-metadata.dto";

type QuestionType = Database["public"]["Enums"]["question_type"];
type AssignmentResultStatus = Database["public"]["Enums"]["assignment_result_status"];

export interface QuestionGradeDetail {
  id: string;
  label: string;
  type: QuestionType;
  maxScore: number;
  options?: QuestionOption[];
  attachments?: string[];
  answer: {
    files?: FileMetadata[];
    text?: string;
    selectedOptionId?: string;
    selectedOptionIds?: string[];
  };
  answerAttachments?: FileMetadata[];
  earnedScore: number | null;
  isAutoGraded: boolean;
  feedback?: string;
}

export interface SubmissionDetailDto {
  resultId: string;
  assignmentId: string;
  assignmentName: string;
  assignmentDescription: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  avatar: string | null;
  submittedAt: string;
  status: AssignmentResultStatus;
  totalScore: number | null;
  maxScore: number;
  questions: QuestionGradeDetail[];
  feedback: string | null;
}

