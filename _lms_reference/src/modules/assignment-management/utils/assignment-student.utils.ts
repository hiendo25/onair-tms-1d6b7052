import type {
  AssignmentStudentDto,
  AssignmentStudentProgressStatus,
  AssignmentStudentSummaryDto,
} from "@/types/dto/assignments";

const COMPLETED_STATUSES = new Set<AssignmentStudentDto["status"]>(["submitted", "graded"]);
export type AssignmentStudentResultStatus = "pass" | "fail" | "none";
export type AssignmentStudentGradingStatus = "graded" | "submitted" | "not_submitted";

export const getStudentProgressStatus = (student: AssignmentStudentDto): AssignmentStudentProgressStatus => {
  if (!student.status) {
    return "not_started";
  }
  if (student.status === "in_progress") {
    return "in_progress";
  }
  return COMPLETED_STATUSES.has(student.status) ? "completed" : "not_started";
};

export const buildAssignmentStudentSummary = (students: AssignmentStudentDto[]): AssignmentStudentSummaryDto => {
  return students.reduce<AssignmentStudentSummaryDto>(
    (acc, student) => {
      const status = getStudentProgressStatus(student);
      if (status === "completed") {
        acc.completed_count += 1;
      } else if (status === "in_progress") {
        acc.in_progress_count += 1;
      } else {
        acc.not_started_count += 1;
      }
      return acc;
    },
    {
      total_students: students.length,
      completed_count: 0,
      in_progress_count: 0,
      not_started_count: 0,
    },
  );
};

export const getStudentResultStatus = (
  student: AssignmentStudentDto,
  passScore: number | null,
): AssignmentStudentResultStatus => {
  if (student.score === null || passScore === null) {
    return "none";
  }
  return student.score >= passScore ? "pass" : "fail";
};

export const getStudentGradingStatus = (student: AssignmentStudentDto): AssignmentStudentGradingStatus => {
  if (student.status === "graded") {
    return "graded";
  }
  if (student.has_submitted) {
    return "submitted";
  }
  return "not_submitted";
};

export const getStudentScoreLabel = (student: AssignmentStudentDto): string => {
  if (student.max_score !== null) {
    return `${student.score ?? "--"}/${student.max_score}`;
  }
  if (student.score !== null) {
    return `${student.score}`;
  }
  return "-";
};
