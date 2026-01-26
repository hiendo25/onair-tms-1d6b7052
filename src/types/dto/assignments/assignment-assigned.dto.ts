import { Database } from "@/types/supabase.types";

export interface AssignmentAssignedEmployeeDto {
  id: string;
  employee_code: string;
  employee_type: Database["public"]["Enums"]["employee_type"];
  profiles: {
    id: string;
    full_name: string;
    email: string;
    avatar: string | null;
  } | null;
}

export interface AssignmentAssignedDto {
  id: string;
  assignment_bank_id: string;
  attempt_limit: number | null;
  available_from: string | null;
  available_to: string | null;
  status: Database["public"]["Enums"]["test_assignment_status"];
  created_at: string;
  assignment_employees: Array<{
    employee_id: string;
    employees: AssignmentAssignedEmployeeDto | null;
  }>;
}
