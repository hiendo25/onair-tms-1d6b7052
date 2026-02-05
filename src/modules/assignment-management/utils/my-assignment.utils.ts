import type { MyAssignmentDto } from "@/types/dto/assignments";

type MyAssignmentResultStatus = "late" | "pass" | "fail" | "none";

const MY_ASSIGNMENT_RESULT_LABEL: Record<MyAssignmentResultStatus, string> = {
  late: "Trễ hạn",
  pass: "Đạt",
  fail: "Chưa đạt",
  none: "-",
};

export type MyAssignmentDisplayStatus = "graded" | "in_progress" | "not_submitted" | "not_yet_started" | "submitted";

const isBeforeAvailableFrom = (availableFrom?: string | null): boolean => {
  if (!availableFrom) {
    return false;
  }
  const startMs = new Date(availableFrom).getTime();
  if (Number.isNaN(startMs)) {
    return false;
  }
  return Date.now() < startMs;
};

const isOverdue = (availableTo?: string | null, submittedAt?: string | null, now: number = Date.now()): boolean => {
  if (!availableTo) {
    return false;
  }

  const deadlineMs = new Date(availableTo).getTime();
  if (Number.isNaN(deadlineMs)) {
    return false;
  }

  if (submittedAt) {
    const submittedMs = new Date(submittedAt).getTime();
    if (Number.isNaN(submittedMs)) {
      return false;
    }
    return submittedMs > deadlineMs;
  }

  return now > deadlineMs;
};

export const getMyAssignmentDisplayStatus = (
  assignment: Pick<MyAssignmentDto, "available_from" | "has_active_attempt" | "has_submitted" | "status">,
): MyAssignmentDisplayStatus => {
  if (assignment.has_active_attempt) {
    return "in_progress";
  }
  if (!assignment.has_submitted && isBeforeAvailableFrom(assignment.available_from)) {
    return "not_yet_started";
  }
  if (assignment.status === "graded") {
    return "graded";
  }
  if (assignment.status === "submitted" || assignment.has_submitted) {
    return "submitted";
  }
  return "not_submitted";
};

export const getMyAssignmentResultStatus = (
  assignment: Pick<MyAssignmentDto, "available_to" | "submitted_at" | "status" | "score" | "pass_score">,
  now: number = Date.now(),
): MyAssignmentResultStatus => {
  if (isOverdue(assignment.available_to, assignment.submitted_at, now)) {
    return "late";
  }

  if (
    assignment.status === "graded" &&
    typeof assignment.score === "number" &&
    typeof assignment.pass_score === "number"
  ) {
    return assignment.score >= assignment.pass_score ? "pass" : "fail";
  }

  return "none";
};

export const getMyAssignmentResultLabel = (status: MyAssignmentResultStatus): string =>
  MY_ASSIGNMENT_RESULT_LABEL[status];

export type { MyAssignmentResultStatus };
