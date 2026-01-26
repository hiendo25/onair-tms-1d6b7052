import { HttpResponse } from "@/lib/api/http-status";
import { CreateEmployeeResult } from "@/services/employees/employee.dto";
import { CreateEmployeeInput } from "@/services/employees/employee.dto";

export interface CreateEmployeeItem extends CreateEmployeeResult {}
export interface CreateEmployeePayload extends CreateEmployeeInput {}

export type CreateEmployeeResponse = HttpResponse<CreateEmployeeItem>;
