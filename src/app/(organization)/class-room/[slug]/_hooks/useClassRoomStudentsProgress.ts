import { useMemo } from "react";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { useTQuery } from "@/lib/queryClient";
import type { ClassRoomStudentProgressItem } from "@/services/class-room/class-room-students-progress.service";

interface UseClassRoomStudentsProgressParams {
  classRoomId?: string;
  employeeIds?: string[];
  learningPathId?: string | null;
  enabled?: boolean;
}

export interface ClassRoomStudentsProgressResponse {
  classRoomId: string;
  totalLessons: number;
  students: ClassRoomStudentProgressItem[];
}

const buildQueryParams = (employeeIds: string[], learningPathId?: string | null) => {
  const params = new URLSearchParams();
  if (employeeIds.length > 0) {
    params.set("employeeIds", employeeIds.join(","));
  }
  if (learningPathId) {
    params.set(ROUTE_QUERY_KEYS.LEARNING_PATH_ID, learningPathId);
  }
  return params.toString();
};

export const useClassRoomStudentsProgress = (params: UseClassRoomStudentsProgressParams) => {
  const { classRoomId, employeeIds = [], learningPathId, enabled = true } = params;

  const queryParams = useMemo(
    () => buildQueryParams(employeeIds, learningPathId),
    [employeeIds, learningPathId],
  );

  return useTQuery<ClassRoomStudentsProgressResponse>({
    queryKey: ["class-room-students-progress", classRoomId, employeeIds, learningPathId],
    queryFn: async () => {
      const response = await fetch(
        `/api/class-rooms/${classRoomId}/students/progress${queryParams ? `?${queryParams}` : ""}`,
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to fetch class room students progress");
      }

      return response.json();
    },
    enabled: Boolean(classRoomId) && enabled && employeeIds.length > 0,
  });
};
