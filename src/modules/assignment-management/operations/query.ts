import { useTQuery } from "@/lib/queryClient";
import type { GetAssignmentsParams, GetMyAssignmentsParams, AssignmentStudentDto, AssignmentQuestionDto, SubmissionDetailDto, MyAssignmentDto, AssignmentDto } from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import * as assignmentService from "@/services/assignments/assignment.service";
import { GET_ASSIGNMENTS } from "@/modules/assignment-management/operations/key";

export const useGetAssignmentsQuery = (params?: GetAssignmentsParams) => {
  return useTQuery<PaginatedResult<AssignmentDto>>({
    queryKey: [GET_ASSIGNMENTS, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.page !== undefined) {
        searchParams.set("page", params.page.toString());
      }
      if (params?.limit !== undefined) {
        searchParams.set("limit", params.limit.toString());
      }
      if (params?.search) {
        searchParams.set("search", params.search);
      }

      const response = await fetch(`/api/assignments?${searchParams.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch assignments");
      }
      return response.json();
    },
  });
};

export const useGetAssignmentQuery = (id: string) => {
  return useTQuery({
    queryKey: [GET_ASSIGNMENTS, id],
    queryFn: () => assignmentService.getAssignmentById(id),
    enabled: !!id,
  });
};

export const useGetAssignmentStudentsQuery = (
  assignmentId: string,
  page: number = 0,
  limit: number = 25,
  enabled: boolean = true
) => {
  return useTQuery<PaginatedResult<AssignmentStudentDto>>({
    queryKey: [GET_ASSIGNMENTS, assignmentId, "students", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/assignments/${assignmentId}/students?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assignment students");
      }
      return response.json();
    },
    enabled: !!assignmentId && enabled,
  });
};

export const useGetAssignmentQuestionsQuery = (assignmentId: string) => {
  return useTQuery<AssignmentQuestionDto[]>({
    queryKey: [GET_ASSIGNMENTS, assignmentId, "questions"],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/questions`);
      if (!response.ok) {
        throw new Error("Failed to fetch assignment questions");
      }
      return response.json();
    },
    enabled: !!assignmentId,
  });
};

export const useGetSubmissionDetailQuery = (assignmentId: string, employeeId: string) => {
  return useTQuery<SubmissionDetailDto>({
    queryKey: [GET_ASSIGNMENTS, assignmentId, "grade", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/grade/${employeeId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch submission detail");
      }
      return response.json();
    },
    enabled: !!assignmentId && !!employeeId,
  });
};

export const useGetMyAssignmentsQuery = (params?: GetMyAssignmentsParams) => {
  return useTQuery<PaginatedResult<MyAssignmentDto>>({
    queryKey: [GET_ASSIGNMENTS, "my-assignments", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.page !== undefined) {
        searchParams.set("page", params.page.toString());
      }
      if (params?.limit !== undefined) {
        searchParams.set("limit", params.limit.toString());
      }
      if (params?.search) {
        searchParams.set("search", params.search);
      }
      if (params?.status) {
        searchParams.set("status", params.status);
      }

      const response = await fetch(`/api/my-assignments?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch my assignments");
      }
      return response.json();
    },
  });
};
