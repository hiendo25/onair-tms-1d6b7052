export type AssignmentStudentProgressStatus = "completed" | "in_progress" | "not_started";

export interface GetAssignmentStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssignmentStudentProgressStatus;
}
