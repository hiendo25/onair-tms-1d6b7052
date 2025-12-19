import { useQueryClient } from "@tanstack/react-query";

import { useTMutation } from "@/lib/queryClient";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import type { LearningPathFormSchema } from "../learning-path-form.schema";

import { LEARNING_PATHS_KEYS } from "./keys";

interface CreateLearningPathResponse {
  success: boolean;
  message: string;
  learning_path_id: string;
}

async function createLearningPath(
  data: LearningPathFormSchema,
  organizationId: string
): Promise<CreateLearningPathResponse> {
  const response = await fetch("/api/learning-paths", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-organization-id": organizationId,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create learning path");
  }

  return response.json();
}

export function useCreateLearningPathMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUserOrganization((state) => state.data);
  const organizationId = organization?.id;

  return useTMutation({
    mutationFn: (data: LearningPathFormSchema) => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      return createLearningPath(data, organizationId);
    },
    onSuccess: () => {
      // Invalidate all learning paths queries to refetch the list
      queryClient.invalidateQueries({
        queryKey: LEARNING_PATHS_KEYS.lists(),
      });
    },
  });
}

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

