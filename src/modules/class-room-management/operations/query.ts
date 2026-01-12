import { HEADER_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { useTQuery } from "@/lib/queryClient";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { classRoomRepository } from "@/repository";
import {
  ClassRoomRuntimeStatusFilter,
  ClassRoomStatusFilter,
  ClassRoomTypeFilter,
  ClassSessionModeFilter,
} from "@/repository/class-room";
import { type ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import {
  ClassRoomPriorityDto,
  ClassRoomSessionDetailDto,
  ClassRoomStatusCountDto,
  ClassRoomStudentDto,
} from "@/types/dto/classRooms/classRoom.dto";
import { PaginatedResult } from "@/types/dto/pagination.dto";

export interface GetClassRoomsQueryInput {
  q?: string;
  from?: string | null;
  to?: string | null;
  type?: ClassRoomTypeFilter;
  sessionMode?: ClassSessionModeFilter;
  runtimeStatus?: ClassRoomRuntimeStatusFilter;
  status?: ClassRoomStatusFilter;
  page?: number;
  limit?: number;
  organizationId?: string;
  employeeId?: string;
  orderField?: string;
  orderBy?: "asc" | "desc";
}

export interface GetAssignedClassRoomsQueryInput extends GetClassRoomsQueryInput {
  userId: string;
}

export interface GetClassRoomStatusCountsInput {
  employeeId?: string;
  q?: string;
  from?: string | null;
  to?: string | null;
  status?: ClassRoomStatusFilter;
  type?: ClassRoomTypeFilter;
  sessionMode?: ClassSessionModeFilter;
}

export interface GetClassRoomStudentsQueryInput {
  classRoomId: string;
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  departmentId?: string;
  attendanceStatus?: "attended" | "absent" | "pending";
}

export interface GetClassRoomDetailQueryOptions {
  learningPathId?: string | null;
  enabled?: boolean;
}

interface ClassRoomDetailError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string | null;
}

type GetClassRoomDetailResponse = {
  data: ClassRoomDetailWithProgress | null;
  error: ClassRoomDetailError | null;
};

const buildClassRoomProgressQuery = (learningPathId?: string | null): string => {
  if (!learningPathId) {
    return "";
  }

  const params = new URLSearchParams({
    [ROUTE_QUERY_KEYS.LEARNING_PATH_ID]: learningPathId,
  });

  return `?${params.toString()}`;
};

const buildClassRoomDetailError = (message: string): ClassRoomDetailError => ({
  message,
  details: null,
  hint: null,
  code: null,
});

const readClassRoomDetailErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (typeof payload?.error === "string") {
      return payload.error;
    }
    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }
    if (typeof payload?.message === "string") {
      return payload.message;
    }
  } catch (error) {
    console.error("[ClassRoom] Failed to parse detail error response:", error);
  }

  return "Failed to fetch class room detail with progress";
};

const fetchClassRoomDetailWithProgress = async (params: {
  slug: string;
  learningPathId?: string | null;
  organizationId: string;
}): Promise<GetClassRoomDetailResponse> => {
  const { slug, learningPathId, organizationId } = params;
  const queryParams = buildClassRoomProgressQuery(learningPathId);
  const response = await fetch(
    `/api/class-rooms/by-slug/${slug}/detail-with-progress${queryParams}`,
    {
      headers: {
        [HEADER_ORGANIZATION_ID]: organizationId,
      },
    },
  );

  if (!response.ok) {
    const message = await readClassRoomDetailErrorMessage(response);
    return {
      data: null,
      error: buildClassRoomDetailError(message),
    };
  }

  return response.json();
};

export const useGetClassRoomQuery = (slug: string, options: GetClassRoomDetailQueryOptions = {}) => {
  const { learningPathId, enabled = true } = options;
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const organizationId = currentEmployee.organization.id;
  const normalizedLearningPathId = learningPathId?.trim() ? learningPathId : null;

  return useTQuery<GetClassRoomDetailResponse>({
    queryKey: ["class-room-detail", slug, normalizedLearningPathId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      return fetchClassRoomDetailWithProgress({
        slug,
        learningPathId: normalizedLearningPathId,
        organizationId,
      });
    },
    enabled: Boolean(slug) && Boolean(organizationId) && enabled,
  });
};

export const useGetClassRoomsPriorityQuery = (input: GetClassRoomsQueryInput = {}) => {
  return useTQuery<PaginatedResult<ClassRoomPriorityDto>>({
    queryKey: [QUERY_KEYS.GET_CLASS_ROOMS, input],
    queryFn: () => classRoomRepository.getClassRooms(input),
    enabled: Boolean(input.organizationId ?? input.employeeId),
  });
};

export const useCountStatusClassRoomsQuery = (input: GetClassRoomStatusCountsInput) => {
  return useTQuery<ClassRoomStatusCountDto[]>({
    queryKey: ["class_room_status_counts", input],
    queryFn: () => classRoomRepository.getClassRoomStatusCounts(input),
    enabled: Boolean(input.employeeId),
  });
};

export const useGetClassRoomStudentsQuery = (input: GetClassRoomStudentsQueryInput) => {
  return useTQuery<PaginatedResult<ClassRoomStudentDto>>({
    queryKey: ["class-room-students", input],
    queryFn: () => classRoomRepository.getClassRoomStudents(input),
    enabled: Boolean(input?.classRoomId),
  });
};

type GetClassRoomsByEmployeeIdQueryInput = Omit<GetClassRoomsQueryInput, "organizationId"> & {
  employeeId?: string;
};

export const useGetClassRoomsByEmployeeId = (input: GetClassRoomsByEmployeeIdQueryInput) => {
  return useTQuery<PaginatedResult<ClassRoomPriorityDto>>({
    queryKey: ["class-room-assign", input],
    queryFn: () =>
      classRoomRepository.getClassRoomsByEmployeeId({
        ...input,
        employeeId: input.employeeId!,
      }),
    enabled: Boolean(input.employeeId),
  });
};

export const useGetClassRoomSessionDetailQuery = (input: { sessionId?: string }) => {
  const { sessionId } = input;

  return useTQuery<ClassRoomSessionDetailDto | null>({
    queryKey: ["class-room-session", sessionId],
    queryFn: () =>
      classRoomRepository.getClassRoomSessionDetail({
        sessionId: sessionId!,
      }),
    enabled: Boolean(sessionId),
  });
};
