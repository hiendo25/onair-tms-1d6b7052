import { PostgrestSingleResponse } from "@supabase/supabase-js";

import { Database, Tables } from "@/types/supabase.types";
export type Employee = Tables<"employees">;
export type EmployeeType = Database["public"]["Enums"]["employee_type"];
export type EmployeeStudentWithProfileItem = {
  id: string;
  employee_code: string;
  status: "active" | "inactive";
  employee_type: "student";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employee_departments: {
    id: string;
    department_id: string;
    departments: {
      id: string;
      name: string;
      branch_id: string | null;
    } | null;
  }[];
  employee_branches: {
    id: string;
    branch_id: string;
    branches: {
      id: string;
      name: string;
    } | null;
  }[];
};

export type EmployeeTeacherTypeItem = {
  id: string;
  employee_code: string;
  employee_type: "teacher";
  status: "active" | "inactive";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employee_departments: {
    id: string;
    department_id: string;
    departments: {
      id: string;
      name: string;
      branch_id: string | null;
      branches: {
        id: string;
        name: string;
      } | null;
    } | null;
  }[];
  employee_branches: {
    id: string;
    branch_id: string;
    branches: {
      id: string;
      name: string;
    } | null;
  }[];
};

export type EmployeeWithOrganizationItem = {
  id: string;
  employee_code: string;
  employee_type: "teacher";
  status: "active" | "inactive";
  profiles: {
    id: string;
    full_name: string;
    gender: "male" | "female" | "other";
    avatar: string | null;
    email: string;
  };
  employee_departments: {
    id: string;
    department_id: string;
    departments: {
      id: string;
      name: string;
      branch_id: string | null;
    } | null;
  }[];
  employee_branches: {
    id: string;
    branch_id: string;
    branches: {
      id: string;
      name: string;
    } | null;
  }[];
};
export type EmployeeWithProfileListResponse = PostgrestSingleResponse<EmployeeStudentWithProfileItem[]>;
export type EmployeeTeacherTypeListResponse = PostgrestSingleResponse<EmployeeTeacherTypeItem[]>;
