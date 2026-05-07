import { useMemo } from "react";

import { useTQuery } from "@/lib/queryClient";
import type { ClassRoomStudentAssignmentsStatusResult } from "@/services/class-room/class-room-students-assignment-status.service";

interface UseClassRoomStudentAssignmentsStatusParams {
  classRoomId?: string;
  employeeId?: string;
  assignmentConfigIds?: string[];
  enabled?: boolean;
}

const buildQueryParams = (employeeId: string, assignmentConfigIds: string[]) => {
  const params = new URLSearchParams();
  params.set("employeeId", employeeId);
  if (assignmentConfigIds.length > 0) {
    params.set("assignmentConfigIds", assignmentConfigIds.join(","));
  }
  return params.toString();
};

export const useClassRoomStudentAssignmentsStatus = (
  params: UseClassRoomStudentAssignmentsStatusParams,
) => {
  const { classRoomId, employeeId, assignmentConfigIds = [], enabled = true } = params;

  const queryParams = useMemo(() => {
    if (!employeeId) {
      return "";
    }
    return buildQueryParams(employeeId, assignmentConfigIds);
  }, [employeeId, assignmentConfigIds]);

  return useTQuery<ClassRoomStudentAssignmentsStatusResult>({
    queryKey: ["class-room-student-assignments", classRoomId, employeeId, assignmentConfigIds],
    queryFn: async () => {
      const response = await fetch(
        `/api/class-rooms/${classRoomId}/students/assignments/batch?${queryParams}`,
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to fetch class room student assignments");
      }

      return response.json();
    },
    enabled:
      Boolean(classRoomId) &&
      Boolean(employeeId) &&
      enabled &&
      assignmentConfigIds.length > 0,
  });
};
