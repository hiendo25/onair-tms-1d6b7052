import { useTMutation } from "@/lib/queryClient";
import type {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SaveGradeDto,
  SaveGradeResponse,
} from "@/types/dto/assignments";
import { useQueryClient } from "@tanstack/react-query";
import { GET_ASSIGNMENTS } from "./key";

export const useCreateAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: CreateAssignmentDto) => {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
    },
  });
};

export const useUpdateAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: UpdateAssignmentDto) => {
      const response = await fetch(`/api/assignments/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
    },
  });
};

export const useDeleteAssignmentMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete assignment");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS] });
    },
  });
};

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
      queryClient.invalidateQueries({ queryKey: [GET_ASSIGNMENTS, variables.assignmentId, "grade", variables.employeeId] });
    },
  });
};
