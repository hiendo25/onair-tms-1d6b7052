import { useTQuery } from "@/lib/queryClient";
import { GET_ASSIGNMENTS, GET_QUESTION_BANK } from "@/modules/assignment-management/operations/key";
import { assignmentResultsRepository, assignmentsRepository } from "@/repository";
import { GetAssignmentsQueryParams } from "@/repository/assignments/type";
import * as assignmentService from "@/services/assignments/assignment.service";
import * as questionBankService from "@/services/assignments/question-bank.service";
import type {
  AssignmentDto,
  AssignmentQuestionDto,
  AssignmentStudentDto,
  GetAssignmentsParams,
  GetMyAssignmentsParams,
  MyAssignmentDto,
  SubmissionDetailDto,
} from "@/types/dto/assignments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";
import type { GetQuestionBankParams, QuestionBankDto, QuestionBankSummaryDto } from "@/types/dto/question-bank";

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
      if (params?.organizationId) {
        searchParams.set("organizationId", params?.organizationId);
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
  enabled: boolean = true,
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
      if (params?.organizationId) {
        searchParams.set("organizationId", params.organizationId);
      }

      const response = await fetch(`/api/my-assignments?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch my assignments");
      }
      return response.json();
    },
  });
};

export const useGetAssignmentsV2Query = (variables?: { queryParams: GetAssignmentsQueryParams; enabled?: boolean }) => {
  const { queryParams, enabled = true } = variables || {};
  return useTQuery({
    queryKey: [GET_ASSIGNMENTS, queryParams],
    queryFn: async () => {
      return await assignmentsRepository.getAssignmentsV2(queryParams);
    },
    enabled,
  });
};

export const useGetQuestionBankQuery = (params?: GetQuestionBankParams) => {
  return useTQuery<PaginatedResult<QuestionBankDto>>({
    queryKey: [GET_QUESTION_BANK, params],
    queryFn: async () => {
      return questionBankService.getQuestionBank(params);
    },
    enabled: !!params?.organizationId,
  });
};

export const useGetQuestionBankByIdQuery = (questionId: string, organizationId?: string) => {
  return useTQuery<QuestionBankDto | null>({
    queryKey: [GET_QUESTION_BANK, questionId, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return null;
      }

      const question = await questionBankService.getQuestionBankById(questionId, organizationId);

      if (!question) {
        throw new Error("Question not found");
      }

      return question;
    },
    enabled: !!questionId && !!organizationId,
  });
};

export const useGetQuestionBankSummaryQuery = (organizationId?: string) => {
  return useTQuery<QuestionBankSummaryDto>({
    queryKey: [GET_QUESTION_BANK, "summary", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return {
          total: 0,
          multipleChoice: 0,
          trueFalse: 0,
          essay: 0,
          file: 0,
          order: 0,
          matching: 0,
        };
      }

      return questionBankService.getQuestionBankSummary(organizationId);
    },
    enabled: !!organizationId,
  });
};
