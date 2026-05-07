export interface QuestionGradeInput {
  questionId: string;
  score: number;
  feedback?: string;
}

export interface SaveGradeDto {
  assignmentId: string;
  employeeId: string;
  questionGrades: QuestionGradeInput[];
  overallFeedback?: string;
}

export interface SaveGradeResponse {
  success: boolean;
  message: string;
  totalScore: number;
  maxScore: number;
}

