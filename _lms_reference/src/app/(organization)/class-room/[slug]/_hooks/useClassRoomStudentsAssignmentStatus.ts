import { useMemo } from "react";

import { useTQuery } from "@/lib/queryClient";
import type {
  ClassRoomStudentAssignmentStatusItem,
} from "@/services/class-room/class-room-students-assignment-status.service";

interface UseClassRoomStudentsAssignmentStatusParams {
  classRoomId?: string;
  assignmentConfigId?: string;
  employeeIds?: string[];
  enabled?: boolean;
}

export interface ClassRoomStudentsAssignmentStatusResponse {
  assignmentConfigId: string;
  assignmentBankId: string | null;
  assignmentName: string | null;
  passScore: number | null;
  totalScore: number;
  students: ClassRoomStudentAssignmentStatusItem[];
}

const buildQueryParams = (assignmentConfigId: string, employeeIds: string[]) => {
  const params = new URLSearchParams();
  params.set("assignmentConfigId", assignmentConfigId);
  if (employeeIds.length > 0) {
    params.set("employeeIds", employeeIds.join(","));
  }
  return params.toString();
};

export const useClassRoomStudentsAssignmentStatus = (
  params: UseClassRoomStudentsAssignmentStatusParams,
) => {
  const { classRoomId, assignmentConfigId, employeeIds = [], enabled = true } = params;

  const queryParams = useMemo(() => {
    if (!assignmentConfigId) {
      return "";
    }
    return buildQueryParams(assignmentConfigId, employeeIds);
  }, [assignmentConfigId, employeeIds]);

  return useTQuery<ClassRoomStudentsAssignmentStatusResponse>({
    queryKey: ["class-room-students-assignment-status", classRoomId, assignmentConfigId, employeeIds],
    queryFn: async () => {
      const response = await fetch(
        `/api/class-rooms/${classRoomId}/students/assignments?${queryParams}`,
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to fetch class room students assignment status");
      }

      return response.json();
    },
    enabled: Boolean(classRoomId) && Boolean(assignmentConfigId) && enabled && employeeIds.length > 0,
  });
};
