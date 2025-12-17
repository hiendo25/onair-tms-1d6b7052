import { useQueryClient } from "@tanstack/react-query";

import { useTMutation } from "@/lib/queryClient";

import { LEARNING_PATHS_KEYS } from "./keys";

async function deleteLearningPath(id: string): Promise<void> {
  const response = await fetch(`/api/learning-paths/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete learning path");
  }
}

export function useDeleteLearningPathMutation() {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: deleteLearningPath,
    onSuccess: () => {
      // Invalidate all learning paths queries to refetch the list
      queryClient.invalidateQueries({
        queryKey: LEARNING_PATHS_KEYS.lists(),
      });
    },
  });
}

