import { Database } from "@/types/supabase.types";

export class EmployeeImportData {
  employee_code!: string;
  full_name!: string;
  email!: string;
  phone_number?: string;
  gender!: Database["public"]["Enums"]["gender"];
  birthday?: string;
  department!: string;
  department_name?: string;
  branch?: string;
  branch_name?: string;
  start_date?: string;
  employee_type!: Database["public"]["Enums"]["employee_type"];
  role_code?: string;
}

export class InvalidEmployeeRecord {
  row!: number;
  data!: any;
  errors!: string[];
  fieldErrors!: Record<string, string>;
}

export class ImportEmployeesDto {
  file!: File;
}

export class ImportEmployeesResultDto {
  successCount!: number;
  failedCount!: number;
  errors!: Array<{
    row: number;
    employeeCode: string;
    error: string;
  }>;
}
