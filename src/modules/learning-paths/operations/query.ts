import { useTQuery } from "@/lib/queryClient";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import type { LearningPathWithCounts, LearningPathWithDetails } from "@/repository/learning-paths";

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

export interface LearningPathDetailResponse {
  success: boolean;
  data: LearningPathWithDetails;
}

async function fetchLearningPath(
  id: string,
  organizationId: string
): Promise<LearningPathDetailResponse> {
  const response = await fetch(`/api/learning-paths/${id}`, {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch learning path");
  }

  return response.json();
}

export function useGetLearningPathQuery(id: string) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<LearningPathDetailResponse>({
    queryKey: LEARNING_PATHS_KEYS.detail(id),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      return fetchLearningPath(id, organizationId);
    },
    enabled: !!organizationId && !!id,
  });
}

export interface CurrentLearningPathResponse {
  success: boolean;
  data: LearningPathWithDetails | null;
}

async function fetchCurrentLearningPath(organizationId: string): Promise<CurrentLearningPathResponse> {
  const response = await fetch("/api/learning-paths/current", {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch current learning path");
  }

  return response.json();
}

export interface UseGetCurrentLearningPathOptions {
  enabled?: boolean;
}

export function useGetCurrentLearningPath(options?: UseGetCurrentLearningPathOptions) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<CurrentLearningPathResponse>({
    queryKey: LEARNING_PATHS_KEYS.current(),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      return fetchCurrentLearningPath(organizationId);
    },
    enabled: !!organizationId && (options?.enabled ?? true),
  });
}

