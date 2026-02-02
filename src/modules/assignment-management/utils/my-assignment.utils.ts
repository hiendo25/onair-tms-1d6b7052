import type { MyAssignmentDto } from "@/types/dto/assignments";

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
