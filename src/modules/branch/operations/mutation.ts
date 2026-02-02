import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { client } from "@/lib/api";
import { useTMutation } from "@/lib/queryClient";
import { BranchStatus } from "@/model/branches.model";
import type { ImportBranchesDto, UpdateBranchDto } from "@/types/dto/branches";
import { CreateBranchPayload, CreateBranchResponse, UpdateBranchPayload } from "../type";

export const useCreateBranchMutation = () => {
  return useTMutation({
    mutationFn: async (payload: CreateBranchPayload) => {
      const data = await client.post<CreateBranchResponse>("branches", payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useUpdateBranchMutation = () => {
  return useTMutation({
    mutationFn: async (payload: UpdateBranchPayload) => {
      const data = await client.put<CreateBranchResponse>(`branches/${payload.id}`, payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useToggleBranchStatusMutation = () => {
  return useTMutation({
    mutationFn: async (payload: { status: Extract<BranchStatus, "active" | "inactive">; id: string }) => {
      const data = await client.put<CreateBranchResponse>(`branches/${payload.id}/status`, payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
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
