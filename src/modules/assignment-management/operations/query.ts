import { useTQuery } from "@/lib/queryClient";
import { DEFAULT_QUESTION_BANK_SUMMARY } from "@/modules/assignment-management/constants/question-bank.constants";
import { GET_ASSIGNMENT_BANK, GET_ASSIGNMENTS, GET_QUESTION_BANK } from "@/modules/assignment-management/operations/key";
import { assignmentsRepository } from "@/repository";
import { GetAssignmentsQueryParams } from "@/repository/assignments-config/type";
import * as assignmentService from "@/services/assignments/assignment.service";
import * as assignmentBankService from "@/services/assignments/assignment-bank.service";
import * as questionBankService from "@/services/assignments/question-bank.service";
import type { AssignmentBankDto, GetAssignmentBanksParams } from "@/types/dto/assignment-bank";
import type {
  AssignedAssignmentItemDto,
  AssignedAssignmentsSummaryDto,
  AssignmentAssignedDto,
  AssignmentAttemptSummaryDto,
  AssignmentDto,
  AssignmentQuestionDto,
  AssignmentStudentDto,
  AssignmentStudentSummaryDto,
  GetAssignedAssignmentsParams,
  GetAssignmentsParams,
  GetAssignmentStudentsParams,
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
    queryFn: () => assignmentService.getAssignmentConfigById(id),
    enabled: !!id,
  });
};

export const useGetLatestAssignmentByBankIdQuery = (assignmentBankId: string, organizationId?: string) => {
  return useTQuery<AssignmentAssignedDto | null>({
    queryKey: [GET_ASSIGNMENTS, "assignment-bank", assignmentBankId, organizationId],
    queryFn: () => assignmentsRepository.getLatestAssignmentByBankId(assignmentBankId, organizationId),
    enabled: !!assignmentBankId,
  });
};

export const useGetAssignmentStudentsQuery = (
  assignmentId: string,
  params?: GetAssignmentStudentsParams,
  enabled: boolean = true,
) => {
  return useTQuery<PaginatedResult<AssignmentStudentDto> & { summary: AssignmentStudentSummaryDto }>({
    queryKey: [GET_ASSIGNMENTS, assignmentId, "students", params],
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
      const response = await fetch(`/api/assignments/${assignmentId}/students?${searchParams.toString()}`);
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

export const useGetAssignmentAttemptSummaryQuery = (assignmentId: string, employeeId: string) => {
  return useTQuery<AssignmentAttemptSummaryDto>({
    queryKey: [GET_ASSIGNMENTS, assignmentId, "attempt-summary", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/submit?employeeId=${employeeId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch submission summary");
      }
      const data = await response.json();
      return data.summary as AssignmentAttemptSummaryDto;
    },
    enabled: !!assignmentId && !!employeeId,
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

export const useGetAssignedAssignmentsQuery = (params?: GetAssignedAssignmentsParams) => {
  return useTQuery<PaginatedResult<AssignedAssignmentItemDto> & { summary: AssignedAssignmentsSummaryDto }>({
    queryKey: [GET_ASSIGNMENTS, "assigned", params],
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

      const response = await fetch(`/api/assignments/assigned?${searchParams.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch assigned assignments");
      }
      return response.json();
    },
    enabled: !!params?.organizationId,
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

export const useGetAssignmentBanksQuery = (params?: GetAssignmentBanksParams) => {
  return useTQuery<PaginatedResult<AssignmentBankDto>>({
    queryKey: [GET_ASSIGNMENT_BANK, params],
    queryFn: async () => {
      return assignmentBankService.getAssignmentBanks(params);
    },
    enabled: !!params?.organizationId,
  });
};

export const useGetAssignmentBankByIdQuery = (assignmentId: string, organizationId?: string) => {
  return useTQuery<AssignmentBankDto | null>({
    queryKey: [GET_ASSIGNMENT_BANK, assignmentId, organizationId],
    queryFn: async () => {
      const assignment = await assignmentBankService.getAssignmentBankById(assignmentId, organizationId);

      if (!assignment) {
        throw new Error("Assignment bank not found");
      }

      return assignment;
    },
    enabled: !!assignmentId && !!organizationId,
  });
};

type GetQuestionBankQueryParams = GetQuestionBankParams & { withSummary?: boolean };

export const useGetQuestionBankQuery = (params?: GetQuestionBankQueryParams) => {
  const { withSummary = false, ...queryParams } = params ?? {};
  const organizationId = queryParams.organizationId;

  return useTQuery<PaginatedResult<QuestionBankDto> & { summary: QuestionBankSummaryDto }>({
    queryKey: [GET_QUESTION_BANK, queryParams, withSummary],
    queryFn: async () => {
      const [questionBank, summary] = await Promise.all([
        questionBankService.getQuestionBank(queryParams),
        withSummary && organizationId
          ? questionBankService.getQuestionBankSummary(organizationId)
          : Promise.resolve(DEFAULT_QUESTION_BANK_SUMMARY),
      ]);

      return {
        ...questionBank,
        summary,
      };
    },
    enabled: !!organizationId,
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
        return DEFAULT_QUESTION_BANK_SUMMARY;
      }

      return questionBankService.getQuestionBankSummary(organizationId);
    },
    enabled: !!organizationId,
  });
};
