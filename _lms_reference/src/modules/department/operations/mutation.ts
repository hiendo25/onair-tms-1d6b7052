import { boolean } from "zod";

import { client } from "@/lib/api";
import { useTMutation } from "@/lib/queryClient";
import type { ImportDepartmentsDto } from "@/types/dto/departments";
import {
  CreateChildDepartmentPayload,
  CreateDepartmentResponse,
  CreateRootDepartmentPayload,
  UpdateChildDepartmentPayload,
  UpdateDepartmentResponse,
  UpdateRootDepartmentPayload,
} from "../type";

export const useDeleteDepartmentMutation = () => {
  return useTMutation({
    mutationFn: async (departmentId: string) => {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete department");
      }

      return response.json();
    },
  });
};

export const useImportDepartmentsMutation = () => {
  return useTMutation({
    mutationFn: async (payload: ImportDepartmentsDto) => {
      const response = await fetch("/api/departments/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import departments");
      }

      return response.json();
    },
  });
};

export const useCreateDepartmentMutation = ({ isRoot = false }: { isRoot?: boolean }) => {
  return useTMutation({
    mutationFn: async (payload: CreateRootDepartmentPayload | CreateChildDepartmentPayload) => {
      const data = await client.post<CreateDepartmentResponse>("departments", payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useUpdateDepartmentMutation = ({ isRoot = false }: { isRoot?: boolean }) => {
  return useTMutation({
    mutationFn: async ({ id, ...payload }: UpdateRootDepartmentPayload | UpdateChildDepartmentPayload) => {
      const data = await client.put<UpdateDepartmentResponse>(`departments/${id}`, payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};
