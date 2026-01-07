import { useTQuery } from "@/lib/queryClient";
import type {
  HighlightPhaseSummary,
  LearningPathPhaseDetailViewData,
  LearningPathProgressSummary,
  PhaseTimelineItem,
} from "@/modules/learning-paths/types";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import type { LearningPathWithCounts, LearningPathWithDetails } from "@/repository/learning-paths";
import type { ProgressResponse } from "@/types/progress.types";

import { LEARNING_PATHS_KEYS } from "./keys";

const EMPTY_QUERY_ID = "unknown";

const getErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errorData: unknown = await response.json();

    if (errorData && typeof errorData === "object") {
      const errorRecord = errorData as Record<string, unknown>;
      const message = errorRecord.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
      const errorMessage = errorRecord.error;
      if (typeof errorMessage === "string" && errorMessage.trim()) {
        return errorMessage;
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
};

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
    const message = await getErrorMessage(response, "Failed to fetch learning paths");
    throw new Error(message);
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
    const message = await getErrorMessage(response, "Failed to fetch learning path");
    throw new Error(message);
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
    const message = await getErrorMessage(response, "Failed to fetch current learning path");
    throw new Error(message);
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

export interface CurrentLearningPathSummaryResponse {
  success: boolean;
  data: {
    learningPath: LearningPathWithDetails | null;
    timelineItems: PhaseTimelineItem[];
    progressSummary: LearningPathProgressSummary | null;
    highlightPhaseSummary: HighlightPhaseSummary | null;
  };
}

async function fetchCurrentLearningPathSummary(organizationId: string): Promise<CurrentLearningPathSummaryResponse> {
  const response = await fetch("/api/learning-paths/current/summary", {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to fetch current learning path summary");
    throw new Error(message);
  }

  return response.json();
}

export function useGetCurrentLearningPathSummary(options?: UseGetCurrentLearningPathOptions) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<CurrentLearningPathSummaryResponse>({
    queryKey: LEARNING_PATHS_KEYS.currentSummary(),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }
      return fetchCurrentLearningPathSummary(organizationId);
    },
    enabled: !!organizationId && (options?.enabled ?? true),
  });
}
// --------------
async function fetchPhaseProgress(
  phaseId: string,
  organizationId: string
): Promise<ProgressResponse> {
  const response = await fetch(`/api/phases/${phaseId}/progress`, {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to fetch phase progress");
    throw new Error(message);
  }

  return response.json();
}

export interface UseGetPhaseProgressOptions {
  enabled?: boolean;
}

export function useGetPhaseProgress(
  phaseId: string | null | undefined,
  options?: UseGetPhaseProgressOptions
) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<ProgressResponse>({
    queryKey: phaseId ? LEARNING_PATHS_KEYS.phaseProgress(phaseId) : LEARNING_PATHS_KEYS.phaseProgress(EMPTY_QUERY_ID),
    queryFn: () => {
      if (!phaseId || !organizationId) {
        throw new Error("Phase ID or organization ID not found");
      }
      return fetchPhaseProgress(phaseId, organizationId);
    },
    enabled: !!phaseId && !!organizationId && (options?.enabled ?? true),
  });
}

async function fetchClassRoomsProgress(
  classRoomIds: string[],
  learningPathId: string | null | undefined,
  organizationId: string
): Promise<ProgressResponse[]> {
  const queryParams = learningPathId
    ? `?${new URLSearchParams({ learningPathId }).toString()}`
    : "";

  const responses = await Promise.all(
    classRoomIds.map(async (classRoomId) => {
      const response = await fetch(`/api/class-rooms/${classRoomId}/progress${queryParams}`, {
        headers: {
          "x-organization-id": organizationId,
        },
      });

      if (!response.ok) {
        const message = await getErrorMessage(response, "Failed to fetch class room progress");
        throw new Error(message);
      }

      return response.json() as Promise<ProgressResponse>;
    })
  );

  return responses;
}

export interface UseGetClassRoomsProgressOptions {
  enabled?: boolean;
}

export function useGetClassRoomsProgress(
  classRoomIds: string[],
  learningPathId?: string | null,
  options?: UseGetClassRoomsProgressOptions
) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<ProgressResponse[]>({
    queryKey: LEARNING_PATHS_KEYS.classRoomsProgress({ ids: classRoomIds, learningPathId }),
    queryFn: () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      if (!classRoomIds.length) {
        return Promise.resolve([]);
      }

      return fetchClassRoomsProgress(classRoomIds, learningPathId, organizationId);
    },
    enabled: !!organizationId && classRoomIds.length > 0 && (options?.enabled ?? true),
  });
}

export interface PhaseDetailResponse {
  success: boolean;
  data: LearningPathPhaseDetailViewData;
}

async function fetchPhaseDetail(
  phaseId: string,
  organizationId: string
): Promise<PhaseDetailResponse> {
  const response = await fetch(`/api/phases/${phaseId}`, {
    headers: {
      "x-organization-id": organizationId,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to fetch phase detail");
    throw new Error(message);
  }

  return response.json();
}

export interface UseGetPhaseByIdOptions {
  enabled?: boolean;
}

export function useGetPhaseById(
  phaseId: string | null | undefined,
  options?: UseGetPhaseByIdOptions
) {
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;

  return useTQuery<PhaseDetailResponse>({
    queryKey: phaseId ? LEARNING_PATHS_KEYS.phaseDetail(phaseId) : LEARNING_PATHS_KEYS.phaseDetail(EMPTY_QUERY_ID),
    queryFn: () => {
      if (!phaseId || !organizationId) {
        throw new Error("Phase ID or organization ID not found");
      }
      return fetchPhaseDetail(phaseId, organizationId);
    },
    enabled: !!phaseId && !!organizationId && (options?.enabled ?? true),
  });
}
