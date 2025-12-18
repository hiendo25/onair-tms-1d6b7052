import { useTQuery } from "@/lib/queryClient";
import * as employeeService from "@/services/employees/employee.service";
import type { GetEmployeesParams } from "@/types/dto/employees";

import { GET_EMPLOYEES } from "./key";

export const useGetEmployeesQuery = (params?: GetEmployeesParams) => {
  return useTQuery({
    queryKey: [GET_EMPLOYEES, params],
    queryFn: () => employeeService.getEmployees(params),
  });
};

export const useGetEmployeeQuery = (id: string) => {
  return useTQuery({
    queryKey: [GET_EMPLOYEES, id],
    queryFn: () => employeeService.getEmployeeById(id),
    enabled: !!id,
  });
};