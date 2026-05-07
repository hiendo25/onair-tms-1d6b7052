import { useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/api";
import { HttpError } from "@/lib/errors/HttpError";
import { useTMutation } from "@/lib/queryClient";
import type { CreateEmployeeDto, UpdateEmployeeDto } from "@/types/dto/employees";
import { CreateEmployeePayload, CreateEmployeeResponse } from "../types/create-employee.type";
import { EmployeeImportWithValidateResponse } from "../types/import-employee.type";

import { GET_EMPLOYEES } from "./key";

// export const useCreateEmployeeMutation = () => {
//   const queryClient = useQueryClient();

//   return useTMutation({
//     mutationFn: async (payload: CreateEmployeeDto) => {
//       const response = await fetch("/api/employees", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Failed to create employee");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES] });
//     },
//   });
// };

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: async (payload: CreateEmployeePayload) => {
      const data = await client.post<CreateEmployeeResponse>("/employees", payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES] });
    },
  });
};

export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (payload: UpdateEmployeeDto) => {
      const response = await fetch(`/api/employees/${payload.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES] });
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useTMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete employee");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES] });
    },
  });
};

export const useValidateImportEmployeeMutation = () => {
  return useTMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const data = await client.post<EmployeeImportWithValidateResponse>("/employees/validate", formData);
      if (!data.success) {
        throw data.error.message;
      }
      return data;
    },
    onError: () => {},
  });
};
