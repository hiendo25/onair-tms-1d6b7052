import { useMemo } from "react";

import { useTQuery } from "@/lib/queryClient";
import type { ClassRoomExamSummaryResult } from "@/services/class-room/class-room-exam-summary.service";

interface UseClassRoomExamSummaryParams {
  classRoomId?: string;
  assignmentConfigIds?: string[];
  enabled?: boolean;
}

const buildQueryParams = (assignmentConfigIds: string[]) => {
  const params = new URLSearchParams();
  if (assignmentConfigIds.length > 0) {
    params.set("assignmentConfigIds", assignmentConfigIds.join(","));
  }
  return params.toString();
};

export const useClassRoomExamSummary = (params: UseClassRoomExamSummaryParams) => {
  const { classRoomId, assignmentConfigIds = [], enabled = true } = params;

  const queryParams = useMemo(
    () => buildQueryParams(assignmentConfigIds),
    [assignmentConfigIds],
  );

  return useTQuery<ClassRoomExamSummaryResult>({
    queryKey: ["class-room-exam-summary", classRoomId, assignmentConfigIds],
    queryFn: async () => {
      const response = await fetch(
        `/api/class-rooms/${classRoomId}/exams/summary${queryParams ? `?${queryParams}` : ""}`,
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to fetch class room exam summary");
      }

      return response.json();
    },
    enabled: Boolean(classRoomId) && enabled && assignmentConfigIds.length > 0,
  });
};
