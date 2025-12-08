import { Database } from "@/types/supabase.types";

export class EmployeeDto {
  id!: string;
  employee_code!: string;
  start_date!: string | null;
  position_id!: string | null;
  employee_type!: Database["public"]["Enums"]["employee_type"] | null;
  user_id!: string;
  created_at!: string;
  status!: Database["public"]["Enums"]["employee_status"];
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
  employments!: Array<{
    id: string;
    organization_unit_id: string;
    organization_units: {
      id: string;
      name: string;
      type: Database["public"]["Enums"]["organization_unit_type"];
    } | null;
  }>;
  managers_employees!: Array<{
    manager_id: string;
  }>;
  role_ids!: string[];
}
