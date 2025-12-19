import { useTQuery } from "@/lib/queryClient";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
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

async function fetchLearningPaths(
  params: UseGetLearningPathsParams,
  organizationId: string
): Promise<LearningPathsListResponse> {
  const { page = 1, limit = 10, search } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  const response = await fetch(`/api/learning-paths?${queryParams.toString()}`, {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch learning paths");
  }

  return response.json();
}

export function useGetLearningPathsQuery(params: UseGetLearningPathsParams) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<LearningPathsListResponse>({
    queryKey: LEARNING_PATHS_KEYS.list(params),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      return fetchLearningPaths(params, organizationId);
    },
    enabled: !!organizationId,
  });
}

