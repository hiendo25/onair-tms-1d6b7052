import { useQueryClient } from "@tanstack/react-query";

import { useTMutation } from "@/lib/queryClient";
import * as assignmentBankService from "@/services/assignments/assignment-bank.service";
import { assignAssignmentBankToEmployeesClient } from "@/services/assignments/assignment-bank-assign.client.service";
import * as questionBankService from "@/services/assignments/question-bank.service";
import type { AssignAssignmentBankDto, CreateAssignmentBankDto, UpdateAssignmentBankDto } from "@/types/dto/assignment-bank";
import type {
  CreateAssignmentDto,
  SaveGradeDto,
  SaveGradeResponse,
  UpdateAssignmentDto,
} from "@/types/dto/assignments";
import type { CreateQuestionBankDto, UpdateQuestionBankDto } from "@/types/dto/question-bank";

import { GET_ASSIGNMENT_BANK, GET_ASSIGNMENTS, GET_QUESTION_BANK } from "./key";


// export const useCreateAssignmentMutation = () => {
//   const queryClient = useQueryClient();

//   return useTMutation({
//     mutationFn: async (payload: CreateAssignmentDto) => {
//       const response = await fetch("/api/assignments", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to create assignment");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
//     },
//   });
// };

// export const useUpdateAssignmentMutation = () => {
//   const queryClient = useQueryClient();

//   return useTMutation({
//     mutationFn: async (payload: UpdateAssignmentDto) => {
//       const response = await fetch(`/api/assignments/${payload.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to update assignment");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
//     },
//   });
// };

// export const useDeleteAssignmentMutation = () => {
//   const queryClient = useQueryClient();

//   return useTMutation({
//     mutationFn: async (assignmentId: string) => {
//       const response = await fetch(`/api/assignments/${assignmentId}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to delete assignment");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
//     },
//   });
// };

export const useSaveGradeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: SaveGradeDto) => {
      const response = await fetch(`/api/assignments/${payload.assignmentId}/grade/${payload.employeeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionGrades: payload.questionGrades, overallFeedback: payload.overallFeedback }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save grade");
      }

      return response.json() as Promise<SaveGradeResponse>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS, variables.assignmentId, "students"] });
      queryClient.invalidateQueries({
        queryKey: [GET_ASSIGNMENTS, variables.assignmentId, "grade", variables.employeeId],
      });
    },
  });
};

export const useCreateQuestionBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: CreateQuestionBankDto & { createdBy: string }) => {
      const { createdBy, ...request } = payload;
      return questionBankService.createQuestionBankQuestions(request, createdBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_QUESTION_BANK] });
    },
  });
};

export const useCreateAssignmentBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: CreateAssignmentBankDto & { createdBy: string }) => {
      const { createdBy, ...request } = payload;
      return assignmentBankService.createAssignmentBank(request, createdBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENT_BANK] });
    },
  });
};

export const useUpdateAssignmentBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: UpdateAssignmentBankDto) => {
      return assignmentBankService.updateAssignmentBank(payload.id, payload.assignment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENT_BANK] });
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENT_BANK, variables.id] });
    },
  });
};

export const useAssignAssignmentBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: AssignAssignmentBankDto) => {
      return assignAssignmentBankToEmployeesClient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
    },
  });
};

export const useDeleteAssignmentBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (assignmentId: string) => {
      return assignmentBankService.deleteAssignmentBank(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENT_BANK] });
    },
  });
};

export const useUpdateQuestionBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: UpdateQuestionBankDto) => {
      return questionBankService.updateQuestionBankQuestion(payload.id, payload.question);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_QUESTION_BANK] });
      queryClient.invalidateQueries({ queryKey: [GET_QUESTION_BANK, variables.id] });
    },
  });
};

export const useDeleteQuestionBankMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (questionId: string) => {
      return questionBankService.deleteQuestionBankQuestion(questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_QUESTION_BANK] });
    },
  });
};
