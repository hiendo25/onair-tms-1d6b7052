import type { Employee } from "@/model/employee.model";

export interface GetEmployeesFilter {
  departmentId?: string;
  branchId?: string;
  status?: Employee["status"];
  employeeType?: Employee["employee_type"];
  organizationId?: string;
  from?: number;
  to?: number;
  filterField?: "name" | "code" | "email";
  filterValue?: string;
}
