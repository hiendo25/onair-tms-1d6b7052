import { useTQuery } from "@/lib/queryClient";
import type { LearningPathWithCounts } from "@/repository/learning-paths";

import { LEARNING_PATHS_KEYS } from "./keys";

export interface LearningPathsListResponse {
  success: boolean;
  data: LearningPathWithCounts[];
  total: number;
  page: number;
  limit: number;
}

export interface UseGetLearningPathsParams {
  page?: number;
  limit?: number;
  search?: string;
}

async function fetchLearningPaths(params: UseGetLearningPathsParams): Promise<LearningPathsListResponse> {
  const { page = 1, limit = 10, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  const response = await fetch(`/api/learning-paths?${queryParams.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch learning paths");
  }

  return response.json();
}

export function useGetLearningPathsQuery(params: UseGetLearningPathsParams) {
  return useTQuery<LearningPathsListResponse>({
    queryKey: LEARNING_PATHS_KEYS.list(params),
    queryFn: () => fetchLearningPaths(params),
  });
}

