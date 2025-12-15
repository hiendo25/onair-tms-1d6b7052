import { useTMutation } from "@/lib/queryClient";
import type { CreateDepartmentDto, ImportDepartmentsDto, UpdateDepartmentDto } from "@/types/dto/departments";

export const useCreateDepartmentMutation = () => {
  return useTMutation({
    mutationFn: async (payload: CreateDepartmentDto) => {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create department");
      }

      return response.json();
    },
  });
};

export const useUpdateDepartmentMutation = () => {
  return useTMutation({
    mutationFn: async (payload: UpdateDepartmentDto) => {
      const response = await fetch(`/api/departments/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update department");
      }

      return response.json();
    },
  });
};

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
