import { useTMutation } from "@/lib/queryClient";
import type { CreateBranchDto, ImportBranchesDto, UpdateBranchDto } from "@/types/dto/branches";

export const useCreateBranchMutation = () => {
  return useTMutation({
    mutationFn: async (payload: CreateBranchDto) => {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create branch");
      }

      return response.json();
    },
  });
};

export const useUpdateBranchMutation = () => {
  return useTMutation({
    mutationFn: async (payload: UpdateBranchDto) => {
      const response = await fetch(`/api/branches/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update branch");
      }

      return response.json();
    },
  });
};

export const useDeleteBranchMutation = () => {
  return useTMutation({
    mutationFn: async (branchId: string) => {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete branch");
      }

      return response.json();
    },
  });
};

export const useImportBranchesMutation = () => {
  return useTMutation({
    mutationFn: async (payload: ImportBranchesDto) => {
      const response = await fetch("/api/branches/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import branches");
      }

      return response.json();
    },
  });
};

export const useGenerateBranchCodeMutation = () => {
  return useTMutation({
    mutationFn: async (organizationId: string) => {
      const response = await fetch("/api/branches/generate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate branch code");
      }

      return response.json();
    },
  });
};
