import { HttpResponse } from "@/lib/api/http-status";
import { GetEmployeesInput, GetEmployeesResult } from "@/services/employees/employee.dto";

export type GetEmployeesQueryParams = GetEmployeesInput;
export type GetEmployeesResponse = HttpResponse<GetEmployeesResult>;
