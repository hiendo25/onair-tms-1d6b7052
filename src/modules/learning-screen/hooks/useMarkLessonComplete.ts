import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { LEARNING_COURSE_OUTLINE_QUERY_KEY } from "@/modules/learning-screen/operations/query";
import type { MarkCompletedRequest, MarkCompletedResponse } from "@/types/dto/lesson-progress";

interface UseMarkLessonCompleteParams {
  courseId: string | null;
  learningPathId?: string | null;
  employeeId: string | null;
}

const markLessonComplete = async (
  request: MarkCompletedRequest
): Promise<MarkCompletedResponse> => {
  const response = await fetch("/api/lesson-progress/mark-completed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to mark lesson as completed");
  }

  return response.json();
};

export const useMarkLessonComplete = ({
  courseId,
  learningPathId,
  employeeId,
}: UseMarkLessonCompleteParams) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: markLessonComplete,
    onSuccess: (data) => {
      console.log("[useMarkLessonComplete] Mark complete successful:", data);

      // Invalidate and refetch course outline query to refresh progress
      if (courseId && employeeId) {
        const queryKey = [
          LEARNING_COURSE_OUTLINE_QUERY_KEY,
          {
            courseId,
            includeProgress: true,
            learningPathId: learningPathId ?? null,
            employeeId,
          },
        ];

        console.log("[useMarkLessonComplete] Invalidating query with key:", queryKey);
        console.log("[useMarkLessonComplete] Current queries in cache:",
          queryClient.getQueryCache().getAll().map(q => ({
            queryKey: q.queryKey,
            state: q.state.status
          }))
        );

        // Invalidate all course outline queries
        queryClient.invalidateQueries({
          queryKey: [LEARNING_COURSE_OUTLINE_QUERY_KEY],
        });

        // Also force refetch all active course outline queries
        queryClient.refetchQueries({
          queryKey: [LEARNING_COURSE_OUTLINE_QUERY_KEY],
          type: 'active',
        });
      }
    },
    onError: (error) => {
      console.error("[useMarkLessonComplete] Error:", error);
    },
  });

  const markComplete = useCallback(
    (lessonId: string, currentPositionSeconds?: number) => {
      mutation.mutate({
        lessonId,
        learningPathId: learningPathId ?? null,
        currentPositionSeconds,
      });
    },
    [learningPathId, mutation]
  );

  return {
    markComplete,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};
