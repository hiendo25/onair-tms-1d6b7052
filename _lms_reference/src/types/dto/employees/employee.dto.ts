import { Database } from "@/types/supabase.types";

export type EmployeeStatus = Database["public"]["Enums"]["employee_status"];

export class EmployeeDto {
  id!: string;
  employee_code!: string;
  start_date!: string | null;
  position_id!: string | null;
  employee_type!: Database["public"]["Enums"]["employee_type"] | null;
  user_id!: string;
  created_at!: string;
  status!: EmployeeStatus;
  profiles!: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    gender: Database["public"]["Enums"]["gender"];
    birthday: string | null;
    avatar: string | null;
  } | null;
  positions!: {
    id: string;
    title: string;
  } | null;
  employee_branches!: Array<{
    id: string;
    branch_id: string;
    created_at: string;
    branches: {
      id: string;
      name: string;
      code: string;
      address: string;
    } | null;
  }>;
  employee_departments!: Array<{
    id: string;
    department_id: string;
    created_at: string;
    departments: {
      id: string;
      name: string;
      branch_id: string | null;
    } | null;
  }>;
  managers_employees!: Array<{
    manager_id: string;
  }>;
  role_ids!: string[];
}
