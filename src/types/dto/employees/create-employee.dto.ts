import { Database } from "@/types/supabase.types";

export class CreateEmployeeDto {
  email!: string;
  full_name!: string;
  phone_number?: string;
  gender!: Database["public"]["Enums"]["gender"];
  birthday?: string | null;
  branch?: string;
  department!: string;
  employee_code?: string;
  manager_id!: string;
  position_id?: string;
  employee_type!: Database["public"]["Enums"]["employee_type"];
  start_date!: string;
  role_id!: string;
  organizationId!: string;
}
