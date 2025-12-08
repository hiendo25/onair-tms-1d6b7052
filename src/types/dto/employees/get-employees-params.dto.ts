import { PaginationParams } from "../pagination.dto";
import { Database } from "@/types/supabase.types";

export class GetEmployeesParams extends PaginationParams {
  search?: string;
  departmentId?: string;
  branchId?: string;
  status?: Database["public"]["Enums"]["employee_status"];
  employeeType?: Database["public"]["Enums"]["employee_type"];
}

